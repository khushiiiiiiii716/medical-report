"""
fraud_detector.py

Detects potential fraud or tampering in uploaded medical reports.

Detection layers:
  1. Physiologically impossible values (hard limits per biomarker)
  2. Internal cross-biomarker inconsistencies (e.g., HbA1c vs glucose)
  3. Suspiciously identical / copy-pasted values across biomarkers
  4. PDF metadata tampering (creation vs modification timestamp gap)
  5. Inter-report temporal anomalies (implausible change between uploads)

Returns a FraudResult dict consumed by the API and displayed on the frontend.
"""

import os
import re
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# 1. PHYSIOLOGICAL HARD LIMITS
#    Values outside these bounds are physically impossible for living humans.
# ---------------------------------------------------------------------------
IMPOSSIBLE_RANGES = {
    "Hemoglobin":             (3.0,  25.0),
    "RBC":                    (0.5,  9.0),
    "WBC":                    (500,  100_000),
    "Platelets":              (5_000, 1_500_000),
    "Fasting Glucose":        (20,   800),
    "Postprandial Glucose":   (30,   1000),
    "HbA1c":                  (2.5,  20.0),
    "Total Cholesterol":      (30,   700),
    "HDL Cholesterol":        (5,    150),
    "LDL Cholesterol":        (10,   500),
    "Triglycerides":          (20,   3000),
    "Thyroid TSH":            (0.001, 100.0),
    "Creatinine":             (0.1,  20.0),
    "Systolic BP":            (50,   280),
    "Diastolic BP":           (30,   150),
}

# ---------------------------------------------------------------------------
# 2. CROSS-BIOMARKER CONSISTENCY RULES
#    Each rule is (biomarker_a, condition_a, biomarker_b, condition_b, message)
#    A fraud flag is raised when BOTH conditions are true simultaneously.
# ---------------------------------------------------------------------------
def _val(bio_vals, name):
    return bio_vals.get(name)

CONSISTENCY_RULES = [
    # HbA1c says normal but Fasting Glucose is diabetic
    {
        "desc": "HbA1c is normal (< 5.7 %) but Fasting Glucose is diabetic (>= 126 mg/dL) — values are internally inconsistent.",
        "check": lambda v: (
            v.get("HbA1c") is not None and v.get("Fasting Glucose") is not None
            and v["HbA1c"] < 5.7 and v["Fasting Glucose"] >= 126
        )
    },
    # HbA1c diabetic but Fasting Glucose normal
    {
        "desc": "HbA1c is in diabetic range (>= 6.5 %) but Fasting Glucose is normal (< 100 mg/dL) — values are internally inconsistent.",
        "check": lambda v: (
            v.get("HbA1c") is not None and v.get("Fasting Glucose") is not None
            and v["HbA1c"] >= 6.5 and v["Fasting Glucose"] < 100
        )
    },
    # Hemoglobin male-level but RBC extremely low
    {
        "desc": "Hemoglobin is high (> 16 g/dL) but RBC count is very low (< 2.5 million/mcL) — combination is physiologically implausible.",
        "check": lambda v: (
            v.get("Hemoglobin") is not None and v.get("RBC") is not None
            and v["Hemoglobin"] > 16.0 and v["RBC"] < 2.5
        )
    },
    # LDL higher than Total Cholesterol
    {
        "desc": "LDL Cholesterol exceeds Total Cholesterol — mathematically impossible (LDL is a sub-fraction of total cholesterol).",
        "check": lambda v: (
            v.get("LDL Cholesterol") is not None and v.get("Total Cholesterol") is not None
            and v["LDL Cholesterol"] >= v["Total Cholesterol"]
        )
    },
    # HDL higher than Total Cholesterol
    {
        "desc": "HDL Cholesterol exceeds Total Cholesterol — mathematically impossible.",
        "check": lambda v: (
            v.get("HDL Cholesterol") is not None and v.get("Total Cholesterol") is not None
            and v["HDL Cholesterol"] >= v["Total Cholesterol"]
        )
    },
    # Diastolic BP higher than Systolic BP
    {
        "desc": "Diastolic BP is higher than Systolic BP — diastolic can never exceed systolic pressure.",
        "check": lambda v: (
            v.get("Diastolic BP") is not None and v.get("Systolic BP") is not None
            and v["Diastolic BP"] >= v["Systolic BP"]
        )
    },
    # Extremely high Hemoglobin paired with normal Hematocrit-proxy RBC
    {
        "desc": "Hemoglobin is critically high (> 20 g/dL) — values at this level are not compatible with a natural state without a medical condition causing severe polycythemia, and require clinical verification.",
        "check": lambda v: (
            v.get("Hemoglobin") is not None and v["Hemoglobin"] > 20.0
        )
    },
]

# ---------------------------------------------------------------------------
# 3. DUPLICATE / COPY-PASTE DETECTION
#    If ≥ 50% of numeric values in the report share the same exact float value,
#    it strongly suggests manual data entry fraud or value duplication.
# ---------------------------------------------------------------------------
def _check_duplicate_values(biomarkers):
    flags = []
    if len(biomarkers) < 4:
        return flags

    value_counts = {}
    for bio in biomarkers:
        v = round(bio["value"], 2)
        value_counts[v] = value_counts.get(v, 0) + 1

    for val, count in value_counts.items():
        if count >= max(3, len(biomarkers) // 2):
            flags.append(
                f"Value {val} appears in {count} different biomarkers — "
                "suspected copy-paste or synthetic data entry."
            )

    return flags

# ---------------------------------------------------------------------------
# 4. PDF METADATA TAMPERING
#    Checks if the PDF was modified after creation using PyPDF metadata.
#    A large gap between /CreationDate and /ModDate can indicate post-creation edits.
# ---------------------------------------------------------------------------
def _check_pdf_metadata(file_path):
    flags = []
    if not file_path.lower().endswith(".pdf"):
        return flags

    try:
        from pypdf import PdfReader
        reader = PdfReader(file_path)
        meta = reader.metadata

        if meta is None:
            return flags

        raw_created = meta.get("/CreationDate") or meta.get("CreationDate")
        raw_modified = meta.get("/ModDate") or meta.get("ModDate")

        def parse_pdf_date(raw):
            """Parse PDF date format D:YYYYMMDDHHmmSS or ISO-like strings."""
            if raw is None:
                return None
            s = str(raw).strip()
            # PDF standard format: D:20230101120000+05'30'
            m = re.match(r"D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})", s)
            if m:
                try:
                    return datetime(
                        int(m.group(1)), int(m.group(2)), int(m.group(3)),
                        int(m.group(4)), int(m.group(5)), int(m.group(6)),
                        tzinfo=timezone.utc
                    )
                except ValueError:
                    return None
            return None

        created = parse_pdf_date(raw_created)
        modified = parse_pdf_date(raw_modified)

        if created and modified:
            gap_seconds = (modified - created).total_seconds()
            if gap_seconds > 60:   # Modified more than 1 minute after creation
                gap_minutes = int(gap_seconds // 60)
                flags.append(
                    f"PDF metadata shows the document was modified {gap_minutes} minute(s) after it was created — "
                    "possible post-creation editing detected."
                )

        # Check if the producer/creator tool is unusual
        producer = str(meta.get("/Producer", "") or "").strip()
        creator = str(meta.get("/Creator", "") or "").strip()
        suspicious_tools = ["microsoft word", "libreoffice writer", "google docs", "notepad", "text editor"]
        combined_info = (producer + " " + creator).lower()
        for tool in suspicious_tools:
            if tool in combined_info:
                flags.append(
                    f"PDF was generated by a generic document editor ('{producer or creator}') "
                    "rather than a dedicated medical reporting system — manual creation suspected."
                )
                break

    except Exception:
        pass  # Non-critical; skip if pypdf parsing fails

    return flags

# ---------------------------------------------------------------------------
# 5. INTER-REPORT TEMPORAL ANOMALY
#    Checks if biomarker values changed at a physiologically implausible rate
#    compared to the previous report for the same user.
# ---------------------------------------------------------------------------
# Maximum plausible change per day for each biomarker
MAX_DAILY_CHANGE = {
    "Hemoglobin":           2.0,    # g/dL — dramatic drop/rise is suspicious
    "RBC":                  0.8,    # million/mcL
    "WBC":                  8000,   # cells/mcL (infection can spike WBC rapidly)
    "Fasting Glucose":      80,     # mg/dL — treatment can change this fast
    "HbA1c":                0.5,    # % — 3-month average; can't change overnight
    "Total Cholesterol":    40,     # mg/dL
    "LDL Cholesterol":      35,     # mg/dL
    "HDL Cholesterol":      15,     # mg/dL
    "Triglycerides":        80,     # mg/dL
    "Thyroid TSH":          3.0,    # mIU/L
    "Creatinine":           1.5,    # mg/dL
    "Systolic BP":          40,     # mmHg — can spike quickly
    "Diastolic BP":         30,     # mmHg
}

def _check_temporal_anomalies(biomarkers, user_id, db, current_upload_date=None):
    flags = []
    try:
        from database import MedicalReport, Biomarker as DBBiomarker

        # Fetch the single most recent previous report
        previous_report = (
            db.query(MedicalReport)
            .filter(MedicalReport.user_id == user_id)
            .order_by(MedicalReport.upload_date.desc())
            .first()
        )

        if previous_report is None:
            return flags

        prev_date = previous_report.upload_date
        now = current_upload_date or datetime.utcnow()

        # Guard against zero-day gap (same report)
        delta_days = max((now - prev_date).total_seconds() / 86400.0, 0.01)

        # Build dict of previous biomarker values
        prev_vals = {b.name: b.value for b in previous_report.biomarkers}
        curr_vals = {b["name"]: b["value"] for b in biomarkers}

        for name, max_per_day in MAX_DAILY_CHANGE.items():
            prev = prev_vals.get(name)
            curr = curr_vals.get(name)
            if prev is None or curr is None:
                continue

            daily_change = abs(curr - prev) / delta_days
            if daily_change > max_per_day * 2:   # 2× max is a hard anomaly threshold
                flags.append(
                    f"{name} changed from {prev} to {curr} in {delta_days:.1f} day(s) "
                    f"(rate: {daily_change:.1f}/day; physiological maximum: {max_per_day}/day) — "
                    "implausible change rate detected."
                )

    except Exception:
        pass  # Non-critical

    return flags

# ---------------------------------------------------------------------------
# PUBLIC API
# ---------------------------------------------------------------------------

def detect_fraud(biomarkers, file_path, user_id, db):
    """
    Run all fraud detection checks and return a structured result.

    Parameters
    ----------
    biomarkers : list[dict]
        Parsed biomarkers from the current report (with 'name', 'value', etc.)
    file_path : str
        Absolute path to the uploaded file (used for metadata checks).
    user_id : int
        Current user ID (used for cross-report temporal checks).
    db : SQLAlchemy Session
        Active database session.

    Returns
    -------
    dict with keys:
        is_fraud_suspected  : bool
        fraud_score         : int  (0–100, higher = more suspicious)
        risk_level          : str  ("none" | "low" | "medium" | "high")
        flags               : list[str]  (human-readable issue descriptions)
        categories          : list[str]  (which check categories triggered)
    """
    flags = []
    categories_triggered = set()

    bio_vals = {b["name"]: b["value"] for b in biomarkers}

    # --- Layer 1: Impossible values ---
    for name, (lo, hi) in IMPOSSIBLE_RANGES.items():
        val = bio_vals.get(name)
        if val is not None and (val < lo or val > hi):
            flags.append(
                f"{name} value {val} is outside physiologically possible range "
                f"({lo} – {hi}) — suspected data falsification."
            )
            categories_triggered.add("Impossible Value")

    # --- Layer 2: Internal consistency ---
    for rule in CONSISTENCY_RULES:
        if rule["check"](bio_vals):
            flags.append(rule["desc"])
            categories_triggered.add("Internal Inconsistency")

    # --- Layer 3: Duplicate values ---
    dup_flags = _check_duplicate_values(biomarkers)
    flags.extend(dup_flags)
    if dup_flags:
        categories_triggered.add("Duplicate Values")

    # --- Layer 4: PDF metadata ---
    meta_flags = _check_pdf_metadata(file_path)
    flags.extend(meta_flags)
    if meta_flags:
        categories_triggered.add("Metadata Tampering")

    # --- Layer 5: Temporal anomalies ---
    temp_flags = _check_temporal_anomalies(biomarkers, user_id, db)
    flags.extend(temp_flags)
    if temp_flags:
        categories_triggered.add("Temporal Anomaly")

    # --- Compute fraud score ---
    # Each flag contributes a weighted score based on its category severity
    category_weights = {
        "Impossible Value":       30,
        "Internal Inconsistency": 25,
        "Duplicate Values":       20,
        "Metadata Tampering":     15,
        "Temporal Anomaly":       20,
    }
    fraud_score = 0
    for cat in categories_triggered:
        fraud_score += category_weights.get(cat, 10)
    # Additional points for number of flags beyond first
    fraud_score += max(0, len(flags) - 1) * 5
    fraud_score = min(100, fraud_score)

    # --- Risk level ---
    if fraud_score == 0:
        risk_level = "none"
    elif fraud_score < 25:
        risk_level = "low"
    elif fraud_score < 55:
        risk_level = "medium"
    else:
        risk_level = "high"

    return {
        "is_fraud_suspected": len(flags) > 0,
        "fraud_score": fraud_score,
        "risk_level": risk_level,
        "flags": flags,
        "categories": list(categories_triggered),
        "total_checks_run": (
            len(IMPOSSIBLE_RANGES) +
            len(CONSISTENCY_RULES) +
            3   # duplicate, metadata, temporal
        )
    }

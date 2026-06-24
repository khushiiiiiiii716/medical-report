import re

# Standard reference ranges and metadata for biomarkers
# Status ranges are defined as: (min_normal, max_normal, unit, category, description)
# Note: For some biomarkers, ranges depend on age/gender, which we handle dynamically.
BIOMARKER_METADATA = {
    "Hemoglobin": {
        "category": "Complete Blood Count",
        "unit": "g/dL",
        "description": "A protein in red blood cells that carries oxygen throughout the body.",
        "ranges": {
            "Male": {"min": 13.8, "max": 17.2},
            "Female": {"min": 12.1, "max": 15.1},
            "Default": {"min": 12.0, "max": 16.0}
        }
    },
    "RBC": {
        "category": "Complete Blood Count",
        "unit": "million/mcL",
        "description": "Red Blood Cells, which carry oxygen. Low levels can indicate anemia.",
        "ranges": {
            "Male": {"min": 4.5, "max": 5.9},
            "Female": {"min": 4.1, "max": 5.1},
            "Default": {"min": 4.2, "max": 5.6}
        }
    },
    "WBC": {
        "category": "Complete Blood Count",
        "unit": "cells/mcL",
        "description": "White Blood Cells, part of the immune system. High levels can indicate infection.",
        "ranges": {
            "Default": {"min": 4000, "max": 11000}
        }
    },
    "Platelets": {
        "category": "Complete Blood Count",
        "unit": "cells/mcL",
        "description": "Cells that help blood clot. Low levels increase bleeding risk; high levels increase clotting risk.",
        "ranges": {
            "Default": {"min": 150000, "max": 450000}
        }
    },
    "Fasting Glucose": {
        "category": "Blood Sugar",
        "unit": "mg/dL",
        "description": "Blood sugar level measured after fasting. Key indicator for diabetes.",
        "ranges": {
            "Default": {"min": 70, "max": 100, "borderline_max": 125}
        }
    },
    "Postprandial Glucose": {
        "category": "Blood Sugar",
        "unit": "mg/dL",
        "description": "Blood sugar level measured 2 hours after a meal.",
        "ranges": {
            "Default": {"min": 70, "max": 140, "borderline_max": 199}
        }
    },
    "HbA1c": {
        "category": "Blood Sugar",
        "unit": "%",
        "description": "Average blood sugar level over the past 3 months. Used to diagnose diabetes.",
        "ranges": {
            "Default": {"min": 4.0, "max": 5.6, "borderline_max": 6.4}
        }
    },
    "Total Cholesterol": {
        "category": "Lipid Profile",
        "unit": "mg/dL",
        "description": "Total amount of cholesterol in your blood. High levels increase heart disease risk.",
        "ranges": {
            "Default": {"min": 100, "max": 200, "borderline_max": 239}
        }
    },
    "HDL Cholesterol": {
        "category": "Lipid Profile",
        "unit": "mg/dL",
        "description": "High-Density Lipoprotein ('good' cholesterol). Helps remove other forms of cholesterol.",
        "ranges": {
            "Male": {"min": 40, "max": 80},
            "Female": {"min": 50, "max": 90},
            "Default": {"min": 45, "max": 85}
        }
    },
    "LDL Cholesterol": {
        "category": "Lipid Profile",
        "unit": "mg/dL",
        "description": "Low-Density Lipoprotein ('bad' cholesterol). Excess causes plaque buildup in arteries.",
        "ranges": {
            "Default": {"min": 0, "max": 100, "borderline_max": 129}
        }
    },
    "Triglycerides": {
        "category": "Lipid Profile",
        "unit": "mg/dL",
        "description": "A type of fat in the blood. High levels linked to cardiovascular disease risk.",
        "ranges": {
            "Default": {"min": 0, "max": 150, "borderline_max": 199}
        }
    },
    "Thyroid TSH": {
        "category": "Thyroid Profile",
        "unit": "mIU/L",
        "description": "Thyroid Stimulating Hormone. Controls metabolism. High means underactive thyroid; low means overactive.",
        "ranges": {
            "Default": {"min": 0.4, "max": 4.5}
        }
    },
    "Creatinine": {
        "category": "Renal Profile",
        "unit": "mg/dL",
        "description": "A waste product filtered by the kidneys. High levels indicate impaired kidney function.",
        "ranges": {
            "Male": {"min": 0.7, "max": 1.3},
            "Female": {"min": 0.6, "max": 1.1},
            "Default": {"min": 0.6, "max": 1.2}
        }
    },
    "Systolic BP": {
        "category": "Cardiovascular",
        "unit": "mmHg",
        "description": "Pressure in arteries when the heart beats. Top number in blood pressure readings.",
        "ranges": {
            "Default": {"min": 90, "max": 120, "borderline_max": 129}
        }
    },
    "Diastolic BP": {
        "category": "Cardiovascular",
        "unit": "mmHg",
        "description": "Pressure in arteries between heartbeats. Bottom number in blood pressure readings.",
        "ranges": {
            "Default": {"min": 60, "max": 80, "borderline_max": 89}
        }
    }
}

# Regex pattern mapping for identifying biomarkers in text
PARSING_PATTERNS = {
    "Hemoglobin": [
        r"(?:hemoglobin|hb|hgb)\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "RBC": [
        r"(?:rbc|red\s*blood\s*cell|erythrocyte)\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "WBC": [
        r"(?:wbc|white\s*blood\s*cell|leukocyte)\s*[:\-]?\s*(\d{1,3}(?:[,\s]?\d{3})*(?:\.\d+)?)"
    ],
    "Platelets": [
        r"(?:platelet|plt|thrombocyte)\s*[:\-]?\s*(\d{2,3}(?:[,\s]?\d{3})*(?:\.\d+)?)"
    ],
    "Fasting Glucose": [
        r"(?:fasting\s*glucose|fasting\s*blood\s*sugar|fbs|glucose\s*\(?fasting\)?)\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "Postprandial Glucose": [
        r"(?:post\s*prandial\s*glucose|ppbs|ppg|post\s*meal\s*glucose|random\s*glucose|glucose\s*\(?post\s*prandial\)?)\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "HbA1c": [
        r"(?:hba1c|glycated\s*hemoglobin|glycosylated\s*hb)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*%"
    ],
    "Total Cholesterol": [
        r"(?:total\s*cholesterol|cholesterol\s*\(?total\)?)\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "HDL Cholesterol": [
        r"(?:hdl|hdl\s*cholesterol|high\s*density\s*lipoprotein)\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "LDL Cholesterol": [
        r"(?:ldl|ldl\s*cholesterol|low\s*density\s*lipoprotein)\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "Triglycerides": [
        r"(?:triglycerides|tg|trig)\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "Thyroid TSH": [
        r"(?:tsh|thyroid\s*stimulating\s*hormone|thyrotropin)\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "Creatinine": [
        r"(?:creatinine|creat|scr)\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "Blood Pressure": [
        r"(?:blood\s*pressure|bp)\s*[:\-]?\s*(\d{2,3})\s*/\s*(\d{2,3})"
    ]
}

def parse_clean_value(val_str):
    """
    Cleans value string by removing commas, whitespace and converting to float.
    """
    cleaned = val_str.replace(",", "").replace(" ", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None

def determine_status(name, value, gender="Male"):
    """
    Compares a value to reference ranges to determine its status.
    Returns: (status_string, reference_range_string)
    """
    metadata = BIOMARKER_METADATA.get(name)
    if not metadata:
        return "Normal", "N/A"
        
    ranges = metadata["ranges"]
    user_range = ranges.get(gender) or ranges.get("Default")
    
    min_val = user_range.get("min", 0)
    max_val = user_range.get("max", float('inf'))
    borderline_max = user_range.get("borderline_max")
    
    ref_str = f"{min_val} - {max_val}" if max_val != float('inf') else f"> {min_val}"
    
    # Blood Sugar and Lipids have "Borderline" levels above Normal but below High
    if borderline_max:
        if value < min_val:
            return "Low", ref_str
        elif value <= max_val:
            return "Normal", ref_str
        elif value <= borderline_max:
            return "Borderline", f"{min_val} - {max_val} (Borderline to {borderline_max})"
        else:
            return "High", ref_str
            
    # Standard Biomarkers (High/Low/Normal)
    if value < min_val:
        return "Low", ref_str
    elif value > max_val:
        return "High", ref_str
    else:
        return "Normal", ref_str

def parse_medical_text(text, gender="Male"):
    """
    Parses raw report text using regex patterns and maps to structured Biomarkers.
    """
    parsed_results = []
    
    # Preprocess text (lowercase for matching, keep line structure)
    lines = text.split("\n")
    
    # Special parsing for Blood Pressure (which yields two values: Systolic & Diastolic)
    bp_found = False
    for line in lines:
        for pattern in PARSING_PATTERNS["Blood Pressure"]:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                systolic = parse_clean_value(match.group(1))
                diastolic = parse_clean_value(match.group(2))
                if systolic and diastolic:
                    # Systolic
                    sys_status, sys_ref = determine_status("Systolic BP", systolic, gender)
                    parsed_results.append({
                        "name": "Systolic BP",
                        "category": BIOMARKER_METADATA["Systolic BP"]["category"],
                        "value": systolic,
                        "unit": BIOMARKER_METADATA["Systolic BP"]["unit"],
                        "reference_range": sys_ref,
                        "status": sys_status,
                        "description": BIOMARKER_METADATA["Systolic BP"]["description"]
                    })
                    # Diastolic
                    dia_status, dia_ref = determine_status("Diastolic BP", diastolic, gender)
                    parsed_results.append({
                        "name": "Diastolic BP",
                        "category": BIOMARKER_METADATA["Diastolic BP"]["category"],
                        "value": diastolic,
                        "unit": BIOMARKER_METADATA["Diastolic BP"]["unit"],
                        "reference_range": dia_ref,
                        "status": dia_status,
                        "description": BIOMARKER_METADATA["Diastolic BP"]["description"]
                    })
                    bp_found = True
                    break
        if bp_found:
            break

    # Parse all other single-value biomarkers
    for name, patterns in PARSING_PATTERNS.items():
        if name == "Blood Pressure":
            continue
            
        metadata = BIOMARKER_METADATA[name]
        val_found = None
        
        for line in lines:
            for pattern in patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    parsed_val = parse_clean_value(match.group(1))
                    if parsed_val is not None:
                        val_found = parsed_val
                        break
            if val_found is not None:
                break
                
        if val_found is not None:
            status, ref_range = determine_status(name, val_found, gender)
            parsed_results.append({
                "name": name,
                "category": metadata["category"],
                "value": val_found,
                "unit": metadata["unit"],
                "reference_range": ref_range,
                "status": status,
                "description": metadata["description"]
            })
            
    return parsed_results

def calculate_health_score(biomarkers):
    """
    Computes a health score out of 100 based on parsed biomarkers.
    Normal: 0 points deducted.
    Borderline: 5 points deducted.
    High/Low: 15 points deducted.
    Minimum score is 30.
    """
    if not biomarkers:
        return 100
        
    score = 100
    for bio in biomarkers:
        status = bio["status"]
        if status == "Borderline":
            score -= 5
        elif status in ["High", "Low"]:
            score -= 15
            
    return max(30, score)

"""
Quick startup verification for Aura Med backend.
Run from project root: venv\Scripts\python.exe verify_backend.py
"""
import sys
import os

# Simulate exactly what run.bat does: cd into project root, then run backend/app.py
# app.py does: sys.path.append(os.path.dirname(os.path.abspath(__file__)))
# which would be the 'backend' directory. We replicate that here.
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
sys.path.insert(0, backend_dir)

errors = []

# 1. Check database module
try:
    import database
    print("[OK] database.py imports fine")
except Exception as e:
    errors.append(f"[FAIL] database.py: {e}")

# 2. Check all utility modules
utils = [
    ("utils.ocr", "extract_text"),
    ("utils.parser", "parse_medical_text"),
    ("utils.predictor", "predict_risks"),
    ("utils.recommender", "get_recommendations"),
    ("utils.chatbot", "process_chat_query"),
    ("utils.pdf_generator", "generate_report_pdf"),
    ("utils.translations", "translate_biomarker"),
    ("utils.anomaly_detector", "detect_trend_anomalies"),
    ("utils.notifier", "notify_critical_anomalies"),
    ("utils.fraud_detector", "detect_fraud"),
]

for module_name, func_name in utils:
    try:
        mod = __import__(module_name, fromlist=[func_name])
        getattr(mod, func_name)
        print(f"[OK] {module_name}.{func_name}")
    except Exception as e:
        errors.append(f"[FAIL] {module_name}: {e}")

# 3. Check Flask and CORS
try:
    from flask import Flask
    from flask_cors import CORS
    print("[OK] Flask + flask-cors")
except Exception as e:
    errors.append(f"[FAIL] Flask/CORS: {e}")

# 4. Check ML model files exist
models_dir = os.path.join(backend_dir, "models")
for model_file in ["diabetes_model.joblib", "heart_disease_model.joblib", "anemia_model.joblib"]:
    path = os.path.join(models_dir, model_file)
    if os.path.exists(path):
        print(f"[OK] Model file: {model_file}")
    else:
        errors.append(f"[FAIL] Missing model file: {model_file}")

# 5. Check Tesseract (OCR dependency)
try:
    import pytesseract
    version = pytesseract.get_tesseract_version()
    print(f"[OK] Tesseract OCR: version {version}")
except Exception as e:
    errors.append(f"[WARN] Tesseract not found or not in PATH: {e}\n       Image OCR will not work. PDF text extraction will still work.")

print()
if errors:
    print("=" * 60)
    print("ISSUES FOUND:")
    for err in errors:
        print(" ", err)
    print("=" * 60)
    sys.exit(1)
else:
    print("=" * 60)
    print("All checks passed. Backend is ready to start.")
    print("=" * 60)
    sys.exit(0)

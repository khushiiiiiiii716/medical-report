import os
import joblib
import numpy as np

# Import training script to train models on the fly if they don't exist
from train_models import train_and_save_models

# Locate paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Loaded classifiers cache
_models = {
    "diabetes": None,
    "heart_disease": None,
    "anemia": None
}

def load_ml_models():
    """
    Loads ML models from disk. Trains them first if they are missing.
    """
    global _models
    
    # Check if models are present on disk
    required_files = ["diabetes_model.joblib", "heart_disease_model.joblib", "anemia_model.joblib"]
    missing = [f for f in required_files if not os.path.exists(os.path.join(MODELS_DIR, f))]
    
    if missing:
        print(f"Models {missing} are missing. Triggering training...")
        train_and_save_models()
        
    try:
        if _models["diabetes"] is None:
            _models["diabetes"] = joblib.load(os.path.join(MODELS_DIR, "diabetes_model.joblib"))
        if _models["heart_disease"] is None:
            _models["heart_disease"] = joblib.load(os.path.join(MODELS_DIR, "heart_disease_model.joblib"))
        if _models["anemia"] is None:
            _models["anemia"] = joblib.load(os.path.join(MODELS_DIR, "anemia_model.joblib"))
        print("All ML models loaded successfully.")
    except Exception as e:
        print(f"Error loading ML models: {e}. Re-training...")
        train_and_save_models()
        _models["diabetes"] = joblib.load(os.path.join(MODELS_DIR, "diabetes_model.joblib"))
        _models["heart_disease"] = joblib.load(os.path.join(MODELS_DIR, "heart_disease_model.joblib"))
        _models["anemia"] = joblib.load(os.path.join(MODELS_DIR, "anemia_model.joblib"))

def _get_positive_class_probability(model, X, positive_class=1):
    """Return the probability for the positive class in a binary classifier."""
    proba = model.predict_proba(X)[0]
    if hasattr(model, "classes_"):
        classes = list(model.classes_)
        if positive_class in classes:
            return proba[classes.index(positive_class)] * 100.0
        if len(classes) == 1:
            return 100.0 if classes[0] == positive_class else 0.0
    return float(max(proba)) * 100.0


def predict_risks(biomarkers, user_profile):
    """
    Evaluates risk percentages for Diabetes, Heart Disease, and Anemia using trained classifiers.
    Fills in missing features with defaults or profile settings.
    """
    # Make sure models are loaded
    load_ml_models()
    
    # Extract profile details
    age = user_profile.get("age", 30)
    gender_str = user_profile.get("gender", "Male")
    gender_val = 1 if gender_str == "Male" else 0  # 1=Male, 0=Female/Other
    bmi = user_profile.get("bmi", 24.2)
    smoking_val = 1 if user_profile.get("smoking", False) else 0
    exercise_val = 1 if user_profile.get("exercise", True) else 0
    
    # Create helper dictionary of extracted biomarker values
    bio_vals = {b["name"]: b["value"] for b in biomarkers}
    
    # -------------------------------------------------------------
    # 1. DIABETES RISK PREDICTION
    # Features: Fasting Glucose, HbA1c, Age, BMI, Systolic BP
    # -------------------------------------------------------------
    f_glucose = bio_vals.get("Fasting Glucose")
    if f_glucose is None:
        # If Fasting Glucose is missing, look for Postprandial Glucose and estimate Fasting, or use default 85.0
        ppg = bio_vals.get("Postprandial Glucose")
        f_glucose = ppg * 0.7 if ppg else 85.0
        
    hba1c = bio_vals.get("HbA1c", 5.3)
    systolic = bio_vals.get("Systolic BP", 118.0)
    
    X_diabetes = np.array([[f_glucose, hba1c, age, bmi, systolic]])
    
    diabetes_prob = 0.0
    if _models["diabetes"]:
        diabetes_prob = _get_positive_class_probability(_models["diabetes"], X_diabetes)
        
    # Apply minor adjustments based on family history
    if user_profile.get("family_history_diabetes", False):
        diabetes_prob = min(99.0, diabetes_prob + 10.0)
        
    # -------------------------------------------------------------
    # 2. HEART DISEASE RISK PREDICTION
    # Features: Total Cholesterol, LDL Cholesterol, Systolic BP, Diastolic BP, Age, Exercise (0/1), Smoking (0/1)
    # -------------------------------------------------------------
    tot_chol = bio_vals.get("Total Cholesterol", 180.0)
    ldl = bio_vals.get("LDL Cholesterol", 95.0)
    sys_bp = bio_vals.get("Systolic BP", 118.0)
    dia_bp = bio_vals.get("Diastolic BP", 78.0)
    
    X_heart = np.array([[tot_chol, ldl, sys_bp, dia_bp, age, exercise_val, smoking_val]])
    
    heart_prob = 0.0
    if _models["heart_disease"]:
        heart_prob = _get_positive_class_probability(_models["heart_disease"], X_heart)
        
    if user_profile.get("family_history_heart", False):
        heart_prob = min(99.0, heart_prob + 12.0)
        
    # -------------------------------------------------------------
    # 3. ANEMIA RISK PREDICTION
    # Features: Hemoglobin, RBC, Age, Gender (0=Female, 1=Male)
    # -------------------------------------------------------------
    # Default Hemoglobin based on gender
    default_hb = 14.5 if gender_str == "Male" else 13.0
    hemoglobin = bio_vals.get("Hemoglobin", default_hb)
    rbc = bio_vals.get("RBC", 4.7)
    
    X_anemia = np.array([[hemoglobin, rbc, age, gender_val]])
    
    anemia_prob = 0.0
    if _models["anemia"]:
        anemia_prob = _get_positive_class_probability(_models["anemia"], X_anemia)
        
    return {
        "diabetes": float(round(diabetes_prob, 1)),
        "heart_disease": float(round(heart_prob, 1)),
        "anemia": float(round(anemia_prob, 1))
    }

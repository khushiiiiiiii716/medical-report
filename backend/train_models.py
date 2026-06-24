import os
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier

def train_and_save_models():
    """
    Generates synthetic medical datasets matching clinical probability distributions,
    trains RandomForestClassifiers, and saves them as .joblib model files.
    """
    models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
    os.makedirs(models_dir, exist_ok=True)
    
    print("Generating synthetic datasets and training ML models...")
    
    # -------------------------------------------------------------
    # 1. DIABETES RISK MODEL
    # Features: Fasting Glucose, HbA1c, Age, BMI, Systolic BP
    # -------------------------------------------------------------
    np.random.seed(42)
    n_samples = 2000
    
    # Generate features
    f_glucose = np.random.normal(105, 30, n_samples)  # mean 105, std 30
    f_glucose = np.clip(f_glucose, 60, 280)
    
    hba1c = np.random.normal(5.8, 1.2, n_samples)      # mean 5.8, std 1.2
    hba1c = np.clip(hba1c, 4.0, 14.0)
    
    age = np.random.randint(18, 85, n_samples)
    bmi = np.random.normal(26, 6, n_samples)           # mean 26, std 6
    bmi = np.clip(bmi, 15, 55)
    
    systolic = np.random.normal(122, 15, n_samples)    # mean 122, std 15
    systolic = np.clip(systolic, 80, 200)
    
    # Synthesize target using a logistic-like probability threshold
    # Higher values raise probability of diabetes (class 1)
    prob_diabetes = 1.0 / (1.0 + np.exp(-(
        -8.5 
        + 0.04 * f_glucose 
        + 0.9 * hba1c 
        + 0.02 * age 
        + 0.08 * bmi 
        + 0.01 * systolic
    )))
    diabetes_target = (np.random.rand(n_samples) < prob_diabetes).astype(int)
    
    X_diabetes = np.column_stack((f_glucose, hba1c, age, bmi, systolic))
    
    diabetes_clf = RandomForestClassifier(n_estimators=50, max_depth=6, random_state=42)
    diabetes_clf.fit(X_diabetes, diabetes_target)
    
    joblib.dump(diabetes_clf, os.path.join(models_dir, "diabetes_model.joblib"))
    print("Saved diabetes_model.joblib")
    
    # -------------------------------------------------------------
    # 2. HEART DISEASE RISK MODEL
    # Features: Total Cholesterol, LDL Cholesterol, Systolic BP, Diastolic BP, Age, Exercise (0/1), Smoking (0/1)
    # -------------------------------------------------------------
    tot_chol = np.random.normal(205, 45, n_samples)
    tot_chol = np.clip(tot_chol, 100, 380)
    
    ldl = np.random.normal(125, 35, n_samples)
    ldl = np.clip(ldl, 40, 280)
    
    sys_bp = np.random.normal(125, 18, n_samples)
    sys_bp = np.clip(sys_bp, 80, 200)
    
    dia_bp = np.random.normal(80, 10, n_samples)
    dia_bp = np.clip(dia_bp, 50, 120)
    
    age_heart = np.random.randint(18, 85, n_samples)
    exercise = np.random.binomial(1, 0.6, n_samples)   # 60% exercise
    smoking = np.random.binomial(1, 0.25, n_samples)   # 25% smoke
    
    prob_heart = 1.0 / (1.0 + np.exp(-(
        -6.5
        + 0.012 * tot_chol
        + 0.018 * ldl
        + 0.022 * sys_bp
        + 0.015 * dia_bp
        + 0.035 * age_heart
        - 0.8 * exercise
        + 1.2 * smoking
    )))
    heart_target = (np.random.rand(n_samples) < prob_heart).astype(int)
    
    X_heart = np.column_stack((tot_chol, ldl, sys_bp, dia_bp, age_heart, exercise, smoking))
    
    heart_clf = RandomForestClassifier(n_estimators=50, max_depth=6, random_state=42)
    heart_clf.fit(X_heart, heart_target)
    
    joblib.dump(heart_clf, os.path.join(models_dir, "heart_disease_model.joblib"))
    print("Saved heart_disease_model.joblib")
    
    # -------------------------------------------------------------
    # 3. ANEMIA RISK MODEL
    # Features: Hemoglobin, RBC, Age, Gender (0=Female, 1=Male)
    # -------------------------------------------------------------
    hemoglobin = np.random.normal(13.5, 2.5, n_samples)
    hemoglobin = np.clip(hemoglobin, 5.0, 20.0)
    
    rbc = np.random.normal(4.6, 0.8, n_samples)
    rbc = np.clip(rbc, 2.0, 7.5)
    
    age_anemia = np.random.randint(18, 85, n_samples)
    gender = np.random.binomial(1, 0.5, n_samples)  # 50-50 male-female
    
    # Probability increases if Hemoglobin is low. Males have a higher threshold for anemia.
    # Anemia formula: Hemoglobin < 12 (Females) or < 13.5 (Males)
    # We formulate the risk probability to heavily factor in low Hb and low RBC.
    prob_anemia = 1.0 / (1.0 + np.exp(-(
        4.0 
        - 1.5 * hemoglobin 
        - 0.8 * rbc 
        + 0.01 * age_anemia 
        + 0.5 * gender  # Males have higher baseline threshold, so lower Hb gives higher log-odds of risk
    )))
    anemia_target = (np.random.rand(n_samples) < prob_anemia).astype(int)
    
    X_anemia = np.column_stack((hemoglobin, rbc, age_anemia, gender))
    
    anemia_clf = RandomForestClassifier(n_estimators=50, max_depth=5, random_state=42)
    anemia_clf.fit(X_anemia, anemia_target)
    
    joblib.dump(anemia_clf, os.path.join(models_dir, "anemia_model.joblib"))
    print("Saved anemia_model.joblib")
    print("All models successfully trained and saved.")

if __name__ == "__main__":
    train_and_save_models()

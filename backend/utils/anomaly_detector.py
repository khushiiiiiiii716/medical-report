import numpy as np
from database import MedicalReport, Biomarker

def detect_trend_anomalies(parsed_biomarkers, user_id, db):
    """
    Uses Isolation Forest to detect if a newly uploaded biomarker value is an anomaly 
    compared to the user's historical trend data.
    
    If there is not enough historical data (e.g., < 3 past records), 
    it will skip anomaly detection for that biomarker.
    
    Returns the parsed_biomarkers array with a new 'is_trend_anomaly' flag.
    """
    
    # Retrieve all historical reports for this user
    historical_reports = db.query(MedicalReport).filter(MedicalReport.user_id == user_id).all()
    report_ids = [r.id for r in historical_reports]
    
    # If no past reports, just mark everything as False
    if not report_ids:
        for bio in parsed_biomarkers:
            bio['is_trend_anomaly'] = False
        return parsed_biomarkers
        
    # Group past biomarkers by name
    history_by_name = {}
    if report_ids:
        past_biomarkers = db.query(Biomarker).filter(Biomarker.report_id.in_(report_ids)).all()
        for b in past_biomarkers:
            if b.name not in history_by_name:
                history_by_name[b.name] = []
            history_by_name[b.name].append(b.value)

    # Process each new biomarker
    for bio in parsed_biomarkers:
        name = bio['name']
        new_val = bio['value']
        
        history = history_by_name.get(name, [])
        
        # We need at least 3 historical points to make a reasonable trend assessment
        if len(history) < 3:
            bio['is_trend_anomaly'] = False
            continue
            
        # Prepare data for Isolation Forest
        X_train = np.array(history).reshape(-1, 1)
        
        # Fit the Isolation Forest
        try:
            from sklearn.ensemble import IsolationForest
            model = IsolationForest(contamination=0.1, random_state=42)
            model.fit(X_train)
            
            # Predict on the new value. Returns 1 for inliers, -1 for outliers
            prediction = model.predict(np.array([[new_val]]))
            bio['is_trend_anomaly'] = bool(prediction[0] == -1)
        except ImportError:
            # Fallback to simple Z-score if sklearn is not installed
            mean = np.mean(history)
            std = np.std(history)
            if std == 0:
                bio['is_trend_anomaly'] = False
            else:
                z_score = abs(new_val - mean) / std
                bio['is_trend_anomaly'] = bool(z_score > 2.0)
        except Exception:
            bio['is_trend_anomaly'] = False

    return parsed_biomarkers

import os
import sys
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Ensure the backend directory is in the system path to allow local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, init_db, User, MedicalReport, Biomarker, ChatMessage
from utils.ocr import extract_text
from utils.parser import parse_medical_text, calculate_health_score
from utils.predictor import predict_risks
from utils.recommender import get_recommendations
from utils.chatbot import process_chat_query
from utils.pdf_generator import generate_report_pdf
from utils.translations import translate_biomarker, get as t_get
from utils.anomaly_detector import detect_trend_anomalies
from utils.notifier import notify_critical_anomalies
from utils.fraud_detector import detect_fraud

SUPPORTED_LANGS = {'en', 'hi', 'ta', 'pa', 'es', 'fr', 'de'}

def get_lang():
    """Extract and validate the language code from the request."""
    lang = (request.args.get('lang') or 
            (request.json.get('lang') if request.is_json and request.json else None) or
            request.form.get('lang') or 'en')
    return lang if lang in SUPPORTED_LANGS else 'en'

app = Flask(__name__)
# Enable CORS for React frontend (standard port 5173 or all origins for ease)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB file limit

# Initialize database tables
init_db()

# Database helper decorator
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.route('/api/user/profile', methods=['GET', 'POST'])
def handle_profile():
    db = SessionLocal()
    try:
        # We use a single default user (id=1) for this session
        user = db.query(User).filter(User.id == 1).first()
        if not user:
            user = User(id=1, name="John Doe")
            db.add(user)
            db.commit()
            
        if request.method == 'POST':
            data = request.json
            user.name = data.get('name', user.name)
            user.age = int(data.get('age', user.age))
            user.gender = data.get('gender', user.gender)
            user.height = float(data.get('height', user.height))
            user.weight = float(data.get('weight', user.weight))
            user.smoking = bool(data.get('smoking', user.smoking))
            user.exercise = bool(data.get('exercise', user.exercise))
            user.family_history_diabetes = bool(data.get('family_history_diabetes', user.family_history_diabetes))
            user.family_history_heart = bool(data.get('family_history_heart', user.family_history_heart))
            
            # Calculate BMI
            if user.height > 0:
                user.bmi = float(round(user.weight / ((user.height / 100) ** 2), 1))
            
            db.commit()
            
        return jsonify({
            "name": user.name,
            "age": user.age,
            "gender": user.gender,
            "height": user.height,
            "weight": user.weight,
            "bmi": user.bmi,
            "smoking": user.smoking,
            "exercise": user.exercise,
            "family_history_diabetes": user.family_history_diabetes,
            "family_history_heart": user.family_history_heart
        })
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/api/upload', methods=['POST'])
def upload_report():
    lang = request.args.get('lang', 'en')
    lang = lang if lang in SUPPORTED_LANGS else 'en'
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    db = SessionLocal()
    try:
        # Get active user profile
        user = db.query(User).filter(User.id == 1).first()
        if not user:
            user = User(id=1)
            db.add(user)
            db.commit()
            
        # Secure filename and save
        filename = secure_filename(file.filename)
        # Append timestamp to filename to prevent collisions
        timestamp_prefix = datetime.now().strftime("%Y%m%d%H%M%S_")
        unique_filename = timestamp_prefix + filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # 1. OCR text extraction
        raw_text = extract_text(file_path)
        
        # 2. Extract biomarkers using parsing engine
        parsed_biomarkers = parse_medical_text(raw_text, gender=user.gender)
        
        # 2.5 Run Machine Learning Anomaly Detection on Trends
        parsed_biomarkers = detect_trend_anomalies(parsed_biomarkers, user.id, db)

        # 2.6 Run Fraud Detection on the uploaded report
        fraud_result = detect_fraud(parsed_biomarkers, file_path, user.id, db)
        
        # 3. Compute Health Score
        health_score = calculate_health_score(parsed_biomarkers)
        
        # 4. Predict Disease Risks using ML classifiers
        risks = predict_risks(parsed_biomarkers, {
            "age": user.age,
            "gender": user.gender,
            "bmi": user.bmi,
            "smoking": user.smoking,
            "exercise": user.exercise,
            "family_history_diabetes": user.family_history_diabetes,
            "family_history_heart": user.family_history_heart
        })
        
        # 5. Generate diet and lifestyle recommendations
        recommendations = get_recommendations(parsed_biomarkers)
        
        # 6. Save report metadata to Database
        report = MedicalReport(
            user_id=user.id,
            filename=filename,
            raw_text=raw_text,
            health_score=health_score,
            diabetes_risk=risks["diabetes"],
            heart_disease_risk=risks["heart_disease"],
            anemia_risk=risks["anemia"],
            fraud_score=fraud_result["fraud_score"],
            fraud_risk_level=fraud_result["risk_level"],
            fraud_flags="|".join(fraud_result["flags"]) if fraud_result["flags"] else ""
        )
        db.add(report)
        db.commit() # Commits to generate report.id
        
        # Save individual biomarkers
        for bio in parsed_biomarkers:
            db_bio = Biomarker(
                report_id=report.id,
                name=bio["name"],
                category=bio["category"],
                value=bio["value"],
                unit=bio["unit"],
                reference_range=bio["reference_range"],
                status=bio["status"],
                description=bio["description"],
                # We can store ML anomaly flag in the description or just let the frontend calculate it from returned JSON
                # Actually, adding it to description ensures it persists in DB if we want, or we can just return it in JSON.
            )
            db.add(db_bio)
            
        db.commit()
        db.refresh(report)
        
        # Trigger Email Alerts for Critical/ML Anomalies
        critical_biomarkers = [b for b in parsed_biomarkers if b["status"] in ["High", "Low"]]
        ml_anomalies = [b for b in parsed_biomarkers if b.get("is_trend_anomaly", False)]
        if critical_biomarkers or ml_anomalies:
            notify_critical_anomalies(user, critical_biomarkers, ml_anomalies)

        # Translate biomarker statuses and categories before response
        translated_biomarkers = [translate_biomarker(b, lang) for b in parsed_biomarkers]
        risk_emergency = any(risk >= 60.0 for risk in risks.values())
        emergency_alert = {
            "is_emergency": len(critical_biomarkers) > 0 or len(ml_anomalies) > 0 or risk_emergency,
            "critical_count": len(critical_biomarkers),
            "trend_anomaly_count": len(ml_anomalies),
            "risk_emergency": risk_emergency,
            "high_risks": {
                "diabetes": risks["diabetes"] >= 60.0,
                "heart_disease": risks["heart_disease"] >= 60.0,
                "anemia": risks["anemia"] >= 60.0
            }
        }
        
        return jsonify({
            "id": report.id,
            "filename": report.filename,
            "upload_date": report.upload_date.isoformat(),
            "health_score": health_score,
            "risks": risks,
            "biomarkers": translated_biomarkers,
            "recommendations": recommendations,
            "emergency_alert": emergency_alert,
            "is_emergency": emergency_alert["is_emergency"],
            "fraud_detection": fraud_result,
            "lang": lang
        })
        
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/api/reports', methods=['GET'])
def get_reports():
    lang = request.args.get('lang', 'en')
    lang = lang if lang in SUPPORTED_LANGS else 'en'
    db = SessionLocal()
    try:
        reports = db.query(MedicalReport).order_by(MedicalReport.upload_date.desc()).all()
        result = []
        for r in reports:
            biomarkers = []
            for b in r.biomarkers:
                biomarkers.append({
                    "name": b.name,
                    "category": b.category,
                    "value": b.value,
                    "unit": b.unit,
                    "reference_range": b.reference_range,
                    "status": b.status,
                    "description": b.description
                })
            
            # Translate biomarker statuses and categories
            translated_biomarkers = [translate_biomarker(b, lang) for b in biomarkers]
            # Reconstruct recommendations for each report
            recommendations = get_recommendations(biomarkers)
            
            is_emergency = any(b["status"] in ["High", "Low"] for b in biomarkers)
            result.append({
                "id": r.id,
                "filename": r.filename,
                "upload_date": r.upload_date.isoformat(),
                "health_score": r.health_score,
                "risks": {
                    "diabetes": r.diabetes_risk,
                    "heart_disease": r.heart_disease_risk,
                    "anemia": r.anemia_risk
                },
                "biomarkers": translated_biomarkers,
                "recommendations": recommendations,
                "is_emergency": is_emergency,
                "fraud_detection": {
                    "is_fraud_suspected": bool(r.fraud_score and r.fraud_score > 0),
                    "fraud_score": r.fraud_score or 0,
                    "risk_level": r.fraud_risk_level or "none",
                    "flags": [f for f in (r.fraud_flags or "").split("|") if f],
                    "categories": []
                }
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/api/trends', methods=['GET'])
def get_trends():
    db = SessionLocal()
    try:
        # Retrieve biomarkers from all reports ordered chronologically
        reports = db.query(MedicalReport).order_by(MedicalReport.upload_date.asc()).all()
        trends = []
        for r in reports:
            bio_dict = {"date": r.upload_date.strftime("%Y-%m-%d"), "filename": r.filename}
            for b in r.biomarkers:
                # Store value for key metrics
                bio_dict[b.name] = b.value
            trends.append(bio_dict)
        return jsonify(trends)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    query = data.get("message", "")
    if not query:
        return jsonify({"error": "Empty message"}), 400
        
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == 1).first()
        latest_report = db.query(MedicalReport).filter(MedicalReport.user_id == 1).order_by(MedicalReport.upload_date.desc()).first()
        
        biomarkers = []
        if latest_report:
            for b in latest_report.biomarkers:
                biomarkers.append({
                    "name": b.name,
                    "value": b.value,
                    "unit": b.unit,
                    "reference_range": b.reference_range,
                    "status": b.status,
                    "description": b.description
                })
                
        user_profile = {
            "age": user.age,
            "gender": user.gender,
            "bmi": user.bmi,
            "smoking": user.smoking,
            "exercise": user.exercise,
            "family_history_diabetes": user.family_history_diabetes,
            "family_history_heart": user.family_history_heart
        } if user else {}
        
        # Generate Response via Ollama (llama3) with fallback to local rules
        lang = data.get("lang", "en")
        lang = lang if lang in SUPPORTED_LANGS else "en"
        bot_response = process_chat_query(query, biomarkers=biomarkers, user_profile=user_profile, lang=lang)
        
        # Save messages to database
        user_msg = ChatMessage(user_id=1, role="user", content=query)
        bot_msg = ChatMessage(user_id=1, role="assistant", content=bot_response)
        db.add(user_msg)
        db.add(bot_msg)
        db.commit()
        
        return jsonify({
            "response": bot_response,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/api/report/<int:report_id>/download', methods=['GET'])
def download_pdf(report_id):
    db = SessionLocal()
    try:
        report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
        if not report:
            return jsonify({"error": "Report not found"}), 404
            
        user = db.query(User).filter(User.id == report.user_id).first()
        
        biomarkers = []
        for b in report.biomarkers:
            biomarkers.append({
                "name": b.name,
                "category": b.category,
                "value": b.value,
                "unit": b.unit,
                "reference_range": b.reference_range,
                "status": b.status,
                "description": b.description
            })
            
        # Reconstruct recommendations
        recommendations = get_recommendations(biomarkers)
        
        report_data = {
            "date": report.upload_date.strftime("%B %d, %Y"),
            "health_score": report.health_score,
            "user_info": {
                "name": user.name if user else "N/A",
                "age": user.age if user else "N/A",
                "gender": user.gender if user else "N/A",
                "bmi": user.bmi if user else "N/A",
                "bmi_status": "Underweight" if (user and user.bmi < 18.5) else "Normal" if (user and user.bmi < 25) else "Overweight" if (user and user.bmi < 30) else "Obese" if user else "N/A"
            },
            "biomarkers": biomarkers,
            "risks": {
                "diabetes": report.diabetes_risk,
                "heart_disease": report.heart_disease_risk,
                "anemia": report.anemia_risk
            },
            "recommendations": recommendations
        }
        
        # Temp output PDF path
        pdf_filename = f"health_summary_{report_id}.pdf"
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], pdf_filename)
        
        success = generate_report_pdf(report_data, pdf_path)
        if not success:
            return jsonify({"error": "Could not generate PDF"}), 500
            
        return send_file(
            pdf_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"Health_Summary_{report.filename.replace(' ', '_')}.pdf"
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

if __name__ == '__main__':
    # Automatically trigger model load/train on startup
    from utils.predictor import load_ml_models
    load_ml_models()
    # Run server
    app.run(host='0.0.0.0', port=5000, debug=True)

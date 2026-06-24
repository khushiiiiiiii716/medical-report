import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, Float, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from dotenv import load_dotenv

load_dotenv()

# Database connection setup
# Try PostgreSQL first, fall back to SQLite if connection fails or not configured
DATABASE_URL = os.getenv("DATABASE_URL")
engine = None

if DATABASE_URL:
    try:
        # Verify if we can connect to PostgreSQL
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        # Test connection
        with engine.connect() as conn:
            pass
        print("Successfully connected to PostgreSQL database.")
    except Exception as e:
        print(f"Warning: Failed to connect to PostgreSQL ({e}). Falling back to SQLite.")
        engine = None

if engine is None:
    # Use SQLite as fallback
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "medical_report.db"))
    DATABASE_URL = f"sqlite:///{db_path}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    print(f"Using SQLite database at: {db_path}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), default="User")
    age = Column(Integer, default=30)
    gender = Column(String(20), default="Male")  # Male, Female, Other
    height = Column(Float, default=170.0)  # in cm
    weight = Column(Float, default=70.0)   # in kg
    bmi = Column(Float, default=24.2)
    smoking = Column(Boolean, default=False)
    exercise = Column(Boolean, default=True)  # Regular physical activity
    family_history_diabetes = Column(Boolean, default=False)
    family_history_heart = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("MedicalReport", back_populates="user", cascade="all, delete-orphan")

class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String(255))
    upload_date = Column(DateTime, default=datetime.utcnow)
    raw_text = Column(Text)
    health_score = Column(Integer, default=100)
    
    # Risk predictions stored as percentages (0 to 100)
    diabetes_risk = Column(Float, default=0.0)
    heart_disease_risk = Column(Float, default=0.0)
    anemia_risk = Column(Float, default=0.0)

    user = relationship("User", back_populates="reports")
    biomarkers = relationship("Biomarker", back_populates="report", cascade="all, delete-orphan")

class Biomarker(Base):
    __tablename__ = "biomarkers"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("medical_reports.id"))
    name = Column(String(100), index=True)          # e.g., Hemoglobin, Fasting Glucose
    category = Column(String(100))                  # e.g., CBC, Renal, Lipid, Thyroid
    value = Column(Float)
    unit = Column(String(50))
    reference_range = Column(String(100))           # e.g., 12.0 - 16.0
    status = Column(String(50))                    # Normal, Low, High, Borderline
    description = Column(Text)                      # Short description of what this parameter is

    report = relationship("MedicalReport", back_populates="biomarkers")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    role = Column(String(50))                      # user, assistant
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)
    
    # Create a default user if none exists
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            default_user = User(
                name="John Doe",
                age=35,
                gender="Male",
                height=175.0,
                weight=78.0,
                bmi=25.5,
                smoking=False,
                exercise=True,
                family_history_diabetes=True,
                family_history_heart=False
            )
            db.add(default_user)
            db.commit()
            print("Default user created.")
    except Exception as e:
        print(f"Error initializing default user: {e}")
    finally:
        db.close()

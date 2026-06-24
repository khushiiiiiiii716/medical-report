import os
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def create_sample_pdf(output_path):
    """
    Generates a clean digital PDF medical report using ReportLab
    containing selectable text that can be extracted via pypdf.
    """
    try:
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        styles = getSampleStyleSheet()
        story = []
        
        title_style = ParagraphStyle(
            'SampleTitle',
            parent=styles['Heading1'],
            fontSize=18,
            leading=22,
            spaceAfter=15,
            alignment=1  # Centered
        )
        
        body_style = ParagraphStyle(
            'SampleBody',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            spaceAfter=10
        )
        
        # Header Info
        story.append(Paragraph("<b>METROPOLIS PATHOLOGY LABS</b>", title_style))
        story.append(Paragraph("<b>Patient Name:</b> John Doe &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>Age/Gender:</b> 35 / Male", body_style))
        story.append(Paragraph("<b>Date of Collection:</b> 2026-06-20 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>Referred By:</b> Dr. Self", body_style))
        story.append(Spacer(1, 10))
        story.append(Paragraph("<b>COMPREHENSIVE HEALTH CHECKUP REPORT</b>", ParagraphStyle('Sub', parent=title_style, fontSize=12, leading=16)))
        story.append(Spacer(1, 10))
        
        # Biomarkers data
        data = [
            ["Test Parameter", "Observed Value", "Unit", "Biological Reference Interval"],
            ["Hemoglobin (Hb)", "11.5", "g/dL", "13.8 - 17.2"],
            ["Red Blood Cell (RBC)", "4.3", "million/mcL", "4.5 - 5.9"],
            ["White Blood Cell (WBC)", "7200", "cells/mcL", "4000 - 11000"],
            ["Platelet Count", "250000", "cells/mcL", "150000 - 450000"],
            ["Fasting Glucose", "112.0", "mg/dL", "70.0 - 100.0"],
            ["Postprandial Glucose", "145.0", "mg/dL", "70.0 - 140.0"],
            ["HbA1c", "6.1 %", "%", "4.0 - 5.6"],
            ["Total Cholesterol", "245.0", "mg/dL", "100.0 - 200.0"],
            ["LDL Cholesterol", "142.0", "mg/dL", "0.0 - 100.0"],
            ["HDL Cholesterol", "38.0", "mg/dL", "40.0 - 80.0"],
            ["Triglycerides", "185.0", "mg/dL", "0.0 - 150.0"],
            ["Thyroid TSH", "3.20", "mIU/L", "0.40 - 4.50"],
            ["Creatinine", "0.85", "mg/dL", "0.70 - 1.30"],
            ["Blood Pressure", "135/85", "mmHg", "90/60 - 120/80"]
        ]
        
        t = Table(data, colWidths=[180, 100, 70, 150])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('TOPPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(t)
        
        doc.build(story)
        print(f"Sample PDF report created at: {output_path}")
        return True
    except Exception as e:
        print(f"Error creating sample PDF: {e}")
        return False

def create_sample_image(output_path):
    """
    Generates a mock scanned image report using Pillow.
    Uses basic default fonts and draws high-contrast text on a white canvas.
    This text is formatted to be easily read by Tesseract OCR.
    """
    try:
        # Create a blank white canvas (A4 ratio-ish)
        img = Image.new('RGB', (800, 1000), color=(255, 255, 255))
        d = ImageDraw.Draw(img)
        
        # Draw a border around the image to simulate paper margins
        d.rectangle([(10, 10), (790, 990)], outline=(200, 200, 200), width=2)
        
        # Text details
        lines = [
            "APEX DIAGNOSTIC LABORATORIES",
            "============================",
            "PATIENT PROFILE SUMMARY",
            "Patient Name: John Doe",
            "Age/Gender  : 35 / Male",
            "Date        : 2026-06-21",
            "ID          : 987654",
            "----------------------------",
            "TEST PARAMETER        RESULT    UNIT       REFERENCE RANGE",
            "----------------------------",
            "Hemoglobin (Hb)       : 11.5    g/dL       13.8 - 17.2",
            "RBC Count             : 4.3     million/mcL 4.5 - 5.9",
            "WBC Count             : 7200    cells/mcL  4000 - 11000",
            "Platelets             : 250000  cells/mcL  150000 - 450000",
            "Fasting Glucose       : 112.0   mg/dL      70.0 - 100.0",
            "Postprandial Glucose  : 145.0   mg/dL      70.0 - 140.0",
            "HbA1c                 : 6.1 %   %          4.0 - 5.6",
            "Total Cholesterol     : 245.0   mg/dL      100.0 - 200.0",
            "LDL Cholesterol       : 142.0   mg/dL      0.0 - 100.0",
            "HDL Cholesterol       : 38.0    mg/dL      40.0 - 80.0",
            "Triglycerides         : 185.0   mg/dL      0.0 - 150.0",
            "Thyroid TSH           : 3.20    mIU/L      0.40 - 4.50",
            "Creatinine            : 0.85    mg/dL      0.70 - 1.30",
            "Blood Pressure        : 135/85  mmHg       90/60 - 120/80",
            "----------------------------",
            "Report signed by Pathologist."
        ]
        
        # We draw text using basic default font.
        # Since custom font paths differ on OS (Windows/Linux/Mac), drawing with default font is safest.
        # However, default font size cannot be changed in PIL, so we use coordinate offset for drawing lines
        # or we try to load a standard truetype font (e.g. Arial) on Windows.
        font = None
        try:
            # Try to load Windows standard Arial font
            font_path = "C:\\Windows\\Fonts\\arial.ttf"
            if os.path.exists(font_path):
                font = ImageFont.truetype(font_path, 16)
        except Exception:
            font = None
            
        y_text = 40
        for line in lines:
            # Bold for header lines
            if "APEX" in line or "=====" in line or "PARAMETER" in line:
                color = (20, 30, 50)
            else:
                color = (50, 50, 50)
                
            if font:
                d.text((50, y_text), line, fill=color, font=font)
                y_text += 32
            else:
                d.text((50, y_text), line, fill=color)
                y_text += 20
                
        # Save image
        img.save(output_path)
        print(f"Sample image report created at: {output_path}")
        return True
    except Exception as e:
        print(f"Error creating sample image: {e}")
        return False

def make_samples():
    samples_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "samples")
    os.makedirs(samples_dir, exist_ok=True)
    
    pdf_path = os.path.join(samples_dir, "digital_blood_report.pdf")
    img_path = os.path.join(samples_dir, "scanned_blood_report.png")
    
    create_sample_pdf(pdf_path)
    create_sample_image(img_path)

if __name__ == "__main__":
    make_samples()

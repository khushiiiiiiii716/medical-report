import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_report_pdf(report_data, output_path):
    """
    Generates a professional styled PDF health summary using ReportLab.
    report_data is a dictionary containing:
      - user_info: dict (name, age, gender, bmi)
      - health_score: int
      - biomarkers: list of dicts (name, value, unit, reference_range, status, category)
      - risks: dict (diabetes, heart_disease, anemia)
      - recommendations: dict (diet, exercise, lifestyle)
    """
    try:
        # Create document template with 0.75-inch margins
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=54,
            leftMargin=54,
            topMargin=54,
            bottomMargin=54
        )
        
        styles = getSampleStyleSheet()
        story = []
        
        # Define Custom Color Palette
        PRIMARY_COLOR = colors.HexColor("#1E293B")   # Slate 800
        SECONDARY_COLOR = colors.HexColor("#0284C7") # Sky 600
        ACCENT_COLOR = colors.HexColor("#0F766E")    # Teal 700
        BG_LIGHT = colors.HexColor("#F8FAFC")        # Slate 50
        BORDER_COLOR = colors.HexColor("#E2E8F0")    # Slate 200
        
        COLOR_NORMAL = colors.HexColor("#10B981")    # Emerald 500
        COLOR_BORDERLINE = colors.HexColor("#F59E0B")# Amber 500
        COLOR_CRITICAL = colors.HexColor("#EF4444")  # Red 500
        
        # Custom Typography Styles
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=PRIMARY_COLOR,
            alignment=0, # Left-aligned
            spaceAfter=15
        )
        
        subtitle_style = ParagraphStyle(
            'DocSubTitle',
            parent=styles['Heading3'],
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=18,
            textColor=SECONDARY_COLOR,
            spaceBefore=12,
            spaceAfter=8
        )
        
        body_style = ParagraphStyle(
            'DocBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=PRIMARY_COLOR
        )
        
        body_bold = ParagraphStyle(
            'DocBodyBold',
            parent=body_style,
            fontName='Helvetica-Bold'
        )
        
        table_header_style = ParagraphStyle(
            'TableHeader',
            parent=body_style,
            fontName='Helvetica-Bold',
            textColor=colors.white
        )
        
        list_item_style = ParagraphStyle(
            'DocListItem',
            parent=body_style,
            leftIndent=15,
            firstLineIndent=-10,
            spaceAfter=4
        )
        
        # 1. Header (Title & Patient Details)
        story.append(Paragraph("AI-BASED HEALTH REPORT SUMMARY", title_style))
        story.append(Spacer(1, 5))
        
        # Patient Details Box
        user_info = report_data.get("user_info", {})
        patient_details = [
            [
                Paragraph("<b>Patient Name:</b>", body_style), Paragraph(user_info.get("name", "N/A"), body_style),
                Paragraph("<b>Date Generated:</b>", body_style), Paragraph(report_data.get("date", "N/A"), body_style)
            ],
            [
                Paragraph("<b>Age / Gender:</b>", body_style), Paragraph(f"{user_info.get('age', 'N/A')} / {user_info.get('gender', 'N/A')}", body_style),
                Paragraph("<b>Body Mass Index (BMI):</b>", body_style), Paragraph(f"{user_info.get('bmi', 'N/A')} ({user_info.get('bmi_status', 'Normal')})", body_style)
            ]
        ]
        
        detail_table = Table(patient_details, colWidths=[110, 140, 110, 140])
        detail_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#F1F5F9")),
        ]))
        story.append(detail_table)
        story.append(Spacer(1, 15))
        
        # 2. Overall Health Score Section
        score = report_data.get("health_score", 100)
        score_rating = "EXCELLENT" if score >= 90 else "GOOD" if score >= 75 else "MODERATE" if score >= 60 else "ATTENTION REQUIRED"
        score_color = COLOR_NORMAL if score >= 90 else COLOR_BORDERLINE if score >= 75 else COLOR_CRITICAL
        
        score_html = f"OVERALL HEALTH SCORE: <font color='{score_color}'><b>{score}/100</b></font> ({score_rating})"
        story.append(Paragraph(score_html, subtitle_style))
        story.append(Spacer(1, 5))
        
        score_desc = (
            "This health score is calculated based on the clinical parameters extracted from your medical report. "
            "Points are deducted for any parameters that fall outside the standard reference ranges. Review the breakdown below "
            "for specific abnormalities."
        )
        story.append(Paragraph(score_desc, body_style))
        story.append(Spacer(1, 15))
        
        # 3. Biomarkers Table
        story.append(Paragraph("LABORATORY BIOMARKERS DETAILED ANALYSIS", subtitle_style))
        story.append(Spacer(1, 5))
        
        # Table Columns: Biomarker, Measured Value, Unit, Status, Reference Range
        table_data = [
            [
                Paragraph("Biomarker", table_header_style),
                Paragraph("Value", table_header_style),
                Paragraph("Unit", table_header_style),
                Paragraph("Status", table_header_style),
                Paragraph("Reference Range", table_header_style)
            ]
        ]
        
        biomarkers = report_data.get("biomarkers", [])
        if not biomarkers:
            table_data.append([Paragraph("No biomarkers extracted.", body_style)] + [Paragraph("", body_style)]*4)
        else:
            for bio in biomarkers:
                status = bio.get("status", "Normal")
                status_color = COLOR_CRITICAL if status in ["High", "Low"] else COLOR_BORDERLINE if status == "Borderline" else COLOR_NORMAL
                
                table_data.append([
                    Paragraph(f"<b>{bio.get('name', 'N/A')}</b><br/><font size='7' color='#64748B'>{bio.get('category', '')}</font>", body_style),
                    Paragraph(str(bio.get('value', 'N/A')), body_style),
                    Paragraph(bio.get('unit', 'N/A'), body_style),
                    Paragraph(f"<font color='{status_color}'><b>{status}</b></font>", body_style),
                    Paragraph(bio.get('reference_range', 'N/A'), body_style)
                ])
                
        bio_table = Table(table_data, colWidths=[160, 70, 60, 90, 120])
        # Table Styling
        bio_table_style = TableStyle([
            ('BACKGROUND', (0,0), (-1,0), PRIMARY_COLOR),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ])
        
        # Add alternating row backgrounds
        for idx in range(1, len(table_data)):
            bg = BG_LIGHT if idx % 2 == 1 else colors.white
            bio_table_style.add('BACKGROUND', (0, idx), (-1, idx), bg)
            
        bio_table.setStyle(bio_table_style)
        story.append(bio_table)
        
        # Page Break before Predictions and Recommendations to keep report neatly structured
        story.append(PageBreak())
        
        # 4. Disease Risk Prediction Section
        story.append(Paragraph("DISEASE RISK ASSESSMENT (AI MODELS)", subtitle_style))
        story.append(Spacer(1, 5))
        story.append(Paragraph(
            "Our machine learning classifiers evaluate your extracted biomarkers, age, gender, and BMI against standard epidemiologic "
            "clinical records to evaluate your baseline risk levels. These estimates reflect statistical probabilities and are not absolute diagnoses.",
            body_style
        ))
        story.append(Spacer(1, 10))
        
        risks = report_data.get("risks", {})
        risk_data = [
            [
                Paragraph("<b>Predicted Condition</b>", table_header_style),
                Paragraph("<b>Risk Probability</b>", table_header_style),
                Paragraph("<b>Risk Classification</b>", table_header_style)
            ]
        ]
        
        conditions = [
            ("Diabetes Mellitus", risks.get("diabetes", 0.0)),
            ("Cardiovascular (Heart) Disease", risks.get("heart_disease", 0.0)),
            ("Anemia (Iron Deficiency)", risks.get("anemia", 0.0))
        ]
        
        for condition_name, risk_val in conditions:
            level = "CRITICAL RISK" if risk_val >= 60 else "ELEVATED RISK" if risk_val >= 35 else "NORMAL / LOW RISK"
            level_color = COLOR_CRITICAL if risk_val >= 60 else COLOR_BORDERLINE if risk_val >= 35 else COLOR_NORMAL
            
            risk_data.append([
                Paragraph(condition_name, body_style),
                Paragraph(f"<b>{risk_val:.1f}%</b>", body_style),
                Paragraph(f"<font color='{level_color}'><b>{level}</b></font>", body_bold)
            ])
            
        risk_table = Table(risk_data, colWidths=[200, 120, 180])
        risk_table_style = TableStyle([
            ('BACKGROUND', (0,0), (-1,0), SECONDARY_COLOR),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ])
        for idx in range(1, len(risk_data)):
            bg = BG_LIGHT if idx % 2 == 1 else colors.white
            risk_table_style.add('BACKGROUND', (0, idx), (-1, idx), bg)
        risk_table.setStyle(risk_table_style)
        story.append(risk_table)
        story.append(Spacer(1, 20))
        
        # 5. Dietary & Lifestyle Recommendations
        story.append(Paragraph("TAILORED DIETARY & LIFESTYLE ROADMAP", subtitle_style))
        story.append(Spacer(1, 5))
        
        recs = report_data.get("recommendations", {})
        
        story.append(Paragraph("<b>Dietary Interventions:</b>", body_bold))
        story.append(Spacer(1, 3))
        diet_recs = recs.get("diet", [])
        if diet_recs:
            for item in diet_recs:
                story.append(Paragraph(f"• {item}", list_item_style))
        else:
            story.append(Paragraph("Maintain a balanced diet rich in vegetables, lean protein, and whole grains.", list_item_style))
        story.append(Spacer(1, 10))
            
        story.append(Paragraph("<b>Exercise & Fitness Plan:</b>", body_bold))
        story.append(Spacer(1, 3))
        exercise_recs = recs.get("exercise", [])
        if exercise_recs:
            for item in exercise_recs:
                story.append(Paragraph(f"• {item}", list_item_style))
        else:
            story.append(Paragraph("Aim for 150 minutes of moderate-intensity cardio and 2 resistance workouts weekly.", list_item_style))
        story.append(Spacer(1, 10))
            
        story.append(Paragraph("<b>General Wellness & Habits:</b>", body_bold))
        story.append(Spacer(1, 3))
        lifestyle_recs = recs.get("lifestyle", [])
        if lifestyle_recs:
            for item in lifestyle_recs:
                story.append(Paragraph(f"• {item}", list_item_style))
        else:
            story.append(Paragraph("Ensure 7-8 hours of quality sleep, manage daily stress, and stay well hydrated.", list_item_style))
            
        story.append(Spacer(1, 25))
        
        # Medical Disclaimer Block
        disclaimer_text = (
            "<b>IMPORTANT NOTICE:</b> This document is an automated summary generated by artificial intelligence "
            "and health prediction models. It is designed solely for educational and informational purposes. This report "
            "DOES NOT constitute medical advice. Always seek the advice of your physician or other qualified health "
            "provider with any questions regarding a medical condition. Never disregard professional medical advice "
            "or delay in seeking it because of something you have read in this summary."
        )
        disclaimer_style = ParagraphStyle(
            'DocDisclaimer',
            parent=body_style,
            fontSize=7.5,
            leading=10.5,
            textColor=colors.HexColor("#64748B"),
            alignment=4 # Justified
        )
        
        disclaimer_table = Table([[Paragraph(disclaimer_text, disclaimer_style)]], colWidths=[500])
        disclaimer_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
            ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ]))
        
        story.append(disclaimer_table)
        
        # Build PDF
        doc.build(story)
        print(f"PDF generated successfully at: {output_path}")
        return True
    except Exception as e:
        print(f"Error generating PDF: {e}")
        return False

import os
import smtplib
from email.message import EmailMessage
import threading

def send_email_async(subject, body, to_email):
    """
    Sends an email using SMTP credentials from the environment.
    Falls back to console mock if credentials are not provided.
    """
    smtp_server = os.getenv('SMTP_SERVER')
    smtp_port = os.getenv('SMTP_PORT', 587)
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')

    # Mock Mode if no SMTP server is configured
    if not smtp_server or not smtp_user:
        print("\n" + "="*50)
        print("MOCK EMAIL ALERT (SMTP not configured in .env)")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print("-" * 50)
        print(body)
        print("="*50 + "\n")
        return

    # Real Email Sending
    try:
        msg = EmailMessage()
        msg.set_content(body)
        msg['Subject'] = subject
        msg['From'] = smtp_user
        msg['To'] = to_email

        server = smtplib.SMTP(smtp_server, int(smtp_port))
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        print(f"Successfully sent alert email to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

def notify_critical_anomalies(user, critical_biomarkers, ml_anomalies):
    """
    Constructs and dispatches an email alert for critical biomarkers or ML anomalies.
    """
    if not critical_biomarkers and not ml_anomalies:
        return

    subject = "URGENT: Critical Health Biomarkers Detected - Aura Med"
    
    body = f"Hello {user.name},\n\n"
    body += "Our AI Analysis has detected critical anomalies in your latest uploaded medical report.\n"
    body += "Please review these findings and consult with your healthcare provider immediately.\n\n"
    
    if critical_biomarkers:
        body += "--- OUT OF RANGE BIOMARKERS ---\n"
        for b in critical_biomarkers:
            body += f"- {b['name']}: {b['value']} {b['unit']} (Status: {b['status']})\n"
            
    if ml_anomalies:
        body += "\n--- UNUSUAL TRENDS (AI DETECTED) ---\n"
        body += "The following values deviate significantly from your normal historical trends:\n"
        for b in ml_anomalies:
            body += f"- {b['name']}: {b['value']} {b['unit']}\n"
            
    body += "\nLog in to your Aura Med Dashboard to see a full breakdown and personalized recommendations.\n\n"
    body += "Stay healthy,\n"
    body += "Aura Med AI Assistant"

    # Default to a mock recipient if user doesn't have an email field yet
    to_email = getattr(user, 'email', 'user@example.com')
    
    # Run in a background thread to prevent blocking the API response
    thread = threading.Thread(target=send_email_async, args=(subject, body, to_email))
    thread.start()

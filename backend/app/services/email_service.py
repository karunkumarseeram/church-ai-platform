import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

def send_email(to_email, otp):
    msg = MIMEText(f"Your OTP is {otp}")
    msg["Subject"] = "HIM We Proclaim OTP"
    msg["From"] = EMAIL_USER
    msg["To"] = to_email

    # Use SSL connection
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.send_message(msg)
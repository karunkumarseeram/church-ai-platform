import smtplib
from email.mime.text import MIMEText


def send_email(to_email, otp):
    msg = MIMEText(f"Your OTP is {otp}")
    msg["Subject"] = "FFT Church OTP"
    msg["From"] = "your_email@gmail.com"
    msg["To"] = to_email

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login("your_email@gmail.com", "app_password")
        server.send_message(msg)
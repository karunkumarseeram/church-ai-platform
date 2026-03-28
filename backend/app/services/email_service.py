import os
import smtplib
from dotenv import load_dotenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template

# Load env
load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")


# ✅ OTP EMAIL (UPDATED → NOW HTML, SAME FUNCTION NAME)
def send_email(to_email, otp):
    template_path = os.path.join(
        os.path.dirname(__file__),
        "../templates/otp_email.html"
    )

    # Read HTML template
    with open(template_path, "r", encoding="utf-8") as file:
        html_content = file.read()

    # Inject OTP into template
    template = Template(html_content)
    rendered_html = template.render(otp=otp)

    # Create email
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "HIM We Proclaim OTP"
    msg["From"] = EMAIL_USER
    msg["To"] = to_email

    # OPTIONAL fallback (safe, won't break anything)
    msg.attach(MIMEText(f"Your OTP is {otp}", "plain"))

    # HTML version
    msg.attach(MIMEText(rendered_html, "html"))

    # Send email (UNCHANGED)
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.send_message(msg)


# ✅ WELCOME EMAIL (NO CHANGE)
def send_welcome_email(to_email, name):
    template_path = os.path.join(
        os.path.dirname(__file__),
        "../templates/welcome_email.html"
    )

    with open(template_path, "r", encoding="utf-8") as file:
        html_content = file.read()

    template = Template(html_content)
    rendered_html = template.render(name=name)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Welcome to FFT Church 🙏"
    msg["From"] = EMAIL_USER
    msg["To"] = to_email

    msg.attach(MIMEText(rendered_html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.send_message(msg)
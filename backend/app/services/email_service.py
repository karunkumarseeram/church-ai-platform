import resend
import os
from jinja2 import Template
from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY


# ---------------- LOAD TEMPLATE HELPER ----------------
def render_template(template_path: str, context: dict):
    with open(template_path, "r", encoding="utf-8") as file:
        html = file.read()
    return Template(html).render(**context)


# ---------------- OTP EMAIL ----------------
def send_email(to_email, otp):

    template_path = os.path.join(
        os.path.dirname(__file__),
        "../templates/otp_email.html"
    )

    html = render_template(template_path, {"otp": otp})

    resend.Emails.send({
        "from": "FFT Church <noreply@fftchurch.com>",
        "to": [to_email],
        "subject": "HIM We Proclaim OTP",
        "html": html
    })


# ---------------- WELCOME EMAIL ----------------
def send_welcome_email(to_email, name):

    template_path = os.path.join(
        os.path.dirname(__file__),
        "../templates/welcome_email.html"
    )

    html = render_template(template_path, {
        "name": name,
        "frontend_url": settings.FRONTEND_URL
    })

    resend.Emails.send({
        "from": "FFT Church <noreply@fftchurch.com>",
        "to": [to_email],
        "subject": "Welcome to FFT Church 🙏",
        "html": html
    })


# ---------------- RESET PASSWORD ----------------
def send_reset_email(to_email, reset_link):

    template_path = os.path.join(
        os.path.dirname(__file__),
        "../templates/reset_password.html"
    )

    html = render_template(template_path, {
        "reset_link": reset_link
    })

    resend.Emails.send({
        "from": "FFT Church <noreply@fftchurch.com>",
        "to": [to_email],
        "subject": "Reset Your Password",
        "html": html
    })












################################### LOCAL EMAIL SERVICE (SMTP) - COMMENTED OUT ###################################


# import os
# import smtplib
# from dotenv import load_dotenv
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
# from jinja2 import Template
# from app.core.config import settings
# # Load env
# # load_dotenv()

# # EMAIL_USER = os.getenv("EMAIL_USER")
# # EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
# EMAIL_USER = settings.EMAIL_USER
# EMAIL_PASSWORD = settings.EMAIL_PASSWORD


# # ✅ OTP EMAIL (UPDATED → NOW HTML, SAME FUNCTION NAME)
# def send_email(to_email, otp):
#     template_path = os.path.join(
#         os.path.dirname(__file__),
#         "../templates/otp_email.html"
#     )

#     # Read HTML template
#     with open(template_path, "r", encoding="utf-8") as file:
#         html_content = file.read()

#     # Inject OTP into template
#     template = Template(html_content)
#     rendered_html = template.render(otp=otp)

#     # Create email
#     msg = MIMEMultipart("alternative")
#     msg["Subject"] = "HIM We Proclaim OTP"
#     msg["From"] = EMAIL_USER
#     msg["To"] = to_email

#     # OPTIONAL fallback (safe, won't break anything)
#     msg.attach(MIMEText(f"Your OTP is {otp}", "plain"))

#     # HTML version
#     msg.attach(MIMEText(rendered_html, "html"))

#     # Send email (UNCHANGED)
#     with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
#         server.login(EMAIL_USER, EMAIL_PASSWORD)
#         server.send_message(msg)


# # ✅ WELCOME EMAIL (NO CHANGE)
# # ✅ WELCOME EMAIL (FIXED)
# def send_welcome_email(to_email, name):
#     template_path = os.path.join(
#         os.path.dirname(__file__),
#         "../templates/welcome_email.html"
#     )

#     with open(template_path, "r", encoding="utf-8") as file:
#         html_content = file.read()

#     template = Template(html_content)

#     rendered_html = template.render(
#         name=name,
#         frontend_url=settings.FRONTEND_URL
#     )

#     msg = MIMEMultipart("alternative")
#     msg["Subject"] = "Welcome to FFT Church 🙏"
#     msg["From"] = EMAIL_USER
#     msg["To"] = to_email

#     msg.attach(MIMEText(rendered_html, "html"))

#     with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
#         server.login(EMAIL_USER, EMAIL_PASSWORD)
#         server.send_message(msg)

# # ✅ FORGOT PASSWORD EMAIL
# def send_reset_email(to_email, reset_link):
#     """
#     Sends a password reset email with a clickable link.
#     Keeps existing OTP/welcome email code intact.
#     """
#     template_path = os.path.join(
#         os.path.dirname(__file__),
#         "../templates/reset_password.html"
#     )

#     # Read HTML template
#     with open(template_path, "r", encoding="utf-8") as file:
#         html_content = file.read()

#     # Inject reset link into template
#     template = Template(html_content)
#     rendered_html = template.render(reset_link=reset_link)

#     # Create email
#     msg = MIMEMultipart("alternative")
#     msg["Subject"] = "FFT Church: Reset Your Password"
#     msg["From"] = EMAIL_USER
#     msg["To"] = to_email

#     # OPTIONAL plain-text fallback
#     msg.attach(MIMEText(f"Reset your password using this link: {reset_link}", "plain"))

#     # HTML version
#     msg.attach(MIMEText(rendered_html, "html"))

#     # Send email
#     with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
#         server.login(EMAIL_USER, EMAIL_PASSWORD)
#         server.send_message(msg)
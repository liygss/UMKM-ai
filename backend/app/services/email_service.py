"""
Email service untuk verifikasi email dan notifikasi.

Menggunakan SMTP (konfigurasi via environment variables).
Email dikirim secara asynchronous (non-blocking) menggunakan background task.
"""

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config.logging import get_logger
from app.config.settings import settings

logger = get_logger(__name__)


def send_verification_email(to_email: str, verification_token: str, full_name: str) -> bool:
    """
    Kirim email verifikasi ke user yang baru daftar.
    Mengembalikan True jika berhasil, False jika gagal.
    """
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.warning("SMTP belum dikonfigurasi. Email verifikasi tidak dikirim ke %s", to_email)
        return False

    try:
        # Buat email
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Verifikasi Email - AI Accounting RAG"
        msg["From"] = settings.SMTP_FROM
        msg["To"] = to_email

        # HTML content
        verify_url = f"http://localhost:8000/auth/verify-email?token={verification_token}"
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e1b4b, #312e81); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">AI Accounting RAG</h1>
            </div>
            <div style="padding: 20px; background: #f8fafc;">
                <h2 style="color: #1e293b;">Selamat Datang, {full_name}!</h2>
                <p style="color: #475569;">Terima kasih telah mendaftar. Silakan klik tombol di bawah untuk memverifikasi email Anda:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verify_url}"
                       style="background: #2563eb; color: white; padding: 12px 24px;
                              text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Verifikasi Email
                    </a>
                </div>
                <p style="color: #94a3b8; font-size: 12px;">
                    Link ini berlaku selama 24 jam. Jika Anda tidak mendaftar, abaikan email ini.
                </p>
            </div>
        </body>
        </html>
        """

        # Plain text fallback
        text_content = f"""
Selamat Datang, {full_name}!

Terima kasih telah mendaftar di AI Accounting RAG.
Silakan kunjungi link berikut untuk memverifikasi email Anda:

{verify_url}

Link ini berlaku selama 24 jam.
Jika Anda tidak mendaftar, abaikan email ini.
        """

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        # Kirim via SMTP
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)

        logger.info("Email verifikasi berhasil dikirim ke %s", to_email)
        return True

    except Exception as exc:
        logger.error("Gagal mengirim email verifikasi ke %s: %s", to_email, exc)
        return False


def send_password_reset_email(to_email: str, reset_token: str, full_name: str) -> bool:
    """Kirim email berisi link untuk mereset password. Best-effort, tidak di-block."""
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.warning("SMTP belum dikonfigurasi. Email reset password tidak dikirim ke %s", to_email)
        return False

    reset_url = f"{settings.FRONTEND_BASE_URL}/reset-password?token={reset_token}"

    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e1b4b, #312e81); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">AI Accounting RAG</h1>
        </div>
        <div style="padding: 20px; background: #f8fafc;">
            <h2 style="color: #1e293b;">Atur Ulang Kata Sandi</h2>
            <p style="color: #475569;">Halo, {full_name}! Kami menerima permintaan untuk mereset kata sandi akun Anda.
            Klik tombol di bawah untuk membuat kata sandi baru:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}"
                   style="background: #2563eb; color: white; padding: 12px 24px;
                          text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Reset Kata Sandi
                </a>
            </div>
            <p style="color: #94a3b8; font-size: 12px;">
                Link ini berlaku selama 30 menit. Jika Anda tidak meminta reset kata sandi, abaikan email ini.
            </p>
        </div>
    </body>
    </html>
    """
    text_content = f"""
Halo, {full_name}!

Anda meminta untuk mereset kata sandi akun Anda.
Kunjungi link berikut untuk membuat kata sandi baru:

{reset_url}

Link ini berlaku selama 30 menit.
Jika Anda tidak meminta reset kata sandi, abaikan email ini.
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Reset Kata Sandi - AI Accounting RAG"
        msg["From"] = settings.SMTP_FROM
        msg["To"] = to_email
        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)

        logger.info("Email reset password berhasil dikirim ke %s", to_email)
        return True
    except Exception as exc:
        logger.error("Gagal mengirim email reset password ke %s: %s", to_email, exc)
        return False

import logging

from apscheduler.schedulers.background import BackgroundScheduler

from app.core.config import settings
from app.core.supabase_client import create_service_supabase_client
from app.services.email_service import smtp_configured
from app.services.reminder_service import process_reminders

logger = logging.getLogger(__name__)


def run_reminder_job() -> None:
    if not smtp_configured():
        logger.info("SMTP yok — hatırlatma job atlandı")
        return
    try:
        supabase = create_service_supabase_client()
        sent = process_reminders(supabase)
        logger.info("Hatırlatma job tamamlandı: %s e-posta gönderildi", sent)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Hatırlatma job hatası: %s", exc)


def start_scheduler() -> BackgroundScheduler | None:
    if not settings.ENABLE_SCHEDULER:
        return None
    if not smtp_configured():
        logger.info("Scheduler devre dışı — SMTP yapılandırılmamış")
        return None

    scheduler = BackgroundScheduler(timezone="Europe/Istanbul")
    scheduler.add_job(
        run_reminder_job,
        trigger="cron",
        hour=settings.REMINDER_CRON_HOUR,
        minute=0,
        id="payment_reminders",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("APScheduler başlatıldı (her gün %02d:00)", settings.REMINDER_CRON_HOUR)
    return scheduler

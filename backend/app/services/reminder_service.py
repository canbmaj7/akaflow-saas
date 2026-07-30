import logging
from datetime import date, timedelta
from typing import Any

from supabase import Client

from app.core.config import settings
from app.services.crud import _now_iso
from app.services.email_service import send_email, smtp_configured

logger = logging.getLogger(__name__)


def _resolve_recipient(student: dict[str, Any]) -> str | None:
    if student.get("notify_target") == "parent":
        return student.get("parent_email") or student.get("email")
    return student.get("email") or student.get("parent_email")


def find_due_reminders(
    supabase: Client,
    days_before: int | None = None,
    academy_id: str | None = None,
) -> list[dict[str, Any]]:
    window_days = days_before if days_before is not None else settings.REMINDER_DAYS_BEFORE
    today = date.today()
    deadline = today + timedelta(days=window_days)

    query = (
        supabase.table("payments")
        .select("*, students(name, email, parent_email, notify_target)")
        .in_("status", ["pending", "overdue"])
        .eq("reminder_sent", False)
        .gte("due_date", today.isoformat())
        .lte("due_date", deadline.isoformat())
    )
    if academy_id:
        query = query.eq("academy_id", academy_id)

    response = query.order("due_date").execute()
    return response.data or []


def send_payment_reminder(
    supabase: Client,
    payment_id: str,
    academy_id: str,
) -> dict[str, Any]:
    """Tek ödeme için hatırlatma gönderir."""
    if not smtp_configured():
        raise RuntimeError("SMTP yapılandırması eksik")

    response = (
        supabase.table("payments")
        .select("*, students(name, email, parent_email, notify_target)")
        .eq("id", payment_id)
        .eq("academy_id", academy_id)
        .limit(1)
        .execute()
    )
    if not response.data:
        raise ValueError("Ödeme kaydı bulunamadı")

    payment = response.data[0]
    eligible = find_due_reminders(supabase, academy_id=academy_id)
    eligible_ids = {row["id"] for row in eligible}
    if payment["id"] not in eligible_ids:
        raise ValueError("Bu ödeme hatırlatma kriterlerine uymuyor")

    student = payment.get("students") or {}
    recipient = _resolve_recipient(student)
    if not recipient:
        raise ValueError("Alıcı e-posta adresi bulunamadı")

    subject = "AkaFlow — Ödeme hatırlatması"
    body = (
        f"Merhaba,\n\n"
        f"{student.get('name', 'Öğrenci')} için {payment['due_date']} vadeli "
        f"{payment['amount']} TL tutarındaki ödemeniz yaklaşıyor.\n\n"
        f"Lütfen ödemenizi zamanında tamamlayın.\n\n"
        f"— AkaFlow"
    )
    send_email(recipient, subject, body)
    supabase.table("payments").update(
        {"reminder_sent": True, "updated_at": _now_iso()},
    ).eq("id", payment["id"]).execute()

    return {
        "payment_id": payment["id"],
        "recipient": recipient,
        "student_name": student.get("name"),
    }


def list_reminder_candidates(
    supabase: Client,
    academy_id: str,
) -> list[dict[str, Any]]:
    """Hatırlatma adaylarını detaylı listeler."""
    today = date.today()
    window_days = settings.REMINDER_DAYS_BEFORE
    deadline = today + timedelta(days=window_days)

    response = (
        supabase.table("payments")
        .select("*, students(name, email, parent_email, notify_target)")
        .eq("academy_id", academy_id)
        .in_("status", ["pending", "overdue"])
        .order("due_date")
        .execute()
    )

    candidates: list[dict[str, Any]] = []
    for payment in response.data or []:
        student = payment.get("students") or {}
        recipient = _resolve_recipient(student)
        due = date.fromisoformat(payment["due_date"])
        days_until = (due - today).days
        eligible = (
            not payment.get("reminder_sent")
            and due >= today
            and due <= deadline
        )
        candidates.append(
            {
                "payment_id": payment["id"],
                "student_id": payment["student_id"],
                "student_name": student.get("name"),
                "amount": str(payment["amount"]),
                "due_date": payment["due_date"],
                "status": payment["status"],
                "reminder_sent": payment.get("reminder_sent", False),
                "days_until_due": days_until,
                "recipient_email": recipient,
                "notify_target": student.get("notify_target"),
                "eligible": eligible,
                "ineligible_reason": _ineligible_reason(
                    payment, due, today, deadline, recipient,
                ),
            }
        )
    return candidates


def _ineligible_reason(
    payment: dict[str, Any],
    due: date,
    today: date,
    deadline: date,
    recipient: str | None,
) -> str | None:
    if payment.get("reminder_sent"):
        return "Hatırlatma daha önce gönderildi"
    if due < today:
        return "Vade geçmiş (yalnızca bugün ve sonrası hatırlatılır)"
    if due > deadline:
        return f"Vade {settings.REMINDER_DAYS_BEFORE} günden uzak"
    if not recipient:
        return "E-posta adresi yok"
    return None


def process_reminders(supabase: Client, academy_id: str | None = None) -> int:
    if not smtp_configured():
        logger.warning("SMTP yapılandırılmadı — hatırlatma atlandı")
        return 0

    due_rows = find_due_reminders(supabase, academy_id=academy_id)
    sent_count = 0

    for payment in due_rows:
        student = payment.get("students") or {}
        recipient = _resolve_recipient(student)
        if not recipient:
            logger.warning("E-posta yok, atlandı payment_id=%s", payment.get("id"))
            continue

        subject = "AkaFlow — Ödeme hatırlatması"
        body = (
            f"Merhaba,\n\n"
            f"{student.get('name', 'Öğrenci')} için {payment['due_date']} vadeli "
            f"{payment['amount']} TL tutarındaki ödemeniz yaklaşıyor.\n\n"
            f"Lütfen ödemenizi zamanında tamamlayın.\n\n"
            f"— AkaFlow"
        )

        try:
            send_email(recipient, subject, body)
            supabase.table("payments").update(
                {"reminder_sent": True, "updated_at": _now_iso()},
            ).eq("id", payment["id"]).execute()
            sent_count += 1
        except Exception as exc:  # noqa: BLE001
            logger.error("Hatırlatma gönderilemedi payment_id=%s: %s", payment.get("id"), exc)

    return sent_count

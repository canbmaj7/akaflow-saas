from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.api.deps import get_academy_id, get_supabase_client
from app.schemas.reminder import (
    ReminderBulkResult,
    ReminderCandidate,
    ReminderSendResult,
)
from app.services.email_service import smtp_configured
from app.services.reminder_service import (
    list_reminder_candidates,
    process_reminders,
    send_payment_reminder,
)

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.get("/candidates", response_model=list[ReminderCandidate])
def get_reminder_candidates(
    supabase: Annotated[Client, Depends(get_supabase_client)],
    academy_id: Annotated[UUID, Depends(get_academy_id)],
) -> list[ReminderCandidate]:
    rows = list_reminder_candidates(supabase, academy_id=str(academy_id))
    return [ReminderCandidate.model_validate(row) for row in rows]


@router.post("/run", response_model=ReminderBulkResult)
def run_reminders_now(
    supabase: Annotated[Client, Depends(get_supabase_client)],
    academy_id: Annotated[UUID, Depends(get_academy_id)],
) -> ReminderBulkResult:
    if not smtp_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SMTP yapılandırması eksik",
        )
    sent = process_reminders(supabase, academy_id=str(academy_id))
    return ReminderBulkResult(sent=sent)


@router.post("/payment/{payment_id}", response_model=ReminderSendResult)
def send_single_reminder(
    payment_id: UUID,
    supabase: Annotated[Client, Depends(get_supabase_client)],
    academy_id: Annotated[UUID, Depends(get_academy_id)],
) -> ReminderSendResult:
    if not smtp_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SMTP yapılandırması eksik",
        )
    try:
        result = send_payment_reminder(
            supabase,
            payment_id=str(payment_id),
            academy_id=str(academy_id),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    return ReminderSendResult.model_validate(result)

from uuid import UUID

from pydantic import BaseModel


class ReminderCandidate(BaseModel):
    payment_id: UUID
    student_id: UUID
    student_name: str | None
    amount: str
    due_date: str
    status: str
    reminder_sent: bool
    days_until_due: int
    recipient_email: str | None
    notify_target: str | None
    eligible: bool
    ineligible_reason: str | None


class ReminderSendResult(BaseModel):
    payment_id: UUID
    recipient: str
    student_name: str | None = None


class ReminderBulkResult(BaseModel):
    sent: int

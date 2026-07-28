from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PaymentStatus(str, Enum):
    paid = "paid"
    pending = "pending"
    overdue = "overdue"


class PaymentCreate(BaseModel):
    student_id: UUID
    amount: Decimal = Field(default=Decimal("0"), ge=0)
    due_date: date
    status: PaymentStatus = PaymentStatus.pending
    last_delay_days: int = Field(default=0, ge=0)
    total_fee: Decimal | None = None
    amount_paid: Decimal | None = None
    remaining_debt: Decimal | None = None
    installment_count: int | None = None
    payment_method: str | None = None
    notes: str | None = None


class PaymentUpdate(BaseModel):
    student_id: UUID | None = None
    amount: Decimal | None = Field(default=None, ge=0)
    due_date: date | None = None
    status: PaymentStatus | None = None
    last_delay_days: int | None = Field(default=None, ge=0)
    total_fee: Decimal | None = None
    amount_paid: Decimal | None = None
    remaining_debt: Decimal | None = None
    installment_count: int | None = None
    payment_method: str | None = None
    notes: str | None = None
    reminder_sent: bool | None = None


class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    academy_id: UUID
    student_id: UUID
    amount: Decimal
    due_date: date
    status: PaymentStatus
    last_delay_days: int
    reminder_sent: bool
    total_fee: Decimal | None
    amount_paid: Decimal | None
    remaining_debt: Decimal | None
    installment_count: int | None
    payment_method: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

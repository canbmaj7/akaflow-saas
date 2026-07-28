from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class StudentStatus(str, Enum):
    active = "active"
    inactive = "inactive"


class NotifyTarget(str, Enum):
    student = "student"
    parent = "parent"


class StudentCreate(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr | None = None
    parent_email: EmailStr | None = None
    notify_target: NotifyTarget = NotifyTarget.student
    enrollment_date: date | None = None
    status: StudentStatus = StudentStatus.active
    course_type: str | None = None
    course_duration_weeks: int | None = None
    enrolled_weeks: int | None = None
    weekly_class_hours: int | None = None
    total_class_hours: int | None = None
    days_since_last_login: int | None = None
    logins_last_30_days: int | None = None
    ai_interactions_last_30_days: int | None = None
    homework_completion_rate: Decimal | None = None
    satisfaction_score: Decimal | None = None
    absence_hours: Decimal | None = None
    absence_rate: Decimal | None = None
    consecutive_absences: int | None = None


class StudentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    email: EmailStr | None = None
    parent_email: EmailStr | None = None
    notify_target: NotifyTarget | None = None
    enrollment_date: date | None = None
    status: StudentStatus | None = None
    course_type: str | None = None
    course_duration_weeks: int | None = None
    enrolled_weeks: int | None = None
    weekly_class_hours: int | None = None
    total_class_hours: int | None = None
    days_since_last_login: int | None = None
    logins_last_30_days: int | None = None
    ai_interactions_last_30_days: int | None = None
    homework_completion_rate: Decimal | None = None
    satisfaction_score: Decimal | None = None
    absence_hours: Decimal | None = None
    absence_rate: Decimal | None = None
    consecutive_absences: int | None = None


class StudentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    academy_id: UUID
    name: str
    email: str | None
    parent_email: str | None
    notify_target: NotifyTarget
    enrollment_date: date | None
    status: StudentStatus
    course_type: str | None
    course_duration_weeks: int | None
    enrolled_weeks: int | None
    weekly_class_hours: int | None
    total_class_hours: int | None
    days_since_last_login: int | None
    logins_last_30_days: int | None
    ai_interactions_last_30_days: int | None
    homework_completion_rate: Decimal | None
    satisfaction_score: Decimal | None
    absence_hours: Decimal | None
    absence_rate: Decimal | None
    consecutive_absences: int | None
    created_at: datetime
    updated_at: datetime

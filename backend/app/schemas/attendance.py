from datetime import date as Date
from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AttendanceStatus(str, Enum):
    present = "present"
    absent = "absent"
    late = "late"


class AttendanceCreate(BaseModel):
    student_id: UUID
    date: Date
    status: AttendanceStatus


class AttendanceUpdate(BaseModel):
    student_id: UUID | None = None
    date: Date | None = None
    status: AttendanceStatus | None = None


class AttendanceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    academy_id: UUID
    student_id: UUID
    date: Date
    status: AttendanceStatus
    created_at: datetime

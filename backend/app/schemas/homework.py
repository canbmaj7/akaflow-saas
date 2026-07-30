from datetime import date as Date
from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class HomeworkStatus(str, Enum):
    completed = "completed"
    not_completed = "not_completed"
    late = "late"


class HomeworkCreate(BaseModel):
    student_id: UUID
    title: str = Field(default="Ödev", min_length=1)
    due_date: Date
    status: HomeworkStatus


class HomeworkUpdate(BaseModel):
    student_id: UUID | None = None
    title: str | None = Field(default=None, min_length=1)
    due_date: Date | None = None
    status: HomeworkStatus | None = None


class HomeworkRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    academy_id: UUID
    student_id: UUID
    title: str
    due_date: Date
    status: HomeworkStatus
    created_at: datetime

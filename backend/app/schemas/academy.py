from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AcademyCreate(BaseModel):
    name: str = Field(min_length=1)
    admin_email: EmailStr
    student_limit: int = Field(default=50, ge=1)
    package_name: str = Field(default="starter", min_length=1)


class AcademyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    admin_email: str
    student_limit: int
    package_name: str
    trial_ends_at: datetime | None
    created_at: datetime

from uuid import UUID

from pydantic import BaseModel, Field


class PredictionResponse(BaseModel):
    student_id: UUID
    student_name: str | None = None
    churn_probability: float = Field(ge=0, le=1)
    risk_status: str
    risk_level: str
    reasons: list[str]
    features: dict[str, float | str | int]


class RiskyStudentResponse(BaseModel):
    student_id: UUID
    student_name: str | None = None
    churn_probability: float
    risk_status: str
    risk_level: str
    reasons: list[str]
    features: dict[str, float | str | int]

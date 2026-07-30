from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.api.deps import get_supabase_client
from app.ml.prediction_engine import (
    predict_academy_all_churn,
    predict_academy_churn,
    predict_student_churn,
)
from app.schemas.predict import PredictionResponse, RiskyStudentResponse

router = APIRouter(prefix="/predict", tags=["predict"])


@router.get("/all", response_model=list[PredictionResponse])
def list_all_predictions(
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> list[PredictionResponse]:
    predictions = predict_academy_all_churn(supabase)
    return [PredictionResponse.model_validate(item) for item in predictions]


@router.get("/risky", response_model=list[RiskyStudentResponse])
def list_risky_students(
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> list[RiskyStudentResponse]:
    predictions = predict_academy_churn(supabase)
    return [RiskyStudentResponse.model_validate(item) for item in predictions]


@router.get("/{student_id}", response_model=PredictionResponse)
def predict_student(
    student_id: UUID,
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> PredictionResponse:
    try:
        result = predict_student_churn(supabase, student_id)
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    return PredictionResponse.model_validate(result)

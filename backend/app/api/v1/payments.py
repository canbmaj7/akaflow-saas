from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status
from supabase import Client

from app.api.deps import get_academy_id, get_supabase_client
from app.schemas.payment import PaymentCreate, PaymentRead, PaymentUpdate
from app.services.crud import delete_row, get_row_by_id, insert_row, list_rows, update_row
from app.services.ml_features import recalculate_student_features

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("", response_model=list[PaymentRead])
def list_payments(
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> list[PaymentRead]:
    rows = list_rows(supabase, "payments")
    return [PaymentRead.model_validate(row) for row in rows]


@router.post("", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(
    body: PaymentCreate,
    supabase: Annotated[Client, Depends(get_supabase_client)],
    academy_id: Annotated[UUID, Depends(get_academy_id)],
) -> PaymentRead:
    payload = body.model_dump(mode="json", exclude_none=True)
    row = insert_row(supabase, "payments", payload, academy_id)
    recalculate_student_features(supabase, UUID(row["student_id"]))
    return PaymentRead.model_validate(row)


@router.get("/{payment_id}", response_model=PaymentRead)
def get_payment(
    payment_id: UUID,
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> PaymentRead:
    row = get_row_by_id(supabase, "payments", payment_id)
    return PaymentRead.model_validate(row)


@router.patch("/{payment_id}", response_model=PaymentRead)
def update_payment(
    payment_id: UUID,
    body: PaymentUpdate,
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> PaymentRead:
    existing = get_row_by_id(supabase, "payments", payment_id)
    payload = body.model_dump(mode="json", exclude_none=True)
    row = update_row(supabase, "payments", payment_id, payload)
    student_id = UUID(row.get("student_id") or existing["student_id"])
    recalculate_student_features(supabase, student_id)
    return PaymentRead.model_validate(row)


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(
    payment_id: UUID,
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> None:
    delete_row(supabase, "payments", payment_id)

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status
from supabase import Client

from app.api.deps import get_academy_id, get_supabase_client
from app.schemas.homework import HomeworkCreate, HomeworkRead, HomeworkUpdate
from app.services.crud import (
    delete_row,
    get_row_by_id,
    list_rows,
    update_row,
    upsert_homework_row,
)
from app.services.ml_features import recalculate_student_features

router = APIRouter(prefix="/homework", tags=["homework"])


@router.get("", response_model=list[HomeworkRead])
def list_homework(
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> list[HomeworkRead]:
    rows = list_rows(supabase, "homework")
    return [HomeworkRead.model_validate(row) for row in rows]


@router.post("", response_model=HomeworkRead, status_code=status.HTTP_201_CREATED)
def create_homework(
    body: HomeworkCreate,
    supabase: Annotated[Client, Depends(get_supabase_client)],
    academy_id: Annotated[UUID, Depends(get_academy_id)],
) -> HomeworkRead:
    payload = body.model_dump(mode="json", exclude_none=True)
    row = upsert_homework_row(supabase, payload, academy_id)
    recalculate_student_features(supabase, UUID(row["student_id"]))
    return HomeworkRead.model_validate(row)


@router.get("/{homework_id}", response_model=HomeworkRead)
def get_homework(
    homework_id: UUID,
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> HomeworkRead:
    row = get_row_by_id(supabase, "homework", homework_id)
    return HomeworkRead.model_validate(row)


@router.patch("/{homework_id}", response_model=HomeworkRead)
def update_homework(
    homework_id: UUID,
    body: HomeworkUpdate,
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> HomeworkRead:
    existing = get_row_by_id(supabase, "homework", homework_id)
    payload = body.model_dump(mode="json", exclude_none=True)
    row = update_row(supabase, "homework", homework_id, payload)
    student_id = UUID(row.get("student_id") or existing["student_id"])
    recalculate_student_features(supabase, student_id)
    return HomeworkRead.model_validate(row)


@router.delete("/{homework_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_homework(
    homework_id: UUID,
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> None:
    existing = get_row_by_id(supabase, "homework", homework_id)
    delete_row(supabase, "homework", homework_id)
    recalculate_student_features(supabase, UUID(existing["student_id"]))

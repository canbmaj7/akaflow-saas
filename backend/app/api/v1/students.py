from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.api.deps import get_academy_id, get_supabase_client
from app.schemas.student import StudentCreate, StudentRead, StudentUpdate
from app.services.crud import (
    count_students,
    delete_row,
    get_academy,
    get_row_by_id,
    insert_row,
    list_rows,
    update_row,
)

router = APIRouter(prefix="/students", tags=["students"])


@router.get("", response_model=list[StudentRead])
def list_students(
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> list[StudentRead]:
    rows = list_rows(supabase, "students")
    return [StudentRead.model_validate(row) for row in rows]


@router.post("", response_model=StudentRead, status_code=status.HTTP_201_CREATED)
def create_student(
    body: StudentCreate,
    supabase: Annotated[Client, Depends(get_supabase_client)],
    academy_id: Annotated[UUID, Depends(get_academy_id)],
) -> StudentRead:
    academy = get_academy(supabase, academy_id)
    current_count = count_students(supabase, academy_id)
    if current_count >= academy["student_limit"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Öğrenci limiti doldu. Paketinizi yükseltin.",
        )

    payload = body.model_dump(mode="json", exclude_none=True)
    row = insert_row(supabase, "students", payload, academy_id)
    return StudentRead.model_validate(row)


@router.get("/{student_id}", response_model=StudentRead)
def get_student(
    student_id: UUID,
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> StudentRead:
    row = get_row_by_id(supabase, "students", student_id)
    return StudentRead.model_validate(row)


@router.patch("/{student_id}", response_model=StudentRead)
def update_student(
    student_id: UUID,
    body: StudentUpdate,
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> StudentRead:
    payload = body.model_dump(mode="json", exclude_none=True)
    row = update_row(supabase, "students", student_id, payload)
    return StudentRead.model_validate(row)


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: UUID,
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> None:
    delete_row(supabase, "students", student_id)

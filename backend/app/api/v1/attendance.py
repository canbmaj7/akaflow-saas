from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status
from supabase import Client

from app.api.deps import get_academy_id, get_supabase_client
from app.schemas.attendance import AttendanceCreate, AttendanceRead, AttendanceUpdate
from app.services.crud import (
    delete_row,
    get_row_by_id,
    list_rows,
    update_row,
    upsert_attendance_row,
)

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.get("", response_model=list[AttendanceRead])
def list_attendance(
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> list[AttendanceRead]:
    rows = list_rows(supabase, "attendance")
    return [AttendanceRead.model_validate(row) for row in rows]


@router.post("", response_model=AttendanceRead, status_code=status.HTTP_201_CREATED)
def create_attendance(
    body: AttendanceCreate,
    supabase: Annotated[Client, Depends(get_supabase_client)],
    academy_id: Annotated[UUID, Depends(get_academy_id)],
) -> AttendanceRead:
    payload = body.model_dump(mode="json", exclude_none=True)
    row = upsert_attendance_row(supabase, payload, academy_id)
    return AttendanceRead.model_validate(row)


@router.get("/{attendance_id}", response_model=AttendanceRead)
def get_attendance(
    attendance_id: UUID,
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> AttendanceRead:
    row = get_row_by_id(supabase, "attendance", attendance_id)
    return AttendanceRead.model_validate(row)


@router.patch("/{attendance_id}", response_model=AttendanceRead)
def update_attendance(
    attendance_id: UUID,
    body: AttendanceUpdate,
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> AttendanceRead:
    payload = body.model_dump(mode="json", exclude_none=True)
    row = update_row(supabase, "attendance", attendance_id, payload)
    return AttendanceRead.model_validate(row)


@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(
    attendance_id: UUID,
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> None:
    delete_row(supabase, "attendance", attendance_id)

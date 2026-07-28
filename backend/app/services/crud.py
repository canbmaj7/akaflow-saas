from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from fastapi import HTTPException, status
from postgrest.exceptions import APIError
from supabase import Client


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


def list_rows(supabase: Client, table: str) -> list[dict[str, Any]]:
    response = supabase.table(table).select("*").order("created_at").execute()
    return response.data or []


def get_row_by_id(supabase: Client, table: str, row_id: UUID) -> dict[str, Any]:
    response = supabase.table(table).select("*").eq("id", str(row_id)).limit(1).execute()
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kayıt bulunamadı")
    return response.data[0]


def insert_row(
    supabase: Client,
    table: str,
    payload: dict[str, Any],
    academy_id: UUID,
) -> dict[str, Any]:
    data = {**payload, "academy_id": str(academy_id)}
    try:
        response = supabase.table(table).insert(data).execute()
    except APIError as exc:
        if exc.code == "23505":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Bu kayıt zaten mevcut",
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=exc.message or "Kayıt oluşturulamadı",
        ) from exc
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kayıt oluşturulamadı",
        )
    return response.data[0]


def upsert_attendance_row(
    supabase: Client,
    payload: dict[str, Any],
    academy_id: UUID,
) -> dict[str, Any]:
    """Aynı öğrenci + tarih varsa durumu günceller."""
    data = {**payload, "academy_id": str(academy_id), "updated_at": _now_iso()}
    try:
        response = (
            supabase.table("attendance")
            .upsert(data, on_conflict="student_id,date")
            .execute()
        )
    except APIError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=exc.message or "Devamsızlık kaydedilemedi",
        ) from exc
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Devamsızlık kaydedilemedi",
        )
    return response.data[0]


def update_row(
    supabase: Client,
    table: str,
    row_id: UUID,
    payload: dict[str, Any],
) -> dict[str, Any]:
    data = {k: v for k, v in payload.items() if v is not None}
    if not data:
        return get_row_by_id(supabase, table, row_id)

    data["updated_at"] = _now_iso()
    response = (
        supabase.table(table)
        .update(data)
        .eq("id", str(row_id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kayıt bulunamadı")
    return response.data[0]


def delete_row(supabase: Client, table: str, row_id: UUID) -> None:
    get_row_by_id(supabase, table, row_id)
    supabase.table(table).delete().eq("id", str(row_id)).execute()


def count_students(supabase: Client, academy_id: UUID) -> int:
    response = (
        supabase.table("students")
        .select("id", count="exact")
        .eq("academy_id", str(academy_id))
        .execute()
    )
    return response.count or 0


def get_academy(supabase: Client, academy_id: UUID) -> dict[str, Any]:
    response = (
        supabase.table("academies")
        .select("*")
        .eq("id", str(academy_id))
        .limit(1)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Akademi bulunamadı")
    return response.data[0]

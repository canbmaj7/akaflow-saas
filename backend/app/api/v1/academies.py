from datetime import UTC, datetime, timedelta
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_academy_id, get_current_user_id, get_supabase_client
from app.core.supabase_client import create_service_supabase_client
from app.schemas.academy import AcademyCreate, AcademyRead
from supabase import Client

router = APIRouter(prefix="/academies", tags=["academies"])


@router.get("/me", response_model=AcademyRead)
def get_my_academy(
    supabase: Annotated[Client, Depends(get_supabase_client)],
    academy_id: Annotated[UUID, Depends(get_academy_id)],
) -> AcademyRead:
    result = (
        supabase.table("academies")
        .select("*")
        .eq("id", str(academy_id))
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Akademi bulunamadı")
    return AcademyRead.model_validate(result.data[0])


@router.post("", response_model=AcademyRead, status_code=status.HTTP_201_CREATED)
def create_academy(
    body: AcademyCreate,
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> AcademyRead:
    """Kayıt sonrası akademi oluşturur (service role)."""
    try:
        supabase = create_service_supabase_client()
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SUPABASE_SECRET_KEY backend/.env içinde tanımlı değil (Supabase → Secret keys → sb_secret_...)",
        ) from exc

    existing = (
        supabase.table("academy_users")
        .select("academy_id")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Kullanıcının zaten bir akademisi var",
        )

    trial_ends = datetime.now(UTC) + timedelta(days=14)
    academy_payload = {
        "name": body.name,
        "admin_email": str(body.admin_email),
        "student_limit": body.student_limit,
        "package_name": body.package_name,
        "trial_ends_at": trial_ends.isoformat(),
    }
    academy_result = supabase.table("academies").insert(academy_payload).execute()
    if not academy_result.data:
        raise HTTPException(status_code=400, detail="Akademi oluşturulamadı")

    academy = academy_result.data[0]
    link_result = (
        supabase.table("academy_users")
        .insert({"user_id": user_id, "academy_id": academy["id"], "role": "admin"})
        .execute()
    )
    if not link_result.data:
        raise HTTPException(status_code=400, detail="Akademi kullanıcı bağlantısı oluşturulamadı")

    return AcademyRead.model_validate(academy)

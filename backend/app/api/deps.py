from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

from app.core.security import decode_access_token
from app.core.supabase_client import create_supabase_client

bearer_scheme = HTTPBearer(auto_error=False)


def get_access_token(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kimlik doğrulama gerekli",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials


def get_token_payload(token: Annotated[str, Depends(get_access_token)]) -> dict:
    try:
        return decode_access_token(token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def get_current_user_id(payload: Annotated[dict, Depends(get_token_payload)]) -> str:
    return payload["sub"]


def get_supabase_client(
    token: Annotated[str, Depends(get_access_token)],
    _payload: Annotated[dict, Depends(get_token_payload)],
) -> Client:
    return create_supabase_client(token)


def get_academy_id(
    supabase: Annotated[Client, Depends(get_supabase_client)],
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> UUID:
    result = (
        supabase.table("academy_users")
        .select("academy_id")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Kullanıcıya bağlı akademi bulunamadı",
        )
    return UUID(result.data[0]["academy_id"])

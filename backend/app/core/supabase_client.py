from supabase import Client, ClientOptions, create_client

from app.core.config import settings


def create_supabase_client(access_token: str) -> Client:
    options = ClientOptions(
        headers={"Authorization": f"Bearer {access_token}"},
    )
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_PUBLISHABLE_KEY,
        options=options,
    )


def create_service_supabase_client() -> Client:
    if not settings.SUPABASE_SECRET_KEY:
        raise RuntimeError("SUPABASE_SECRET_KEY tanımlı değil")
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SECRET_KEY,
    )

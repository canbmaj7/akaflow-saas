import os
from datetime import UTC, datetime, timedelta

import httpx
import pytest
from fastapi.testclient import TestClient
import jwt

# app importlarından önce test ortam değişkenleri
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault(
    "SUPABASE_PUBLISHABLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.test",
)
os.environ.setdefault(
    "SUPABASE_JWT_SECRET",
    "super-secret-jwt-key-for-unit-testing-only-32chars",
)

from app.core.config import settings  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def valid_token() -> str:
    payload = {
        "sub": "00000000-0000-0000-0000-000000000001",
        "aud": "authenticated",
        "exp": datetime.now(UTC) + timedelta(hours=1),
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


@pytest.fixture
def expired_token() -> str:
    payload = {
        "sub": "00000000-0000-0000-0000-000000000001",
        "aud": "authenticated",
        "exp": datetime.now(UTC) - timedelta(hours=1),
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


def integration_configured() -> bool:
    return bool(
        settings.TEST_USER_A_EMAIL
        and settings.TEST_USER_A_PASSWORD
        and settings.TEST_USER_B_EMAIL
        and settings.TEST_USER_B_PASSWORD
        and settings.SUPABASE_URL != "https://test.supabase.co"
        and settings.SUPABASE_PUBLISHABLE_KEY
        != "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.test"
    )


def fetch_supabase_token(email: str, password: str) -> str:
    response = httpx.post(
        f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={"apikey": settings.SUPABASE_PUBLISHABLE_KEY},
        json={"email": email, "password": password},
        timeout=30.0,
    )
    response.raise_for_status()
    return response.json()["access_token"]


@pytest.fixture
def token_a() -> str:
    if not integration_configured():
        pytest.skip("Entegrasyon testleri için Supabase ve test kullanıcı env gerekli")
    return fetch_supabase_token(settings.TEST_USER_A_EMAIL, settings.TEST_USER_A_PASSWORD)


@pytest.fixture
def token_b() -> str:
    if not integration_configured():
        pytest.skip("Entegrasyon testleri için Supabase ve test kullanıcı env gerekli")
    return fetch_supabase_token(settings.TEST_USER_B_EMAIL, settings.TEST_USER_B_PASSWORD)

import pytest
from fastapi.testclient import TestClient

from app.core.security import decode_access_token


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_students_without_token_returns_401(client: TestClient) -> None:
    response = client.get("/api/v1/students")
    assert response.status_code == 401


def test_students_with_invalid_token_returns_401(client: TestClient) -> None:
    response = client.get(
        "/api/v1/students",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert response.status_code == 401


def test_students_with_expired_token_returns_401(
    client: TestClient,
    expired_token: str,
) -> None:
    response = client.get(
        "/api/v1/students",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert response.status_code == 401


def test_decode_valid_token(valid_token: str) -> None:
    payload = decode_access_token(valid_token)
    assert payload["sub"] == "00000000-0000-0000-0000-000000000001"
    assert payload["aud"] == "authenticated"


@pytest.mark.integration
def test_tenant_a_sees_only_own_students(client: TestClient, token_a: str) -> None:
    response = client.get(
        "/api/v1/students",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert response.status_code == 200
    students = response.json()
    assert isinstance(students, list)
    for student in students:
        assert "academy_id" in student


@pytest.mark.integration
def test_tenant_b_cannot_see_tenant_a_students(
    client: TestClient,
    token_a: str,
    token_b: str,
) -> None:
    response_a = client.get(
        "/api/v1/students",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    response_b = client.get(
        "/api/v1/students",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response_a.status_code == 200
    assert response_b.status_code == 200

    ids_a = {s["id"] for s in response_a.json()}
    ids_b = {s["id"] for s in response_b.json()}
    assert ids_a.isdisjoint(ids_b)


@pytest.mark.integration
def test_tenant_a_cannot_access_tenant_b_student_by_id(
    client: TestClient,
    token_a: str,
    token_b: str,
) -> None:
    response_b = client.get(
        "/api/v1/students",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response_b.status_code == 200
    students_b = response_b.json()
    if not students_b:
        pytest.skip("Tenant B'de öğrenci yok; seed uygulayın")

    foreign_id = students_b[0]["id"]
    response = client.get(
        f"/api/v1/students/{foreign_id}",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert response.status_code == 404

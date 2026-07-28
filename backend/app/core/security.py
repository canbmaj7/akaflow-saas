import jwt
from jwt import PyJWKClient

from app.core.config import settings

AUDIENCE = "authenticated"
JWKS_ALGORITHMS = ["ES256", "RS256"]
LEGACY_ALGORITHM = "HS256"

_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        base_url = settings.SUPABASE_URL.rstrip("/")
        jwks_url = f"{base_url}/auth/v1/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url, cache_keys=True)
    return _jwks_client


def decode_access_token(token: str) -> dict:
    """Supabase access JWT doğrulama (JWKS veya opsiyonel legacy HS256 secret)."""
    try:
        header = jwt.get_unverified_header(token)
        algorithm = header.get("alg", "")

        if algorithm == LEGACY_ALGORITHM and settings.SUPABASE_JWT_SECRET:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=[LEGACY_ALGORITHM],
                audience=AUDIENCE,
            )
        else:
            signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=JWKS_ALGORITHMS,
                audience=AUDIENCE,
            )
    except jwt.PyJWTError as exc:
        raise ValueError("Geçersiz veya süresi dolmuş token") from exc

    sub = payload.get("sub")
    if not sub:
        raise ValueError("Token içinde kullanıcı kimliği (sub) yok")

    return payload

import re

from langchain_community.utilities import SQLDatabase
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from sqlalchemy import create_engine, text

from app.ai_agent.prompts import CUSTOM_SQL_PREFIX
from app.core.config import settings

_db: SQLDatabase | None = None
_engine = None

_FORBIDDEN = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|GRANT|REVOKE)\b",
    re.IGNORECASE,
)


def _get_db() -> SQLDatabase:
    global _db
    if _db is None:
        _db = SQLDatabase.from_uri(
            settings.DATABASE_URL,
            include_tables=["students", "payments", "attendance"],
            sample_rows_in_table_info=2,
        )
    return _db


def _get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
    return _engine


def _get_llm() -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        google_api_key=settings.GOOGLE_API_KEY,
        temperature=0,
        timeout=90,
        max_retries=1,
    )


def _extract_sql(content: str) -> str:
    block = re.search(r"```(?:sql)?\s*(.*?)```", content, re.IGNORECASE | re.DOTALL)
    if block:
        return block.group(1).strip()
    lines = [line.strip() for line in content.splitlines() if line.strip()]
    for line in lines:
        if line.upper().startswith("SELECT"):
            return line.rstrip(";")
    raise ValueError("Model geçerli bir SELECT sorgusu üretmedi")


def _validate_sql(sql: str, academy_id: str) -> None:
    cleaned = sql.strip().rstrip(";")
    if not cleaned.upper().startswith("SELECT"):
        raise ValueError("Sadece SELECT sorgularına izin verilir")
    if _FORBIDDEN.search(cleaned):
        raise ValueError("Yalnızca okuma sorgularına izin verilir")
    if academy_id not in cleaned:
        raise ValueError("Sorguda academy_id filtresi bulunamadı")


def _run_sql(sql: str, limit: int = 100) -> str:
    cleaned = sql.strip().rstrip(";")
    if "limit" not in cleaned.lower():
        cleaned = f"{cleaned} LIMIT {limit}"

    with _get_engine().connect() as conn:
        result = conn.execute(text(cleaned))
        rows = result.fetchall()
        columns = list(result.keys())

    if not rows:
        return "Sonuç yok (0 satır)."

    header = " | ".join(columns)
    body = "\n".join(" | ".join(str(value) for value in row) for row in rows)
    return f"{header}\n{body}"


def ask_agent(question: str, academy_id: str) -> str:
    if not settings.GOOGLE_API_KEY:
        return "AI agent yapılandırılmamış. GOOGLE_API_KEY tanımlayın."
    if not settings.DATABASE_URL:
        return "AI agent yapılandırılmamış. DATABASE_URL tanımlayın."

    try:
        db = _get_db()
        llm = _get_llm()
        context = CUSTOM_SQL_PREFIX.format(academy_id=academy_id)
        schema = db.get_table_info()

        sql_response = llm.invoke(
            [
                HumanMessage(
                    content=(
                        f"{context}\n\n"
                        f"Tablo şeması:\n{schema}\n\n"
                        f"Kullanıcı sorusu: {question}\n\n"
                        "Yalnızca tek bir PostgreSQL SELECT sorgusu yaz.\n"
                        f"Her tabloda academy_id = '{academy_id}' filtresi kullan.\n"
                        "Yanıtın sadece ```sql ... ``` bloğu olsun."
                    )
                )
            ]
        )
        sql = _extract_sql(str(sql_response.content))
        _validate_sql(sql, academy_id)
        query_result = _run_sql(sql)

        answer_response = llm.invoke(
            [
                HumanMessage(
                    content=(
                        f"{context}\n\n"
                        f"Kullanıcı sorusu: {question}\n\n"
                        f"Çalıştırılan SQL:\n{sql}\n\n"
                        f"Sorgu sonucu:\n{query_result}\n\n"
                        "Sonucu Türkçe, kısa ve profesyonel bir paragrafla yanıtla."
                    )
                )
            ]
        )
        return str(answer_response.content).strip()
    except Exception as exc:  # noqa: BLE001
        return f"Sorgu çalıştırılırken bir hata oluştu: {exc}"

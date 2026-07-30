import logging
from typing import Any
from uuid import UUID

from supabase import Client

from app.ml.feature_mapper import select_payment_for_ml, supabase_to_model_features
from app.ml.model_loader import load_model, load_threshold
from app.ml.risk_explainer import generate_risk_reasons, get_risk_level
from app.services.crud import get_row_by_id
from app.services.ml_features import recalculate_student_features

logger = logging.getLogger(__name__)


def _serialize_features(features_row: dict[str, Any]) -> dict[str, float | str | int]:
    serialized: dict[str, float | str | int] = {}
    for key, value in features_row.items():
        if isinstance(value, float):
            serialized[key] = round(value, 4) if key.endswith("_orani") else round(value, 2)
        elif isinstance(value, (int, str)):
            serialized[key] = value
        else:
            serialized[key] = float(value) if value is not None else 0
    return serialized


def predict_student_churn(supabase: Client, student_id: UUID) -> dict[str, Any]:
    recalculate_student_features(supabase, student_id)

    student = get_row_by_id(supabase, "students", student_id)
    payments_response = (
        supabase.table("payments")
        .select("*")
        .eq("student_id", str(student_id))
        .execute()
    )
    payment = select_payment_for_ml(payments_response.data or [])
    features_df = supabase_to_model_features(student, payment)
    features_row = features_df.iloc[0].to_dict()

    model = load_model()
    probability = float(model.predict_proba(features_df)[0][1])
    threshold = load_threshold()
    risk_status = "Riskli" if probability >= threshold else "Güvenli"
    risk_level = get_risk_level(probability, threshold)

    logger.info(
        "Churn tahmini: student_id=%s durum=%s olasilik=%.2f",
        student_id,
        risk_status,
        probability,
    )

    return {
        "student_id": str(student_id),
        "student_name": student.get("name"),
        "churn_probability": round(probability, 2),
        "risk_status": risk_status,
        "risk_level": risk_level,
        "reasons": generate_risk_reasons(features_row),
        "features": _serialize_features(features_row),
    }


def predict_academy_all_churn(supabase: Client) -> list[dict[str, Any]]:
    students_response = supabase.table("students").select("id").eq("status", "active").execute()
    results: list[dict[str, Any]] = []
    for row in students_response.data or []:
        try:
            results.append(predict_student_churn(supabase, UUID(row["id"])))
        except Exception as exc:  # noqa: BLE001 — tek öğrenci hatası tüm listeyi düşürmemeli
            logger.warning("Tahmin atlandı student_id=%s: %s", row["id"], exc)
    results.sort(key=lambda item: item["churn_probability"], reverse=True)
    return results


def predict_academy_churn(supabase: Client) -> list[dict[str, Any]]:
    return [
        item
        for item in predict_academy_all_churn(supabase)
        if item["risk_status"] == "Riskli"
    ]

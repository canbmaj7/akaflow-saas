from typing import Any

import pandas as pd

MODEL_FEATURE_COLUMNS = [
    "kurs_turu",
    "kurs_suresi_hafta",
    "kayitli_oldugu_hafta_sayisi",
    "haftalik_ders_saati",
    "toplam_ders_saati",
    "devamsizlik_saati",
    "devamsizlik_orani",
    "ust_uste_devamsizlik_sayisi",
    "toplam_ucret",
    "odenen_tutar",
    "kalan_borc",
    "taksit_sayisi",
    "son_odeme_gecikme_gun_sayisi",
    "odeme_yontemi",
    "son_giristen_beri_gun_sayisi",
    "son_30_gun_giris_sayisi",
    "son_30_gun_ai_etkilesim_sayisi",
    "tamamlanan_odev_orani",
    "memnuniyet_skoru",
]

DEFAULTS: dict[str, Any] = {
    "kurs_turu": "Web Geliştirme",
    "kurs_suresi_hafta": 24,
    "kayitli_oldugu_hafta_sayisi": 12,
    "haftalik_ders_saati": 6,
    "toplam_ders_saati": 72,
    "devamsizlik_saati": 0.0,
    "devamsizlik_orani": 0.0,
    "ust_uste_devamsizlik_sayisi": 0,
    "toplam_ucret": 0.0,
    "odenen_tutar": 0.0,
    "kalan_borc": 0.0,
    "taksit_sayisi": 1,
    "son_odeme_gecikme_gun_sayisi": 0,
    "odeme_yontemi": "Havale",
    "son_giristen_beri_gun_sayisi": 0,
    "son_30_gun_giris_sayisi": 0,
    "son_30_gun_ai_etkilesim_sayisi": 0,
    "tamamlanan_odev_orani": 1.0,
    "memnuniyet_skoru": 3.5,
}


def _to_float(value: Any, fallback: float) -> float:
    if value is None:
        return fallback
    return float(value)


def _to_int(value: Any, fallback: int) -> int:
    if value is None:
        return fallback
    return int(value)


def select_payment_for_ml(payments: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not payments:
        return None

    status_priority = {"overdue": 0, "pending": 1, "paid": 2}

    def sort_key(payment: dict[str, Any]) -> tuple[int, int]:
        return (
            status_priority.get(payment.get("status"), 3),
            -(payment.get("last_delay_days") or 0),
        )

    return sorted(payments, key=sort_key)[0]


def supabase_to_model_features(
    student: dict[str, Any],
    payment: dict[str, Any] | None,
) -> pd.DataFrame:
    payment = payment or {}
    amount = _to_float(payment.get("amount"), 0.0)

    row = {
        "kurs_turu": student.get("course_type") or DEFAULTS["kurs_turu"],
        "kurs_suresi_hafta": _to_int(student.get("course_duration_weeks"), DEFAULTS["kurs_suresi_hafta"]),
        "kayitli_oldugu_hafta_sayisi": _to_int(student.get("enrolled_weeks"), DEFAULTS["kayitli_oldugu_hafta_sayisi"]),
        "haftalik_ders_saati": _to_int(student.get("weekly_class_hours"), DEFAULTS["haftalik_ders_saati"]),
        "toplam_ders_saati": _to_int(student.get("total_class_hours"), DEFAULTS["toplam_ders_saati"]),
        "devamsizlik_saati": _to_float(student.get("absence_hours"), DEFAULTS["devamsizlik_saati"]),
        "devamsizlik_orani": _to_float(student.get("absence_rate"), DEFAULTS["devamsizlik_orani"]),
        "ust_uste_devamsizlik_sayisi": _to_int(
            student.get("consecutive_absences"),
            DEFAULTS["ust_uste_devamsizlik_sayisi"],
        ),
        "toplam_ucret": _to_float(payment.get("total_fee"), amount or DEFAULTS["toplam_ucret"]),
        "odenen_tutar": _to_float(payment.get("amount_paid"), DEFAULTS["odenen_tutar"]),
        "kalan_borc": _to_float(payment.get("remaining_debt"), DEFAULTS["kalan_borc"]),
        "taksit_sayisi": _to_int(payment.get("installment_count"), DEFAULTS["taksit_sayisi"]),
        "son_odeme_gecikme_gun_sayisi": _to_int(
            payment.get("last_delay_days"),
            DEFAULTS["son_odeme_gecikme_gun_sayisi"],
        ),
        "odeme_yontemi": payment.get("payment_method") or DEFAULTS["odeme_yontemi"],
        "son_giristen_beri_gun_sayisi": _to_int(
            student.get("days_since_last_login"),
            DEFAULTS["son_giristen_beri_gun_sayisi"],
        ),
        "son_30_gun_giris_sayisi": _to_int(
            student.get("logins_last_30_days"),
            DEFAULTS["son_30_gun_giris_sayisi"],
        ),
        "son_30_gun_ai_etkilesim_sayisi": _to_int(
            student.get("ai_interactions_last_30_days"),
            DEFAULTS["son_30_gun_ai_etkilesim_sayisi"],
        ),
        "tamamlanan_odev_orani": _to_float(
            student.get("homework_completion_rate"),
            DEFAULTS["tamamlanan_odev_orani"],
        ),
        "memnuniyet_skoru": _to_float(student.get("satisfaction_score"), DEFAULTS["memnuniyet_skoru"]),
    }
    return pd.DataFrame([row], columns=MODEL_FEATURE_COLUMNS)

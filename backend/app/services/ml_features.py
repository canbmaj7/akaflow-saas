from datetime import UTC, date, datetime
from typing import Any
from uuid import UUID

from supabase import Client

from app.ml.course_constants import course_defaults
from app.ml.feature_mapper import select_payment_for_ml
from app.services.age_utils import age_from_birth_date
from app.services.crud import get_row_by_id, update_row


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00")).date()


def _weeks_since_enrollment(enrollment_date: date | None) -> int | None:
    if enrollment_date is None:
        return None
    today = datetime.now(UTC).date()
    delta_days = (today - enrollment_date).days
    return max(1, delta_days // 7)


def _max_consecutive_absences(records: list[dict[str, Any]]) -> int:
    if not records:
        return 0

    sorted_records = sorted(records, key=lambda row: row.get("date", ""))
    max_streak = 0
    current = 0

    for record in sorted_records:
        if record.get("status") in ("absent", "late"):
            current += 1
            max_streak = max(max_streak, current)
        else:
            current = 0

    return max_streak


def _attendance_metrics(records: list[dict[str, Any]], total_class_hours: int) -> dict[str, Any]:
    if not records:
        return {
            "absence_hours": 0.0,
            "absence_rate": 0.0,
            "consecutive_absences": 0,
        }

    absent_count = sum(1 for row in records if row.get("status") in ("absent", "late"))
    absence_rate = absent_count / len(records)
    absence_hours = round(absence_rate * total_class_hours) if total_class_hours > 0 else 0

    if total_class_hours > 0:
        absence_rate = round(absence_hours / total_class_hours, 4)
    else:
        absence_rate = 0.0

    consecutive = _max_consecutive_absences(records)
    if absence_hours == 0:
        consecutive = 0

    return {
        "absence_hours": float(absence_hours),
        "absence_rate": absence_rate,
        "consecutive_absences": consecutive,
    }


def _payment_updates(payment: dict[str, Any] | None) -> dict[str, Any]:
    if not payment:
        return {}

    updates: dict[str, Any] = {}
    total_fee = payment.get("total_fee")
    amount_paid = payment.get("amount_paid")
    amount = payment.get("amount")

    if total_fee is None and amount is not None:
        total_fee = amount
        updates["total_fee"] = total_fee

    if total_fee is not None and amount_paid is not None:
        remaining = float(total_fee) - float(amount_paid)
        if payment.get("remaining_debt") != remaining:
            updates["remaining_debt"] = remaining

    if payment.get("status") == "overdue":
        due = _parse_date(payment.get("due_date"))
        if due:
            today = datetime.now(UTC).date()
            delay = max(0, (today - due).days)
            if payment.get("last_delay_days") != delay:
                updates["last_delay_days"] = delay

    return updates


def _homework_completion_rate(records: list[dict[str, Any]]) -> float | None:
    if not records:
        return None

    score = 0.0
    for record in records:
        status = record.get("status")
        if status == "completed":
            score += 1.0
        elif status == "late":
            score += 0.5

    return round(score / len(records), 4)


def apply_course_defaults(payload: dict[str, Any]) -> dict[str, Any]:
    if "course_type" not in payload:
        return payload

    course, duration, weekly_hours = course_defaults(payload.get("course_type"))
    result = dict(payload)
    result["course_type"] = course
    result["course_duration_weeks"] = duration
    result["weekly_class_hours"] = weekly_hours
    return result


def recalculate_student_features(supabase: Client, student_id: UUID) -> dict[str, Any]:
    student = get_row_by_id(supabase, "students", student_id)

    course_type = student.get("course_type")
    if course_type:
        course, duration, weekly_hours = course_defaults(course_type)
    else:
        _, duration, weekly_hours = course_defaults(None)

    enrollment_date = _parse_date(student.get("enrollment_date"))
    computed_weeks = _weeks_since_enrollment(enrollment_date)

    enrolled_weeks = student.get("enrolled_weeks")
    if computed_weeks is not None:
        enrolled_weeks = min(duration, computed_weeks)
    elif enrolled_weeks is None:
        enrolled_weeks = min(duration, 12)

    total_class_hours = enrolled_weeks * weekly_hours

    attendance_response = (
        supabase.table("attendance")
        .select("*")
        .eq("student_id", str(student_id))
        .execute()
    )
    attendance_metrics = _attendance_metrics(attendance_response.data or [], total_class_hours)

    homework_response = (
        supabase.table("homework")
        .select("*")
        .eq("student_id", str(student_id))
        .execute()
    )
    homework_rate = _homework_completion_rate(homework_response.data or [])

    student_updates: dict[str, Any] = {
        "enrolled_weeks": enrolled_weeks,
        "total_class_hours": total_class_hours,
        **attendance_metrics,
    }
    if homework_rate is not None:
        student_updates["homework_completion_rate"] = homework_rate
    birth_date = student.get("birth_date")
    if birth_date:
        student_updates["age"] = age_from_birth_date(birth_date)
    if course_type:
        student_updates["course_type"] = course
        student_updates["course_duration_weeks"] = duration
        student_updates["weekly_class_hours"] = weekly_hours

    updated_student = update_row(supabase, "students", student_id, student_updates)

    payments_response = (
        supabase.table("payments")
        .select("*")
        .eq("student_id", str(student_id))
        .execute()
    )
    payment = select_payment_for_ml(payments_response.data or [])
    if payment and payment.get("id"):
        payment_patch = _payment_updates(payment)
        if payment_patch:
            update_row(supabase, "payments", UUID(payment["id"]), payment_patch)

    return updated_student

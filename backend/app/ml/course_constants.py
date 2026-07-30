from typing import Any

COURSE_DURATION_WEEKS: dict[str, int] = {
    "Yapay Zeka": 24,
    "Veri Bilimi": 24,
    "Web Geliştirme": 24,
    "Siber Güvenlik": 24,
    "İngilizce": 16,
}

WEEKLY_CLASS_HOURS: dict[str, int] = {
    "Yapay Zeka": 8,
    "Veri Bilimi": 8,
    "Web Geliştirme": 6,
    "Siber Güvenlik": 8,
    "İngilizce": 4,
}

DEFAULT_COURSE_TYPE = "Web Geliştirme"


def course_defaults(course_type: str | None) -> tuple[str, int, int]:
    course = course_type or DEFAULT_COURSE_TYPE
    duration = COURSE_DURATION_WEEKS.get(course, COURSE_DURATION_WEEKS[DEFAULT_COURSE_TYPE])
    weekly_hours = WEEKLY_CLASS_HOURS.get(course, WEEKLY_CLASS_HOURS[DEFAULT_COURSE_TYPE])
    return course, duration, weekly_hours

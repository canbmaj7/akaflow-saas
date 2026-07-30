from datetime import date


def calculate_age(birth_date: date, today: date | None = None) -> int:
    today = today or date.today()
    age = today.year - birth_date.year
    if (today.month, today.day) < (birth_date.month, birth_date.day):
        age -= 1
    return max(0, age)


def age_from_birth_date(value: date | str | None) -> int | None:
    if value is None:
        return None
    if isinstance(value, str):
        birth_date = date.fromisoformat(value[:10])
    else:
        birth_date = value
    return calculate_age(birth_date)

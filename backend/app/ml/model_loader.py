import json
from functools import lru_cache
from pathlib import Path

import joblib

from app.core.config import settings

DEFAULT_THRESHOLD = 0.40


@lru_cache(maxsize=1)
def load_model():
    path = Path(settings.MODEL_PATH)
    if not path.exists():
        raise FileNotFoundError(f"Model dosyası bulunamadı: {path}")
    return joblib.load(path)


@lru_cache(maxsize=1)
def load_threshold() -> float:
    path = Path(settings.THRESHOLD_PATH)
    if not path.exists():
        return DEFAULT_THRESHOLD
    with path.open(encoding="utf-8") as handle:
        payload = json.load(handle)
    return float(payload.get("selected_threshold", DEFAULT_THRESHOLD))

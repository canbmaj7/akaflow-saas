FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY models ./models
COPY data ./data

ENV MODEL_PATH=/app/models/final_logistic_model_v2.pkl
ENV THRESHOLD_PATH=/app/data/final_logistic_threshold_v2.json

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

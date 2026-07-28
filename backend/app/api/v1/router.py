from fastapi import APIRouter

from app.api.v1 import academies, attendance, payments, students

api_router = APIRouter()
api_router.include_router(academies.router)
api_router.include_router(students.router)
api_router.include_router(payments.router)
api_router.include_router(attendance.router)

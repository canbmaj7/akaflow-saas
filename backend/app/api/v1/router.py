from fastapi import APIRouter

from app.api.v1 import academies, agent, attendance, homework, payments, predict, reminders, students

api_router = APIRouter()
api_router.include_router(academies.router)
api_router.include_router(students.router)
api_router.include_router(payments.router)
api_router.include_router(attendance.router)
api_router.include_router(homework.router)
api_router.include_router(predict.router)
api_router.include_router(agent.router)
api_router.include_router(reminders.router)

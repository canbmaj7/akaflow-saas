import asyncio
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.ai_agent.agent_service import ask_agent
from app.api.deps import get_academy_id
from app.schemas.agent import AgentQuery, AgentResponse

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/ask", response_model=AgentResponse)
async def agent_ask(
    body: AgentQuery,
    academy_id: Annotated[UUID, Depends(get_academy_id)],
) -> AgentResponse:
    answer = await asyncio.to_thread(ask_agent, body.question, str(academy_id))
    if answer.startswith("AI agent yapılandırılmamış"):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=answer)
    return AgentResponse(answer=answer)

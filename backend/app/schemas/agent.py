from pydantic import BaseModel, Field


class AgentQuery(BaseModel):
    question: str = Field(min_length=3, max_length=2000)


class AgentResponse(BaseModel):
    answer: str

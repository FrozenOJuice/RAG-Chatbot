from fastapi import APIRouter

from app.schemas.chat_schema import ChatInput, ChatResponse
from app.services.rag_service import answer_question


router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/ask", response_model=ChatResponse)
def ask_question(payload: ChatInput) -> ChatResponse:
    answer = answer_question(payload.question)
    return ChatResponse(answer=answer)

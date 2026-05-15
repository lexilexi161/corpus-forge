from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from services.retrieval import retrieve_context
from services.generation import generate_answer
from services.cost_tracker import track_usage

router = APIRouter()

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    doc_ids: List[str]  # active documents for context
    audience_level: Optional[str] = "intermediate"
    tone: Optional[str] = "neutral"
    creativity: Optional[float] = 0.7

@router.post("/")
async def chat(request: ChatRequest):
    """Chat with selected corpus documents."""
    query = request.messages[-1].content
    context = retrieve_context(query, request.doc_ids)
    
    response, usage = await generate_answer(
        messages=request.messages,
        context=context,
        audience_level=request.audience_level,
        tone=request.tone,
        creativity=request.creativity,
    )
    track_usage(usage)
    return {"response": response, "usage": usage}

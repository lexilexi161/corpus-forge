from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from services.retrieval import retrieve_context
from services.generation import generate_flashcards, generate_quiz, generate_code_review
from services.cost_tracker import track_usage

router = APIRouter()

class GenerationRequest(BaseModel):
    doc_ids: List[str]
    audience_level: Optional[str] = "intermediate"
    output_format: Optional[str] = "markdown"
    tone: Optional[str] = "neutral"
    creativity: Optional[float] = 0.5
    task_instructions: Optional[str] = None

@router.post("/flashcards")
async def create_flashcards(request: GenerationRequest):
    context = retrieve_context("key concepts", request.doc_ids, top_k=10)
    result, usage = await generate_flashcards(context, request)
    track_usage(usage)
    return {"flashcards": result, "usage": usage}

@router.post("/quiz")
async def create_quiz(request: GenerationRequest):
    context = retrieve_context("important topics", request.doc_ids, top_k=10)
    result, usage = await generate_quiz(context, request)
    track_usage(usage)
    return {"quiz": result, "usage": usage}

@router.post("/code-review")
async def create_code_review(request: GenerationRequest):
    context = retrieve_context("code", request.doc_ids, top_k=15)
    result, usage = await generate_code_review(context, request)
    track_usage(usage)
    return {"report": result, "usage": usage}

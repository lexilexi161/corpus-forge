"""Gemini helpers for grounded answer generation.

This module stays separate from the Flask route so the chat endpoint can
focus on loading chunks and passing them here.
"""

from __future__ import annotations

import os

DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
MAX_CONTEXT_CHARS = 6000
NO_CONTEXT_MESSAGE = (
    "The uploaded documents do not contain enough information to answer this question."
)
QUOTA_ERROR_MESSAGE = "Gemini quota has been exceeded for this API key or project."
GENERIC_API_ERROR_MESSAGE = "Gemini is temporarily unavailable."


def _get_api_key():
    """Read the API key from the environment without hardcoding it."""
    return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")


def _truncate_context(context_text):
    """Keep the retrieved context small enough to avoid wasting quota."""
    if len(context_text) <= MAX_CONTEXT_CHARS:
        return context_text

    truncated_context = context_text[:MAX_CONTEXT_CHARS].rstrip()
    return f"{truncated_context}\n\n[Context truncated to keep the prompt small.]"


def _format_retrieved_chunks(retrieved_chunks):
    """Turn retrieved chunks into a readable context block."""
    if not retrieved_chunks:
        return "No retrieved context was found."

    lines = []
    for index, chunk in enumerate(retrieved_chunks, start=1):
        if isinstance(chunk, dict):
            chunk_text = chunk.get("text", "")
            chunk_index = chunk.get("chunk_index", index - 1)
            file_id = chunk.get("file_id", "unknown")
        else:
            chunk_text = str(chunk)
            chunk_index = index - 1
            file_id = "unknown"

        lines.append(
            f"Chunk {index} (file_id={file_id}, chunk_index={chunk_index}):\n{chunk_text}"
        )

    return _truncate_context("\n\n".join(lines))


def _build_prompt(question, retrieved_chunks, audience_level, tone, output_format):
    """Build a grounded prompt for Gemini."""
    context_block = _format_retrieved_chunks(retrieved_chunks)

    return (
        "You are answering a question using only the provided uploaded document context when possible.\n\n"
        f"Audience level: {audience_level}\n"
        f"Tone: {tone}\n"
        f"Output format: {output_format}\n\n"
        "Rules:\n"
        "- Use only the retrieved context when it is enough.\n"
        "- If the context does not contain enough information, say that the uploaded documents do not contain enough information.\n"
        "- Do not invent facts that are not in the retrieved context.\n"
        "- Keep the answer simple and grounded.\n\n"
        f"User question: {question}\n\n"
        f"Retrieved context:\n{context_block}"
    )


def _build_flashcard_prompt(topic, retrieved_chunks, count, audience_level, tone):
    """Build a grounded prompt for flashcard generation."""
    context_block = _format_retrieved_chunks(retrieved_chunks)

    return (
        "Create flashcards from the uploaded document context only when possible.\n\n"
        f"Topic: {topic}\n"
        f"Audience level: {audience_level}\n"
        f"Tone: {tone}\n"
        f"Number of flashcards: {count}\n\n"
        "Rules:\n"
        "- Use only the retrieved context when it is enough.\n"
        f"- If the context does not contain enough information, say: {NO_CONTEXT_MESSAGE}\n"
        "- Do not invent facts that are not in the retrieved context.\n"
        "- Return valid JSON only.\n"
        '- Use this shape exactly: {"topic": "...", "flashcards": [{"question": "...", "answer": "..."}]}\n'
        "- Make the questions short and beginner-friendly.\n"
        "- Make the answers concise and clear.\n\n"
        f"Retrieved context:\n{context_block}"
    )


def _build_quiz_prompt(topic, retrieved_chunks, count, audience_level, tone):
    """Build a grounded prompt for quiz generation."""
    context_block = _format_retrieved_chunks(retrieved_chunks)

    return (
        "Create a quiz from the uploaded document context only when possible.\n\n"
        f"Topic: {topic}\n"
        f"Audience level: {audience_level}\n"
        f"Tone: {tone}\n"
        f"Number of questions: {count}\n\n"
        "Rules:\n"
        "- Use only the retrieved context when it is enough.\n"
        f"- If the context does not contain enough information, say: {NO_CONTEXT_MESSAGE}\n"
        "- Do not invent facts that are not in the retrieved context.\n"
        "- Return valid JSON only.\n"
        '- Use this shape exactly: {"topic": "...", "questions": [{"question": "...", "options": ["A", "B", "C", "D"], "correct_answer": "A", "explanation": "..."}]}\n'
        "- Each question should have 4 options.\n"
        "- Exactly one option should be correct.\n"
        "- Keep the quiz beginner-friendly and easy to explain.\n\n"
        f"Retrieved context:\n{context_block}"
    )


def _generate_with_prompt(prompt):
    """Call Gemini with a prepared prompt and return text or a safe error."""
    api_key = _get_api_key()
    if not api_key:
        return (
            "GEMINI_API_KEY is not set. Set it in your environment before calling "
            "Gemini generation helpers."
        )

    try:
        from google import genai  # pyright: ignore[reportMissingImports]

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=prompt,
        )
        answer_text = (getattr(response, "text", None) or "").strip()
        if answer_text:
            return answer_text

        return NO_CONTEXT_MESSAGE
    except ImportError:
        return "Gemini support is not installed yet. Install the google-genai package to enable answers."
    except Exception as exc:
        error_text = str(exc)
        if "RESOURCE_EXHAUSTED" in error_text or "quota" in error_text.lower():
            return QUOTA_ERROR_MESSAGE
        return GENERIC_API_ERROR_MESSAGE


def generate_answer(
    question,
    retrieved_chunks,
    audience_level="beginner",
    tone="simple",
    output_format="paragraph",
):
    """Generate a grounded answer from Gemini using retrieved chunks.

    Returns a string. If Gemini cannot answer, a clear message is returned
    instead of crashing the backend.
    """
    prompt = _build_prompt(
        str(question), retrieved_chunks, audience_level, tone, output_format
    )
    answer_text = _generate_with_prompt(prompt)
    if answer_text == NO_CONTEXT_MESSAGE:
        return "The uploaded documents do not contain enough information to answer this question."
    return answer_text


def generate_flashcards(
    topic,
    retrieved_chunks,
    count=10,
    audience_level="beginner",
    tone="simple",
):
    """Generate beginner-friendly flashcards grounded in retrieved chunks."""
    if not retrieved_chunks:
        return NO_CONTEXT_MESSAGE

    safe_count = max(1, int(count))
    prompt = _build_flashcard_prompt(
        str(topic), retrieved_chunks, safe_count, audience_level, tone
    )
    return _generate_with_prompt(prompt)


def generate_quiz(
    topic,
    retrieved_chunks,
    count=5,
    audience_level="beginner",
    tone="simple",
):
    """Generate a beginner-friendly quiz grounded in retrieved chunks."""
    if not retrieved_chunks:
        return NO_CONTEXT_MESSAGE

    safe_count = max(1, int(count))
    prompt = _build_quiz_prompt(
        str(topic), retrieved_chunks, safe_count, audience_level, tone
    )
    return _generate_with_prompt(prompt)

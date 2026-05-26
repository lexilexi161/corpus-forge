"""Gemini helpers for grounded answer generation.

This module stays separate from the Flask route so the chat endpoint can
focus on loading chunks and passing them here.
"""

from __future__ import annotations

import os

DEFAULT_MODEL = "gemini-2.0-flash"


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

    return "\n\n".join(lines)


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
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return (
            "GEMINI_API_KEY is not set. Set it in your environment before calling "
            "generate_answer()."
        )

    prompt = _build_prompt(
        str(question), retrieved_chunks, audience_level, tone, output_format
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

        return "The uploaded documents do not contain enough information to answer this question."
    except ImportError:
        return "Gemini support is not installed yet. Install the google-genai package to enable answers."
    except Exception as exc:
        error_text = str(exc)
        if "RESOURCE_EXHAUSTED" in error_text or "quota" in error_text.lower():
            return (
                "Gemini quota has been exceeded for this API key or project. "
                "The uploaded documents do not contain enough information to answer this question right now."
            )
        return "Gemini is temporarily unavailable. The uploaded documents do not contain enough information to answer this question right now."

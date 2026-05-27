import sqlite3

from flask import Blueprint, jsonify, request

from models.db import get_connection
from routes.cost import build_usage_text, record_estimated_usage
from rag.gemini_client import (
    GENERIC_API_ERROR_MESSAGE,
    NO_CONTEXT_MESSAGE,
    QUOTA_ERROR_MESSAGE,
    generate_answer,
)
from rag import retrieve_relevant_chunks

chat_bp = Blueprint("chat", __name__)


def load_saved_chunks():
    """Load saved chunks from SQLite for retrieval."""
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT file_id, chunk_order, chunk_text FROM chunks ORDER BY file_id, chunk_order, id"
        )
        rows = cursor.fetchall()
    except sqlite3.Error:
        rows = []
    finally:
        conn.close()

    chunks = []
    for row in rows:
        chunks.append(
            {
                "file_id": row[0],
                "chunk_index": row[1],
                "text": row[2],
            }
        )

    return chunks


@chat_bp.route("/chat", methods=["POST"])
def send_message():
    data = request.get_json(silent=True) or {}
    query = data.get("message") or data.get("question")
    audience_level = data.get("audience_level", "beginner")
    tone = data.get("tone", "simple")
    output_format = data.get("output_format", "paragraph")

    if not query:
        return jsonify({"status": "error", "message": "Missing message"}), 400

    chunks = load_saved_chunks()
    retrieved_chunks = retrieve_relevant_chunks(query, chunks, top_k=3)

    if not retrieved_chunks:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "The uploaded documents do not contain enough information to answer this question.",
                    "question": query,
                    "retrieved_chunks": retrieved_chunks,
                    "chunk_count": 0,
                    "source": "gemini",
                }
            ),
            200,
        )

    answer = generate_answer(
        query,
        retrieved_chunks,
        audience_level=audience_level,
        tone=tone,
        output_format=output_format,
    )

    usage_input_text = build_usage_text(
        query,
        f"audience_level: {audience_level}",
        f"tone: {tone}",
        f"output_format: {output_format}",
        *[chunk.get("text", "") for chunk in retrieved_chunks],
    )
    record_estimated_usage("chat", usage_input_text, answer)

    if answer.startswith("GEMINI_API_KEY is not set."):
        return (
            jsonify(
                {
                    "status": "error",
                    "message": answer,
                    "question": query,
                    "retrieved_chunks": retrieved_chunks,
                    "chunk_count": len(retrieved_chunks),
                    "source": "gemini",
                }
            ),
            503,
        )

    if answer == QUOTA_ERROR_MESSAGE:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": QUOTA_ERROR_MESSAGE,
                    "question": query,
                    "retrieved_chunks": retrieved_chunks,
                    "chunk_count": len(retrieved_chunks),
                    "source": "gemini",
                }
            ),
            503,
        )

    if answer.startswith("Gemini support is not installed yet."):
        return (
            jsonify(
                {
                    "status": "error",
                    "message": answer,
                    "question": query,
                    "retrieved_chunks": retrieved_chunks,
                    "chunk_count": len(retrieved_chunks),
                    "source": "gemini",
                }
            ),
            503,
        )

    if answer == GENERIC_API_ERROR_MESSAGE:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": GENERIC_API_ERROR_MESSAGE,
                    "question": query,
                    "retrieved_chunks": retrieved_chunks,
                    "chunk_count": len(retrieved_chunks),
                    "source": "gemini",
                }
            ),
            502,
        )

    return jsonify(
        {
            "status": "ok",
            "question": query,
            "answer": answer,
            "retrieved_chunks": retrieved_chunks,
            "chunk_count": len(retrieved_chunks),
            "source": "gemini",
        }
    )

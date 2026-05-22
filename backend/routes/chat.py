
import sqlite3

from flask import Blueprint, jsonify, request

from models.db import get_connection
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

    if not query:
        return jsonify({"status": "error", "message": "Missing message"}), 400

    chunks = load_saved_chunks()
    retrieved_chunks = retrieve_relevant_chunks(query, chunks, top_k=5)

    return jsonify(
        {
            "question": query,
            "retrieved_chunks": retrieved_chunks,
            "chunk_count": len(retrieved_chunks),
            "message": "Gemini is not connected yet.",
        }
    )

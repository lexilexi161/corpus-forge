import datetime
import json
import os
import sqlite3

from flask import Blueprint, jsonify, request
from typing import Any
from werkzeug.utils import secure_filename

from models.db import get_connection
from rag import retrieve_relevant_chunks
from rag.gemini_client import (
    NO_CONTEXT_MESSAGE,
    generate_flashcards,
    generate_quiz,
)

artifacts_bp = Blueprint("artifacts", __name__)
GENERATED_ARTIFACTS_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "generated_artifacts"
)


def load_saved_chunks():
    """Load saved chunks from SQLite for artifact generation."""
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


def _extract_topic(data):
    return data.get("topic") or data.get("prompt")


def _extract_count(data, default_count):
    raw_count = data.get("count", default_count)
    try:
        return max(1, int(raw_count))
    except (TypeError, ValueError):
        return default_count


def _save_generated_artifact(artifact_type, topic, prompt_text, content):
    """Save generated content to disk and record it in the artifacts table."""
    os.makedirs(GENERATED_ARTIFACTS_FOLDER, exist_ok=True)

    timestamp = datetime.datetime.now()
    safe_topic = secure_filename(str(topic)) or "artifact"
    filename = (
        f"{artifact_type}_{safe_topic}_{timestamp.strftime('%Y%m%d_%H%M%S')}.json"
    )
    artifact_path = os.path.join(GENERATED_ARTIFACTS_FOLDER, filename)

    with open(artifact_path, "w", encoding="utf-8") as file_handle:
        file_handle.write(content)

    artifact_size = os.path.getsize(artifact_path)

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO artifacts(artifact_name, artifact_date, artifact_size, artifact_type, artifact_path, artifact_prompt, corpus_id, document_id) "
            "VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
            (
                filename,
                timestamp,
                artifact_size,
                artifact_type,
                artifact_path,
                prompt_text,
                None,
                None,
            ),
        )
        artifact_id = cursor.lastrowid
        conn.commit()
    except sqlite3.Error as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        try:
            conn.close()
        except Exception:
            pass
        try:
            os.remove(artifact_path)
        except OSError:
            pass
        raise exc
    finally:
        try:
            conn.close()
        except Exception:
            pass

    return {
        "artifact_id": artifact_id,
        "artifact_name": filename,
        "artifact_date": timestamp.isoformat(),
        "artifact_size": artifact_size,
        "artifact_type": artifact_type,
        "artifact_path": artifact_path,
        "artifact_prompt": prompt_text,
        "corpus_id": None,
        "document_id": None,
    }


def _handle_no_context_response(topic, artifact_type):
    message = (
        "The uploaded documents do not contain enough information to generate this "
        f"{artifact_type}."
    )
    return (
        jsonify(
            {
                "status": "error",
                "artifact_type": artifact_type,
                "topic": topic,
                "content": message,
                "message": message,
                "retrieved_chunks": [],
                "chunk_count": 0,
                "source": "gemini",
            }
        ),
        200,
    )


def _build_artifact_success_response(
    artifact_type, topic, content, retrieved_chunks, artifact_metadata
):
    return jsonify(
        {
            "status": "ok",
            "artifact_type": artifact_type,
            "topic": topic,
            "content": content,
            "retrieved_chunks": retrieved_chunks,
            "chunk_count": len(retrieved_chunks),
            "source": "gemini",
            "artifact_metadata": artifact_metadata,
        }
    )


@artifacts_bp.route("/artifacts/flashcards", methods=["POST"])
def create_flashcards() -> Any:
    data = request.get_json(silent=True) or {}
    topic = _extract_topic(data)
    if not topic:
        return jsonify({"status": "error", "message": "Missing topic or prompt"}), 400

    count = _extract_count(data, 10)
    audience_level = data.get("audience_level", "beginner")
    tone = data.get("tone", "simple")

    chunks = load_saved_chunks()
    retrieved_chunks = retrieve_relevant_chunks(topic, chunks, top_k=5)
    if not retrieved_chunks:
        return _handle_no_context_response(topic, "flashcards")

    content = generate_flashcards(
        topic,
        retrieved_chunks,
        count=count,
        audience_level=audience_level,
        tone=tone,
    )

    if content == NO_CONTEXT_MESSAGE:
        return _handle_no_context_response(topic, "flashcards")

    try:
        artifact_metadata = _save_generated_artifact(
            "flashcards",
            topic,
            topic,
            content,
        )
    except sqlite3.Error as exc:
        return (
            jsonify(
                {
                    "status": "error",
                    "artifact_type": "flashcards",
                    "topic": topic,
                    "message": "Failed to save generated flashcards.",
                    "details": str(exc),
                    "retrieved_chunks": retrieved_chunks,
                    "chunk_count": len(retrieved_chunks),
                    "source": "gemini",
                }
            ),
            500,
        )

    return _build_artifact_success_response(
        "flashcards", topic, content, retrieved_chunks, artifact_metadata
    )


@artifacts_bp.route("/artifacts/quiz", methods=["POST"])
def create_quiz() -> Any:
    data = request.get_json(silent=True) or {}
    topic = _extract_topic(data)
    if not topic:
        return jsonify({"status": "error", "message": "Missing topic or prompt"}), 400

    count = _extract_count(data, 5)
    audience_level = data.get("audience_level", "beginner")
    tone = data.get("tone", "simple")

    chunks = load_saved_chunks()
    retrieved_chunks = retrieve_relevant_chunks(topic, chunks, top_k=5)
    if not retrieved_chunks:
        return _handle_no_context_response(topic, "quiz")

    content = generate_quiz(
        topic,
        retrieved_chunks,
        count=count,
        audience_level=audience_level,
        tone=tone,
    )

    if content == NO_CONTEXT_MESSAGE:
        return _handle_no_context_response(topic, "quiz")

    try:
        artifact_metadata = _save_generated_artifact(
            "quiz",
            topic,
            topic,
            content,
        )
    except sqlite3.Error as exc:
        return (
            jsonify(
                {
                    "status": "error",
                    "artifact_type": "quiz",
                    "topic": topic,
                    "message": "Failed to save generated quiz.",
                    "details": str(exc),
                    "retrieved_chunks": retrieved_chunks,
                    "chunk_count": len(retrieved_chunks),
                    "source": "gemini",
                }
            ),
            500,
        )

    return _build_artifact_success_response(
        "quiz", topic, content, retrieved_chunks, artifact_metadata
    )

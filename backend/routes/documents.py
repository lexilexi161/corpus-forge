import os
import sqlite3
import datetime
from models.db import get_connection
from flask import Blueprint, jsonify, request
from config import UPLOAD_FOLDER
from rag import chunk_text, parse_document
from werkzeug.utils import secure_filename

documents_bp = Blueprint("documents", __name__)


@documents_bp.route("/documents", methods=["POST"])
def add_file():
    if "file" not in request.files:
        return jsonify({"status": "error", "message": "No file part in request"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"status": "error", "message": "No file selected"}), 400

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filename = secure_filename(file.filename)
    saved_path = f"{UPLOAD_FOLDER}/{filename}"
    file.save(saved_path)

    size = os.path.getsize(saved_path)
    _, document_type = os.path.splitext(filename)
    uploaded_at = datetime.datetime.now()

    try:
        extracted_text = parse_document(saved_path)
        chunks = chunk_text(extracted_text)
    except (FileNotFoundError, ImportError, OSError, TypeError, ValueError) as exc:
        return jsonify({"status": "error", "message": str(exc)}), 400

    chunk_count = len(chunks)
    extracted_text_length = len(extracted_text) if extracted_text is not None else 0

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # Perform document + chunk inserts in a transaction so we don't silently
        # leave the DB in a partial state if chunk saving fails.
        cursor.execute(
            "INSERT INTO documents(document_name, size, uploaded_at, document_type, file_path) "
            "VALUES(?, ?, ?, ?, ?)",
            (filename, size, uploaded_at, document_type, saved_path),
        )
        document_id = cursor.lastrowid

        for chunk in chunks:
            cursor.execute(
                "INSERT INTO chunks(file_id, embedding, chunk_order, chunk_text) VALUES(?, ?, ?, ?)",
                (document_id, "", chunk["chunk_index"], chunk["text"]),
            )

        conn.commit()
    except sqlite3.OperationalError as exc:
        # Roll back and return an explicit error so uploads don't report success
        # when chunks failed to save (table missing, schema mismatch, etc.).
        try:
            conn.rollback()
        except Exception:
            pass
        try:
            conn.close()
        except Exception:
            pass
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Failed to save chunks to the database.",
                    "details": str(exc),
                    "filename": filename,
                    "chunk_count": len(chunks),
                }
            ),
            500,
        )
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        try:
            conn.close()
        except Exception:
            pass
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Database error while saving document.",
                    "details": str(exc),
                    "filename": filename,
                    "chunk_count": len(chunks),
                }
            ),
            500,
        )
    finally:
        try:
            conn.close()
        except Exception:
            pass

    uploaded_at_string = uploaded_at.isoformat()
    return jsonify(
        {
            "status": "ok",
            "filename": filename,
            "size": size,
            "uploaded_at": uploaded_at_string,
            "document_Type": document_type,
            "filepath": saved_path,
            "chunk_count": chunk_count,
            "extracted_text_length": extracted_text_length,
        }
    )

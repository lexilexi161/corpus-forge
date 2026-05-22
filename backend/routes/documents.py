import os
import sqlite3
import datetime
from models.db import get_connection
from flask import Blueprint, jsonify, request
from config import UPLOAD_FOLDER
from rag import chunk_text, parse_document

documents_bp = Blueprint("documents", __name__)


@documents_bp.route("/documents", methods=["POST"])
def add_file():
    if "file" not in request.files:
        return jsonify({"status": "error", "message": "No file part in request"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"status": "error", "message": "No file selected"}), 400

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filename = file.filename
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

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO documents(document_name, size, uploaded_at, document_type, file_path) "
        "VALUES(?, ?, ?, ?, ?)",
        (filename, size, uploaded_at, document_type, saved_path),
    )
    document_id = cursor.lastrowid

    try:
        for chunk in chunks:
            cursor.execute(
                "INSERT INTO chunks(file_id, embedding, chunk_order, chunk_text) VALUES(?, ?, ?, ?)",
                (document_id, "", chunk["chunk_index"], chunk["text"]),
            )
    except sqlite3.OperationalError:
        # TODO: If the chunks table is not available, add a dedicated persistence helper.
        pass

    conn.commit()
    conn.close()

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
        }
    )

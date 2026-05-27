import datetime
from flask import Blueprint, jsonify, request
from models.db import get_connection

chats_bp = Blueprint("chats", __name__)


@chats_bp.route("/chats", methods=["POST"])
def save_chat():
    data = request.get_json(silent=True) or {}
    messages = data.get("messages", [])
    title = data.get("title", "Untitled Chat")

    if not messages:
        return jsonify({"status": "error", "message": "No messages"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO chats (title, created_at) VALUES (?, ?)",
        (title, datetime.datetime.now())
    )
    chat_id = cursor.lastrowid

    for msg in messages:
        cursor.execute(
            "INSERT INTO chat_messages (chat_id, role, content, created_at) VALUES (?, ?, ?, ?)",
            (chat_id, msg["role"], msg["content"], datetime.datetime.now())
        )

    conn.commit()
    conn.close()
    return jsonify({"status": "ok", "chat_id": chat_id})


@chats_bp.route("/chats", methods=["GET"])
def get_chats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT chat_id, title, created_at FROM chats ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return jsonify([{"chat_id": r[0], "title": r[1], "created_at": r[2]} for r in rows])


@chats_bp.route("/chats/<int:chat_id>", methods=["GET"])
def get_chat(chat_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT role, content FROM chat_messages WHERE chat_id = ? ORDER BY message_id",
        (chat_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return jsonify([{"role": r[0], "content": r[1]} for r in rows])
@chats_bp.route("/chats/<int:chat_id>", methods=["DELETE"])
def delete_chat(chat_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM chat_messages WHERE chat_id = ?", (chat_id,))
    cursor.execute("DELETE FROM chats WHERE chat_id = ?", (chat_id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})

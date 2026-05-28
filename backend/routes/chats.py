import datetime
import sqlite3
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
    if not isinstance(messages, list):
        return jsonify({"status": "error", "message": "Messages must be a list"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO chats (title, created_at) VALUES (?, ?)",
            (title, datetime.datetime.now())
        )
        chat_id = cursor.lastrowid

        for msg in messages:
            if not isinstance(msg, dict):
                continue

            role = msg.get("role")
            content = msg.get("content")
            if role not in {"user", "ai"} or not content:
                continue

            cursor.execute(
                "INSERT INTO chat_messages (chat_id, role, content, created_at) VALUES (?, ?, ?, ?)",
                (chat_id, role, content, datetime.datetime.now())
            )

        conn.commit()
    except sqlite3.Error as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Failed to save chat.",
                    "details": str(exc),
                }
            ),
            500,
        )
    finally:
        conn.close()

    return jsonify({"status": "ok", "chat_id": chat_id})


@chats_bp.route("/chats", methods=["GET"])
def get_chats():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT chat_id, title, created_at FROM chats ORDER BY created_at DESC")
        rows = cursor.fetchall()
    except sqlite3.Error as exc:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Failed to load chats.",
                    "details": str(exc),
                }
            ),
            500,
        )
    finally:
        conn.close()

    return jsonify([{"chat_id": r[0], "title": r[1], "created_at": r[2]} for r in rows])


@chats_bp.route("/chats/<int:chat_id>", methods=["GET"])
def get_chat(chat_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT role, content FROM chat_messages WHERE chat_id = ? ORDER BY message_id",
            (chat_id,)
        )
        rows = cursor.fetchall()
    except sqlite3.Error as exc:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Failed to load chat.",
                    "details": str(exc),
                }
            ),
            500,
        )
    finally:
        conn.close()

    return jsonify([{"role": r[0], "content": r[1]} for r in rows])

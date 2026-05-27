import sqlite3
from datetime import datetime, timezone

from flask import Blueprint, jsonify

from models.db import get_connection

cost_bp = Blueprint("cost", __name__)


def build_usage_text(*parts):
    lines = []
    for part in parts:
        if part is None:
            continue
        text = str(part).strip()
        if text:
            lines.append(text)
    return "\n".join(lines)


def estimate_tokens(text):
    if not text:
        return 0
    return max(1, (len(text) + 3) // 4)


def record_estimated_usage(request_type, input_text, output_text, user_id=None):
    input_tokens = estimate_tokens(input_text)
    output_tokens = estimate_tokens(output_text)
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO cost(user_id, request_type, input_tokens, output_tokens, created_at) VALUES(?, ?, ?, ?, ?)",
            (
                user_id,
                request_type,
                input_tokens,
                output_tokens,
                datetime.now(timezone.utc),
            ),
        )
        conn.commit()
    except sqlite3.Error:
        try:
            conn.rollback()
        except Exception:
            pass
    finally:
        conn.close()


def _fetch_cost_totals():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT COUNT(*), COALESCE(SUM(input_tokens), 0), COALESCE(SUM(output_tokens), 0) FROM cost"
        )
        row = cursor.fetchone() or (0, 0, 0)
    except sqlite3.Error:
        row = (0, 0, 0)
    finally:
        conn.close()

    request_count, input_tokens, output_tokens = row
    return {
        "request_count": int(request_count or 0),
        "input_tokens": int(input_tokens or 0),
        "output_tokens": int(output_tokens or 0),
        "total_tokens": int((input_tokens or 0) + (output_tokens or 0)),
    }


@cost_bp.route("/cost", methods=["GET"])
def get_cost():
    totals = _fetch_cost_totals()
    return jsonify(
        {
            **totals,
            "total_requests": totals["request_count"],
            "prompt_tokens": totals["input_tokens"],
            "completion_tokens": totals["output_tokens"],
            "estimated_cost": 0.0,
        }
    )

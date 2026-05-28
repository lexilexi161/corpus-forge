from pathlib import Path
import sqlite3


def get_connection():
    db_path = Path(__file__).resolve().parents[1] / "database" / "corpus-forge.db"
    conn = sqlite3.connect(db_path)
    return conn
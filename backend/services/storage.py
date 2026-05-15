import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "../../data")
DOCS_FILE = os.path.join(DATA_DIR, "documents.json")
TEXTS_DIR = os.path.join(DATA_DIR, "texts")

os.makedirs(TEXTS_DIR, exist_ok=True)

def _load_docs() -> list:
    if not os.path.exists(DOCS_FILE):
        return []
    with open(DOCS_FILE, "r") as f:
        return json.load(f)

def _save_docs(docs: list):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DOCS_FILE, "w") as f:
        json.dump(docs, f, indent=2)

def save_document(doc: dict, text: str):
    docs = _load_docs()
    docs.append(doc)
    _save_docs(docs)
    # persist raw text
    with open(os.path.join(TEXTS_DIR, f"{doc['id']}.txt"), "w") as f:
        f.write(text)

def list_documents() -> list:
    return _load_docs()

def delete_document(doc_id: str) -> bool:
    docs = _load_docs()
    new_docs = [d for d in docs if d["id"] != doc_id]
    if len(new_docs) == len(docs):
        return False
    _save_docs(new_docs)
    txt_path = os.path.join(TEXTS_DIR, f"{doc_id}.txt")
    if os.path.exists(txt_path):
        os.remove(txt_path)
    return True

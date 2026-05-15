import uuid
import os
from datetime import datetime
from services.storage import save_document
from services.vector_store import add_to_vector_store

async def ingest_document(filename: str, ext: str, content: bytes) -> dict:
    """Parse and index a document into the vector store."""
    doc_id = str(uuid.uuid4())
    text = extract_text(ext, content)
    
    doc = {
        "id": doc_id,
        "filename": filename,
        "type": ext,
        "created_at": datetime.utcnow().isoformat(),
        "chunk_count": 0,
    }
    
    chunks = chunk_text(text)
    doc["chunk_count"] = len(chunks)
    
    save_document(doc, text)
    add_to_vector_store(doc_id, chunks)
    
    return doc

def extract_text(ext: str, content: bytes) -> str:
    """Extract plain text from different file types."""
    if ext == ".pdf":
        import pypdf
        import io
        reader = pypdf.PdfReader(io.BytesIO(content))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    else:
        # Markdown, text, source code — decode as UTF-8
        return content.decode("utf-8", errors="ignore")

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """Split text into overlapping chunks."""
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk:
            chunks.append(chunk)
    return chunks

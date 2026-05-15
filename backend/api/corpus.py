from fastapi import APIRouter, UploadFile, File, HTTPException
from services.ingestion import ingest_document
from services.storage import list_documents, delete_document

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Ingest a document (PDF, Markdown, or source code)."""
    allowed_types = [".pdf", ".md", ".txt", ".py", ".js", ".ts", ".java", ".cpp", ".c"]
    import os
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")
    
    content = await file.read()
    doc = await ingest_document(file.filename, ext, content)
    return {"message": "Document ingested", "document": doc}

@router.get("/")
def get_documents():
    """List all documents in the corpus."""
    return {"documents": list_documents()}

@router.delete("/{doc_id}")
def remove_document(doc_id: str):
    """Remove a document from the corpus."""
    success = delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document removed"}

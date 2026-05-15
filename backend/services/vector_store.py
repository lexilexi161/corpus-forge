import chromadb
import os

CHROMA_DIR = os.path.join(os.path.dirname(__file__), "../../data/chroma")

_client = chromadb.PersistentClient(path=CHROMA_DIR)
_collection = _client.get_or_create_collection("corpus")

def add_to_vector_store(doc_id: str, chunks: list[str]):
    """Embed and store document chunks."""
    if not chunks:
        return
    ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
    metadatas = [{"doc_id": doc_id, "chunk_index": i} for i in range(len(chunks))]
    _collection.add(documents=chunks, ids=ids, metadatas=metadatas)

def query_vector_store(query: str, doc_ids: list[str], top_k: int = 5) -> list[str]:
    """Retrieve top-k relevant chunks from selected documents."""
    where = {"doc_id": {"$in": doc_ids}} if doc_ids else None
    results = _collection.query(
        query_texts=[query],
        n_results=top_k,
        where=where,
    )
    return results["documents"][0] if results["documents"] else []

def delete_from_vector_store(doc_id: str):
    """Remove all chunks for a document."""
    results = _collection.get(where={"doc_id": doc_id})
    if results["ids"]:
        _collection.delete(ids=results["ids"])

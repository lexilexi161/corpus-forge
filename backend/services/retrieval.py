from services.vector_store import query_vector_store

def retrieve_context(query: str, doc_ids: list[str], top_k: int = 5) -> str:
    """Retrieve relevant context chunks and join them."""
    chunks = query_vector_store(query, doc_ids, top_k=top_k)
    return "\n\n---\n\n".join(chunks)

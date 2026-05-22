"""Simple retrieval helpers for selecting relevant document chunks."""

from collections import Counter
import re


def normalize_text(text):
    """Prepare text for simple matching and scoring."""
    if text is None:
        return ""

    words = re.findall(r"[a-z0-9]+", str(text).lower())
    return " ".join(words)


def score_chunk(query, chunk_text):
    """Return a simple relevance score for one chunk against a query."""
    query_tokens = normalize_text(query).split()
    chunk_tokens = normalize_text(chunk_text).split()

    if not query_tokens or not chunk_tokens:
        return 0

    query_counts = Counter(query_tokens)
    chunk_counts = Counter(chunk_tokens)

    score = 0
    for token, query_count in query_counts.items():
        if token in chunk_counts:
            score += min(query_count, chunk_counts[token])

    return score


def retrieve_relevant_chunks(query, chunks, top_k=5):
    """Return the most relevant chunks for a user query."""
    if top_k <= 0:
        return []

    if not chunks:
        return []

    query_text = normalize_text(query)
    if not query_text:
        return []

    scored_chunks = []

    for position, chunk in enumerate(chunks):
        if isinstance(chunk, dict):
            chunk_text = chunk.get("text", "")
            chunk_index = chunk.get("chunk_index", position)
        else:
            chunk_text = str(chunk)
            chunk_index = position

        score = score_chunk(query_text, chunk_text)

        scored_chunks.append((score, position, chunk_index, chunk, chunk_text))

    scored_chunks.sort(key=lambda item: (-item[0], item[1]))

    top_chunks = []
    for score, _, _, chunk, chunk_text in scored_chunks[:top_k]:
        if isinstance(chunk, dict):
            chunk_result = dict(chunk)
            chunk_result["score"] = score
            top_chunks.append(chunk_result)
        else:
            top_chunks.append(
                {
                    "chunk_index": None,
                    "text": chunk_text,
                    "start_char": None,
                    "end_char": None,
                    "score": score,
                }
            )

    return top_chunks

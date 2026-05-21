"""Simple retrieval helpers for selecting relevant document chunks."""


def normalize_text(text):
    """Prepare text for simple matching and scoring."""
    # TODO: Lowercase text and remove extra whitespace.
    pass


def score_chunk(query, chunk_text):
    """Return a simple relevance score for one chunk against a query."""
    # TODO: Compare normalized query terms with normalized chunk text.
    pass


def retrieve_relevant_chunks(query, chunks, top_k=5):
    """Return the most relevant chunks for a user query."""
    # TODO: Score each chunk and return the best top_k matches.
    pass

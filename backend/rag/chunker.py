"""Text chunking helpers for the RAG workflow."""


def chunk_text(text, chunk_size=1000, overlap=200):
    """Split text into smaller overlapping chunks for retrieval.

    Each returned chunk is a dictionary with:
    - chunk_index
    - text
    - start_char
    - end_char
    """
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than 0")

    if overlap < 0:
        raise ValueError("overlap must be 0 or greater")

    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    if not text:
        return []

    chunks = []
    step = chunk_size - overlap
    text_length = len(text)

    start_char = 0
    chunk_index = 0

    while start_char < text_length:
        end_char = min(start_char + chunk_size, text_length)
        chunk_text_value = text[start_char:end_char]

        chunks.append(
            {
                "chunk_index": chunk_index,
                "text": chunk_text_value,
                "start_char": start_char,
                "end_char": end_char,
            }
        )

        if end_char >= text_length:
            break

        start_char += step
        chunk_index += 1

    return chunks

"""Manual smoke test for the RAG helper functions.

Run this file directly to verify three steps:
1. parse a text file
2. chunk the extracted text
3. retrieve the most relevant chunks for a sample query
"""

from pathlib import Path
import sys
import tempfile

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from rag import chunk_text, parse_document, retrieve_relevant_chunks

SAMPLE_TEXT = (
    "Corpus Forge uploads documents into the database. "
    "The parser reads the file as plain text. "
    "The chunker splits long text into smaller overlapping parts. "
    "The retriever compares a question with the saved chunks and returns the best matches. "
    "This makes it easier to answer questions using the uploaded document."
)


def main():
    """Run the manual test and print each step."""
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        sample_file = temp_path / "sample_document.txt"
        sample_file.write_text(SAMPLE_TEXT, encoding="utf-8")

        print("1) Parsing text file")
        parsed_text = parse_document(sample_file)
        print(f"   Parsed characters: {len(parsed_text)}")

        print("\n2) Chunking text")
        chunks = chunk_text(parsed_text, chunk_size=100, overlap=20)
        print(f"   Total chunks: {len(chunks)}")
        for chunk in chunks:
            print(
                f"   - chunk_index={chunk['chunk_index']}, "
                f"start_char={chunk['start_char']}, end_char={chunk['end_char']}, "
                f"text={chunk['text']!r}"
            )

        print("\n3) Retrieving relevant chunks")
        query = "How does the retriever find relevant chunks from an uploaded document?"
        relevant_chunks = retrieve_relevant_chunks(query, chunks, top_k=3)
        print(f"   Query: {query}")
        for chunk in relevant_chunks:
            print(
                f"   - score={chunk['score']}, chunk_index={chunk['chunk_index']}, "
                f"start_char={chunk['start_char']}, end_char={chunk['end_char']}"
            )
            print(f"     text={chunk['text']!r}")


if __name__ == "__main__":
    main()

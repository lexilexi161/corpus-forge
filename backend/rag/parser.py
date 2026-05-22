"""Document parsing helpers for the RAG workflow."""

from pathlib import Path

SUPPORTED_TEXT_EXTENSIONS = {".txt", ".md", ".py", ".js"}
SUPPORTED_EXTENSIONS = SUPPORTED_TEXT_EXTENSIONS | {".pdf"}


def _validate_file_path(file_path):
    """Return a Path object for an existing file."""
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    if not path.is_file():
        raise FileNotFoundError(f"Not a file: {file_path}")

    return path


def get_file_extension(file_path):
    """Return the lowercase file extension for a document path."""
    return Path(file_path).suffix.lower()


def parse_document(file_path):
    """Extract text from a supported document based on its file type."""
    path = _validate_file_path(file_path)
    extension = get_file_extension(path)

    if extension in SUPPORTED_TEXT_EXTENSIONS:
        return parse_text_file(path)

    if extension == ".pdf":
        return parse_pdf_file(path)

    raise ValueError(
        f"Unsupported file type: {extension}. Supported types are: "
        f"{', '.join(sorted(SUPPORTED_EXTENSIONS))}"
    )


def parse_text_file(file_path):
    """Read plain text content from a text file."""
    path = _validate_file_path(file_path)

    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        raise OSError(f"Could not read file: {file_path}") from exc

    if not text.strip():
        raise ValueError(f"File is empty: {file_path}")

    return text


def parse_pdf_file(file_path):
    """Extract readable text content from a PDF file."""
    path = _validate_file_path(file_path)

    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise ImportError(
            "PDF support requires the 'pypdf' package. Install it with `pip install pypdf`."
        ) from exc

    try:
        reader = PdfReader(str(path))
    except OSError as exc:
        raise OSError(f"Could not open PDF file: {file_path}") from exc

    pages = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        if page_text:
            pages.append(page_text)

    text = "\n".join(pages).strip()

    if not text:
        raise ValueError(f"No extractable text found in PDF file: {file_path}")

    return text

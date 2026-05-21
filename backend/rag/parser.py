"""Document parsing helpers for the RAG workflow."""


def get_file_extension(file_path):
    """Return the lowercase file extension for a document path."""
    # TODO: Extract and normalize the extension from file_path.
    pass


def parse_document(file_path):
    """Extract text from a supported document based on its file type."""
    # TODO: Use get_file_extension to choose the correct parser.
    # TODO: Support text files first, then add PDF support.
    pass


def parse_text_file(file_path):
    """Read plain text content from a text file."""
    # TODO: Open the text file safely and return its contents.
    pass


def parse_pdf_file(file_path):
    """Extract readable text content from a PDF file."""
    # TODO: Add PDF text extraction with a library such as pypdf.
    pass

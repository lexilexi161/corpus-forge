from pdf2docx import converter

def pdf_to_docx(pdf_path, docx_path):
    cv = Converter(pdf_path)
    cv.convert(docx_path, start=0, end=None)
    cv.close()
    print(f"Done! Saved to {docx_path}")

pdf_to_docx("input.pdf", "output.docx")
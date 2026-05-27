# Corpus Forge Technical Report

## 1. Title and Team Members

Project: Corpus Forge

Team:

- Thuong Gia Han PHAM - thuong-gia-han.pham@epita.fr - GitHub: Chloee-pham
- Victor Oganwo - victor.oganwo@epita.fr - GitHub: victor-oganwo
- Stanislaw Wojciechowski - stanislaw.wojciechowski@epita.fr - GitHub: lexilexi161-

## 2. Project Overview

Corpus Forge is a RAG-based document AI platform. Users upload documents, the backend extracts and chunks their content, and the system uses retrieved chunks as context for Gemini-powered chat and artifact generation.

The active backend is the Flask application in `backend/app.py`. The old `backend/main.py` FastAPI file is a prototype and is not used as the main application.

## 3. Problem Statement and Motivation

Students and software teams often collect many documents, PDFs, notes, and source-code files, but it is difficult to quickly turn them into study materials or engineering summaries. Corpus Forge solves this by letting users upload a small corpus, ask grounded questions, and generate useful artifacts such as flashcards, quizzes, and code-analysis reports.

The project also demonstrates practical engineering judgment: persistence, API design, prompt reliability, error handling, and documentation of AI-assisted development.

## 4. Architecture

The application has four main layers:

- React frontend
  - Main interface in `frontend/src/App.tsx`.
  - API helper in `frontend/src/api.ts`.
  - Sidebar navigation for Chat, Flashcards, Quiz, Code Analysis, Cost, and Profile.

- Flask backend
  - Active entry point: `backend/app.py`.
  - Routes:
    - `backend/routes/documents.py`
    - `backend/routes/chat.py`
    - `backend/routes/artifacts.py`
    - `backend/routes/cost.py`

- SQLite database
  - Schema in `backend/database/schema.sql`.
  - Stores uploaded document metadata, chunks, artifact metadata, users/sessions, and estimated cost usage.

- RAG and Gemini layer
  - Parsing: `backend/rag/parser.py`
  - Chunking: `backend/rag/chunker.py`
  - Retrieval: `backend/rag/retriever.py`
  - Gemini prompts and API calls: `backend/rag/gemini_client.py`

Main pipeline:

```text
upload document
-> save file
-> parse text
-> split into chunks
-> save chunks
-> retrieve relevant chunks
-> build grounded prompt
-> call Gemini
-> return answer or generated artifact
```

## 5. Core Platform Requirements Implemented

### Document Ingestion

Implemented. The upload endpoint accepts `.txt`, `.md`, `.pdf`, `.py`, and `.js` files. Uploaded files are saved locally, parsed, chunked, and stored in SQLite.

### Corpus and Document Management

Partially implemented. Users can upload and view documents in the frontend sidebar. The database has `documents`, `chunks`, `corpus`, and `corpus_documents` tables. However, full corpus collection management, backend document listing, active-document filtering, and document deletion are future improvements.

### Retrieval-Grounded Chat

Implemented. The chat route loads saved chunks, retrieves relevant chunks using keyword matching, and sends them to Gemini for a grounded answer.

### Flashcards

Implemented. The frontend and backend support flashcard generation from retrieved document context. Generated content is saved locally and metadata is inserted into the `artifacts` table.

### Quiz

Implemented. The frontend and backend support quiz generation from retrieved document context. Generated content is saved locally and metadata is inserted into the `artifacts` table.

### Source-Code Analysis Reports

Implemented. The platform supports source-code analysis through `POST /artifacts/code-analysis`. It asks Gemini to produce code review comments, possible bugs, architecture overview, control-flow explanation, and improvement suggestions. This works best when uploaded `.py` or `.js` files are queried with function/class names that appear in the code.

### Prompt Steering

Partially implemented. Backend chat, flashcards, and quiz prompts support options such as audience level, tone, and output format. The UI exposes some simple topic/count controls, but more complete prompt steering controls could be improved.

### Persistence

Implemented. Uploaded documents and chunks persist in SQLite. Generated artifacts are saved in `backend/generated_artifacts/`, and their metadata is stored in the `artifacts` table.

### Cost Observability

Implemented as estimated tracking. The backend records request count and estimated input/output tokens using a simple character-count approximation. The frontend Cost page calls `GET /cost` and displays request count, input tokens, output tokens, and total tokens.

## 6. RAG Pipeline Explanation

The RAG pipeline begins when the user uploads a document through the frontend or `POST /documents`. The backend saves the file into the uploads folder. It then uses `parse_document()` to extract text based on file type. Text and source-code files are read directly; PDFs are parsed with `pypdf`.

After parsing, `chunk_text()` splits the content into overlapping chunks. Each chunk is stored in the `chunks` table with a reference to the uploaded document.

When the user asks a question or requests an artifact, the backend loads saved chunks and calls `retrieve_relevant_chunks()`. Retrieval uses simple keyword overlap scoring. Only positive-score chunks are returned, which prevents unrelated zero-score chunks from being sent to Gemini.

Gemini receives a grounded prompt that includes the user task and the retrieved chunks. The prompt tells Gemini to use only the retrieved context when possible and to avoid inventing facts.

## 7. Database Design Summary

Main tables:

- `documents`: uploaded file metadata.
- `chunks`: parsed text chunks linked to documents.
- `corpus`: planned grouping table for document collections.
- `corpus_documents`: join table for documents and corpora.
- `artifacts`: generated flashcards, quizzes, and code-analysis report metadata.
- `user`: planned user account data.
- `session`: planned session data.
- `cost`: estimated usage records for AI-related requests.

The current implementation actively uses `documents`, `chunks`, `artifacts`, and `cost`.

## 8. Main API Endpoints

- `POST /documents`
  - Upload and ingest a document.

- `POST /chat`
  - Ask a grounded question using retrieved document chunks.

- `POST /artifacts/flashcards`
  - Generate flashcards from retrieved context.

- `POST /artifacts/quiz`
  - Generate a quiz from retrieved context.

- `POST /artifacts/code-analysis`
  - Generate a source-code review and architecture/control-flow report.

- `GET /cost`
  - Return estimated request and token usage totals.

## 9. Engineering Challenge: Prompt Engineering / Reliability

We chose Prompt Engineering / Reliability as our Layer 2 engineering challenge.

What we improved:

- Gemini prompts are grounded in retrieved document context.
- Chat prompts instruct Gemini not to invent unsupported facts.
- Flashcard and quiz prompts ask for structured JSON-style output.
- Code-analysis prompts ask for practical sections: code review, bugs, architecture, control flow, and improvements.
- The backend avoids calling Gemini when retrieval finds no useful chunks.
- Missing API keys return clear errors instead of crashing.
- Gemini quota/rate-limit errors return clear responses instead of crashing.
- Retrieved context is limited to reduce quota usage.
- Manual tests were documented for upload, chat, artifacts, cost tracking, security, and conflict checks.

What worked:

- Smaller prompts and fewer retrieved chunks reduced quota pressure.
- Explicit no-context behavior made answers more honest.
- Structured artifact prompts made flashcards and quizzes easier to display and save.

What failed or needed redesign:

- Early frontend behavior was mock-only and did not call the real backend.
- Retrieval initially risked sending unrelated chunks.
- Gemini free quota caused `429 TooManyRequests` during testing.
- Artifact output sometimes appears as raw JSON/plain text and needs more UI formatting.

## 10. AI Collaboration

GitHub Copilot was used as the main AI coding assistant during implementation. Codex/ChatGPT-style review was also used for planning, checking route wiring, identifying missing pieces, and preparing documentation.

AI output was not accepted blindly. We reviewed generated suggestions against the existing Flask/React structure, tested route behavior manually, and corrected issues such as mock frontend responses, no-context handling, quota handling, merge conflicts, and accidental API-key exposure in logs.

## 11. Failures and Redesigns

- Frontend initially mock-only
  - The upload and chat UI existed before all backend calls were connected. The frontend was later wired to `frontend/src/api.ts`.

- Gemini quota limit
  - Free quota caused rate-limit errors. We switched to a lighter default model, reduced retrieved chunks, limited context length, and added clear quota error responses.

- Raw JSON display for artifacts
  - Flashcards and quizzes may display raw structured text. This is acceptable for a demo but needs UI polish.

- Merge conflicts in journal/prompt history
  - Conflict markers appeared during collaboration and had to be cleaned while preserving valid logs.

- Exposed API key alert
  - A real key appeared in logs during development. The key was redacted from `JOURNAL.md` and `prompts_history.md`, and the team should revoke/rotate any exposed key.

- Retrieval initially broad/all chunks
  - The system currently retrieves from all saved chunks. Visual active-document selection exists, but backend filtering by selected documents is future work.

## 12. Division of Work

Chloé - Frontend/UI:

- React interface.
- Sidebar and navigation.
- Chat page.
- Upload UI.
- Flashcards, quiz, and code-analysis pages.
- Visual layout and user flow.

Stanislaw - Backend/database/architecture:

- Flask backend structure.
- Route organization.
- SQLite schema and persistence.
- Document, chunk, artifact, and cost tables.
- Backend wiring and architecture/database documentation.

Victor - AI/RAG/retrieval/Gemini/features integration:

- Document parsing for `.txt`, `.md`, `.pdf`, `.py`, and `.js`.
- Chunking.
- Simple keyword retrieval.
- Gemini integration.
- RAG chat flow.
- Flashcard generation.
- Quiz generation.
- Code-analysis route.
- Frontend-backend API integration support.
- Cost tracking support.
- Prompt/history review, testing, and documentation cleanup.

## 13. Manual Testing Summary

Manual testing covered:

- Flask backend startup.
- React/Vite frontend startup.
- Document upload and chunk creation.
- Chat with retrieved chunks.
- Flashcard generation.
- Quiz generation.
- Code-analysis report generation.
- Cost endpoint and frontend Cost page.
- API-key safety search.
- Merge-conflict marker search.

Detailed test notes are in `documentation/manual_test_results.md`.

## 14. Lessons Learned

- RAG quality depends heavily on retrieval quality and the wording of the user query.
- Simple keyword retrieval is easier to explain and debug, but vector retrieval would improve relevance.
- AI prompts need explicit boundaries to reduce hallucination.
- Quota and API failures must be treated as normal engineering cases, not surprises.
- Frontend mock data should be replaced early so integration problems are discovered sooner.
- Documentation and prompt logs are useful but must be checked for secrets.

## 15. Future Improvements

- Add vector search and embeddings.
- Filter retrieval by selected active documents.
- Add document deletion.
- Build full corpus collection management.
- Add production authentication.
- Use exact Gemini token metadata if available.
- Improve rendering for flashcards, quizzes, and code-analysis reports.
- Add automated backend and frontend tests.
- Add document list and artifact list endpoints.
- Add downloadable/exportable generated artifacts.

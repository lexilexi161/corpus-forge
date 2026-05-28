# Corpus Forge TODO

This file reflects the current repo state before the capstone presentation.

## Completed

- [x] Set up the active Flask backend in `backend/app.py`.
- [x] Keep `backend/main.py` as an old FastAPI prototype, not the main app.
- [x] Set up the React/Vite frontend.
- [x] Create sidebar navigation and main app pages.
- [x] Create document upload UI.
- [x] Save uploaded files locally.
- [x] Store uploaded document metadata in SQLite.
- [x] Parse `.txt` and `.md` files.
- [x] Parse `.pdf` files with `pypdf`.
- [x] Parse source-code files such as `.py` and `.js`.
- [x] Split parsed text into chunks.
- [x] Store chunks in SQLite.
- [x] Implement simple keyword-based retrieval.
- [x] Return relevant chunks for chat and artifact generation.
- [x] Connect Gemini with `google-genai`.
- [x] Read Gemini keys from environment variables only.
- [x] Build grounded prompts from retrieved chunks.
- [x] Add RAG chat/Q&A.
- [x] Add flashcard generation.
- [x] Add quiz generation.
- [x] Add code analysis / code review / architecture-control-flow report generation.
- [x] Render valid flashcard JSON as question/answer cards.
- [x] Render valid quiz JSON as question cards with options and explanations.
- [x] Save generated flashcards, quizzes, and code reports in `backend/generated_artifacts/`.
- [x] Save generated artifact metadata in the `artifacts` table.
- [x] Add saved chat tables and `/chats` routes.
- [x] Show recent chat titles in the sidebar.
- [x] Make clicking a recent chat restore the selected conversation in the active chat panel.
- [x] Add estimated request/token usage tracking.
- [x] Add `GET /cost`.
- [x] Connect the frontend Cost page to backend usage data.
- [x] Add a frontend refresh button on the Cost page.
- [x] Make active document selection control backend retrieval.
- [x] Add `GET /documents` so uploaded documents persist visibly after frontend refresh.
- [x] Improve fallback display when generated flashcards/quizzes are not valid JSON.
- [x] Improve code-analysis report display beyond a raw preformatted block.
- [x] Fix hero quick-action navigation labels.
- [x] Add quota, missing-key, and no-context error handling.
- [x] Create `README.md`.
- [x] Create/update `REPORT.md`.
- [x] Keep `JOURNAL.md` and `prompts_history.md`.
- [x] Redact real API keys from logs when found.
- [x] Choose Engineering Challenge: Prompt Engineering / Reliability.

## In Progress / Polish

- [ ] Add more manual test screenshots/evidence for the presentation.
- [ ] Finalize presentation/demo script.
- [ ] Commit final documentation and demo-readiness changes.

## Future Improvements

- [ ] Add vector search / embeddings.
- [ ] Add document deletion.
- [ ] Add full corpus collection management.
- [ ] Add production authentication instead of localStorage-only profile behavior.
- [ ] Use exact Gemini token usage metadata if available.
- [ ] Add richer generated report export and formatting.
- [ ] Add automated tests for upload, parsing, retrieval, chat, artifacts, and cost.
- [ ] Add artifact listing/download/export.
- [ ] Add better source-code analysis options, such as selecting a specific uploaded file.
- [ ] Update saved chats instead of creating a new saved snapshot after each response.

# Corpus Forge

Corpus Forge is a capstone web application for turning uploaded documents into useful study and software-engineering artifacts. It uses a retrieval-augmented generation (RAG) flow: upload document -> save file -> parse text -> chunk text -> save chunks -> retrieve relevant chunks -> ask Gemini -> return chat answers or generated artifacts.

The active backend is the Flask app in `backend/app.py`. The file `backend/main.py` is an old FastAPI prototype and is not the normal app entry point.

## Features

- React frontend with sidebar navigation and document upload UI.
- Flask backend with SQLite persistence.
- Upload supported files: `.txt`, `.md`, `.pdf`, `.py`, `.js`.
- Parse uploaded files and split extracted text into chunks.
- Store document metadata and chunks in SQLite.
- Load saved documents back into the frontend sidebar.
- Filter chat and artifact retrieval by selected active documents.
- Retrieve relevant chunks with simple keyword matching.
- Chat/Q&A using Gemini and retrieved document context.
- Save chat conversations and show recent chats in the sidebar.
- Generate flashcards from uploaded document context.
- Generate quizzes from uploaded document context.
- Render flashcards and quizzes as readable cards when Gemini returns valid JSON.
- Generate formatted code analysis reports, including code review, architecture, and control-flow notes.
- Save generated artifacts in `backend/generated_artifacts/`.
- Store generated artifact metadata in the `artifacts` table.
- Track estimated AI usage with request count and approximate input/output tokens.
- Show usage totals through `GET /cost` and the frontend Cost page.
- Handle missing API keys, no-context retrieval, and Gemini quota/rate-limit errors with clear responses.

## Tech Stack

- Frontend: React, TypeScript, Vite
- Backend: Python, Flask, Flask-CORS
- Database: SQLite
- Document parsing: plain text/Markdown/source files plus PDF parsing with `pypdf`
- AI: Google Gemini through `google-genai`
- Retrieval: simple keyword-overlap scoring

## Folder Structure

```text
backend/
  app.py                  Active Flask app
  routes/                 Flask routes for upload, chat, artifacts, and cost
  rag/                    Parser, chunker, retriever, Gemini helper
  database/               SQLite database and schema.sql
  generated_artifacts/    Saved flashcards, quizzes, and code reports
  uploads/                Uploaded files

frontend/
  src/App.tsx             Main React interface
  src/api.ts              Frontend API helper for Flask endpoints

documentation/
  database_architecture.md
  manual_test_results.md

misc docs/
  TO-DO.md
```

## Backend Setup on Windows PowerShell

From the project root:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Set your Gemini key locally for the current terminal:

```powershell
$env:GEMINI_API_KEY = "your_api_key_here"
```

You may also use:

```powershell
$env:GOOGLE_API_KEY = "your_api_key_here"
```

Never commit a real API key. Do not paste real keys into source code, docs, `JOURNAL.md`, or `prompts_history.md`.

Run the active Flask backend:

```powershell
cd backend
python app.py
```

Expected backend URL:

```text
http://127.0.0.1:5000
```

Important: run `python app.py` from inside the `backend` folder because the SQLite helper uses the relative path `database/corpus-forge.db`.

## Frontend Setup

Open a second PowerShell terminal:

```powershell
cd "C:\Users\Canada\Documents\AI Documents\corpus-forge\frontend"
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

The frontend uses `VITE_API_BASE_URL` if provided, otherwise it calls:

```text
http://127.0.0.1:5000
```

## Main API Endpoints

- `POST /documents`
  - Uploads a document, saves it locally, parses text, chunks text, and stores document/chunk rows.

- `GET /documents`
  - Lists saved documents so the frontend sidebar can reload them after refresh.

- `POST /chat`
  - Accepts a user message, retrieves relevant chunks, and asks Gemini for a grounded answer.

- `POST /chats`
  - Saves a chat title and message list into SQLite.

- `GET /chats`
  - Lists saved chat conversations for the sidebar.

- `GET /chats/<chat_id>`
  - Returns saved messages for one chat so the frontend can restore the conversation.

- `POST /artifacts/flashcards`
  - Generates flashcards from retrieved document context.

- `POST /artifacts/quiz`
  - Generates quiz questions from retrieved document context.

- `POST /artifacts/code-analysis`
  - Generates a source-code analysis report with code review comments, possible bugs, architecture overview, control-flow explanation, and improvement suggestions.

- `GET /cost`
  - Returns estimated request and token usage:
    - `request_count`
    - `input_tokens`
    - `output_tokens`
    - `total_tokens`

## Demo Flow

1. Start the Flask backend from the `backend` folder.
2. Start the React frontend from the `frontend` folder.
3. Sign in or create a local frontend profile if prompted.
4. Upload a `.txt`, `.md`, `.pdf`, `.py`, or `.js` file from the sidebar.
5. Use the document checkboxes to choose active context.
6. Ask a question in Chat that matches the uploaded document.
7. Check that recent chat titles appear in the sidebar and can be reopened.
8. Generate flashcards from a topic in the document.
9. Generate a quiz from a topic in the document.
10. Upload `sample_code_demo.py` or another source file and run Code Analysis.
11. Open Cost to show estimated usage after AI requests and use Refresh after new AI calls.

For code analysis testing, use a topic that matches uploaded code identifiers, for example:

```text
calculate_total apply_discount print_invoice code review architecture control flow
```

## Manual Curl Examples

Upload a text file:

```powershell
"Corpus Forge uploads documents, chunks them, retrieves relevant text, and answers with Gemini." | Set-Content -Encoding UTF8 sample_rag_test.txt
curl.exe -X POST http://127.0.0.1:5000/documents -F "file=@sample_rag_test.txt"
```

Ask chat:

```powershell
$body = @{
  message = "What does Corpus Forge do?"
  audience_level = "beginner"
  tone = "simple"
  output_format = "paragraph"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:5000/chat" -Method Post -ContentType "application/json" -Body $body
```

Generate code analysis:

```powershell
$body = @{
  topic = "calculate_total apply_discount print_invoice code review architecture control flow"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:5000/artifacts/code-analysis" -Method Post -ContentType "application/json" -Body $body
```

Check cost:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:5000/cost" -Method Get
```

## Troubleshooting

- Missing Python package:

```powershell
pip install -r requirements.txt
```

- Gemini key missing:

```powershell
$env:GEMINI_API_KEY = "your_api_key_here"
```

- Gemini quota exceeded:
  - Wait for quota reset, use a valid key with available quota, or check the Google AI Studio quota page.
  - The app should return a clear quota/rate-limit message instead of crashing.

- Backend not reachable:
  - Make sure you ran:

```powershell
cd backend
python app.py
```

- Frontend not reachable:

```powershell
cd frontend
npm run dev
```

- Chat says documents do not contain enough information:
  - Upload a relevant file first.
  - Make sure the relevant document is checked in the sidebar.
  - Ask using terms that appear in the uploaded document.
  - For code analysis, include function or class names from the uploaded source file.

## Known Limitations

- Retrieval is simple keyword matching, not vector embeddings yet.
- Login/profile is mostly frontend/localStorage and is not production authentication.
- Gemini free quota can cause `429 TooManyRequests`; the app handles this with clear error responses.
- Flashcards and quizzes render as cards when the AI returns valid JSON, with a raw text fallback if parsing fails.
- Code-analysis output is formatted from plain text, but could still be improved with richer sections/export.
- Cost tracking uses estimated token counts, not exact Gemini billing metadata.
- Full corpus collection management and document deletion are future improvements.

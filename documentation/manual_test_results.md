# Manual Test Results

These tests are written for the final Corpus Forge demo. Some Gemini responses depend on having a valid key and available quota. If quota is exhausted, the expected result is a clear quota/rate-limit error rather than a backend crash.

## 1. Backend Startup

Command:

```powershell
cd "C:\Users\Canada\Documents\AI Documents\corpus-forge"
.venv\Scripts\Activate.ps1
$env:GEMINI_API_KEY = "your_api_key_here"
cd backend
python app.py
```

Expected:

- Flask starts successfully.
- Terminal shows the app running on `http://127.0.0.1:5000`.
- The active app is `backend/app.py`.
- `backend/main.py` is not used for the demo.

Result:

- Ready to test. Run this from the `backend` folder because the SQLite helper uses the relative database path `database/corpus-forge.db`.

## 2. Frontend Startup

Command:

```powershell
cd "C:\Users\Canada\Documents\AI Documents\corpus-forge\frontend"
npm install
npm run dev
```

Expected:

- Vite starts successfully.
- Frontend is available on the localhost URL printed by Vite, usually `http://localhost:5173`.
- Frontend calls the Flask backend at `http://127.0.0.1:5000` unless `VITE_API_BASE_URL` is set.

Result:

- Ready to test in browser.

## 3. Upload Test

Command example:

```powershell
cd "C:\Users\Canada\Documents\AI Documents\corpus-forge"
"Corpus Forge uploads documents, chunks them, retrieves relevant text, and answers with Gemini." | Set-Content -Encoding UTF8 sample_rag_test.txt
curl.exe -X POST http://127.0.0.1:5000/documents -F "file=@sample_rag_test.txt"
```

Expected:

- Response includes `status: "ok"`.
- Response includes `filename`.
- Response includes `chunk_count` greater than `0`.
- Response includes `extracted_text_length`.
- File is saved under `backend/uploads/`.
- Document metadata and chunks are saved in SQLite.

Honest note:

- Empty files or unsupported file types should return a clear error.

## 4. Chat Test

Command:

```powershell
$body = @{
  message = "What does Corpus Forge do?"
  audience_level = "beginner"
  tone = "simple"
  output_format = "paragraph"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://127.0.0.1:5000/chat" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Expected:

- Response includes `retrieved_chunks`.
- Response includes `chunk_count`.
- If Gemini quota is available, response includes a grounded `answer`.
- If no context is found, response clearly says the uploaded documents do not contain enough information.
- If quota is exceeded, response clearly reports a Gemini quota/rate-limit issue instead of crashing.

## 5. Flashcards Test

Command:

```powershell
$body = @{
  topic = "Corpus Forge"
  count = 3
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://127.0.0.1:5000/artifacts/flashcards" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Expected:

- Response includes `status`.
- Response includes `artifact_type: "flashcards"`.
- Response includes `content`.
- Response includes `retrieved_chunks` and `chunk_count`.
- If generation succeeds, a file is saved in `backend/generated_artifacts/`.
- If generation succeeds, metadata is inserted into the `artifacts` table.

Honest note:

- The UI may display raw JSON/text output. This is functional but needs polish.

## 6. Quiz Test

Command:

```powershell
$body = @{
  topic = "Corpus Forge"
  count = 3
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://127.0.0.1:5000/artifacts/quiz" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Expected:

- Response includes `status`.
- Response includes `artifact_type: "quiz"`.
- Response includes `content`.
- Response includes `retrieved_chunks` and `chunk_count`.
- If generation succeeds, a file is saved in `backend/generated_artifacts/`.
- If generation succeeds, metadata is inserted into the `artifacts` table.

Honest note:

- The UI may display raw JSON/text output. This is functional but needs polish.

## 7. Code Analysis Test

Upload the sample Python file:

```powershell
cd "C:\Users\Canada\Documents\AI Documents\corpus-forge"
curl.exe -X POST http://127.0.0.1:5000/documents -F "file=@sample_code_demo.py"
```

Generate code analysis:

```powershell
$body = @{
  topic = "calculate_total apply_discount print_invoice code review architecture control flow"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://127.0.0.1:5000/artifacts/code-analysis" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Expected:

- Response includes `artifact_type: "code_analysis"`.
- Response includes a practical report with code review comments, possible bugs, architecture overview, control-flow explanation, and improvement suggestions.
- Response includes `retrieved_chunks` and `chunk_count`.
- If generation succeeds, report content is saved in `backend/generated_artifacts/`.
- If generation succeeds, metadata is inserted into the `artifacts` table.

Honest note:

- Because retrieval is keyword-based, the topic should include names that appear in the uploaded code, such as function names.

## 8. Cost Test

Command:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:5000/cost" -Method Get
```

Expected:

- Response includes:
  - `request_count`
  - `input_tokens`
  - `output_tokens`
  - `total_tokens`
- After successful or attempted AI calls with retrieved context, values should increase.

Honest note:

- Token values are estimated with a simple character-count approximation, not exact Gemini billing metadata.
- If no AI calls have been made since cost tracking was added, values may still be zero.

## 9. Security Check

Command:

```powershell
cd "C:\Users\Canada\Documents\AI Documents\corpus-forge"
rg "AIza|GEMINI_API_KEY=|GOOGLE_API_KEY="
```

Expected:

- No real API keys are committed.
- Documentation may mention placeholder text such as `GEMINI_API_KEY = "your_api_key_here"`, but should not contain a real key.

## 10. Conflict Check

Command:

```powershell
cd "C:\Users\Canada\Documents\AI Documents\corpus-forge"
rg "<<<<<<<|=======|>>>>>>>"
```

Expected:

- No unresolved merge conflict markers.

## Demo Readiness Notes

- Use the browser for the main demo: upload, chat, flashcards, quiz, code analysis, and cost.
- Keep curl commands ready as backup if the browser state gets confusing.
- If Gemini quota fails during the live demo, show the clear error behavior and explain that reliability handling was part of the engineering challenge.
- Do not show or paste a real API key during the presentation.

# Capstone Project: Corpus Forge

## Local Setup

1. Create and activate a virtual environment on Windows:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

2. Install the backend requirements:

```powershell
pip install -r requirements.txt
```

3. Set your Gemini API key for the current PowerShell terminal:

```powershell
$env:GEMINI_API_KEY = "your-gemini-api-key"
```

Do not commit real API keys. Keep them in your local environment.

4. Run the Flask backend:

```powershell
cd backend
python app.py
```

The active backend is the Flask app in `backend/app.py`.
`backend/main.py` is an old FastAPI prototype and is not the normal app entry point.

5. Run the frontend if needed:

```powershell
cd frontend
npm install
npm run dev
```

6. Open the backend at:

http://127.0.0.1:5000

## Manual RAG Test

With the Flask backend running, upload a small text file:

```powershell
"Corpus Forge uploads documents, chunks them, retrieves relevant text, and answers with Gemini." | Set-Content -Encoding UTF8 sample_rag_test.txt
curl.exe -X POST http://127.0.0.1:5000/documents -F "file=@sample_rag_test.txt"
```

Ask a question:

```powershell
$body = @{
  message = "What does Corpus Forge do?"
  audience_level = "beginner"
  tone = "simple"
  output_format = "paragraph"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:5000/chat" -Method Post -ContentType "application/json" -Body $body
```

The chat response should include `answer`, `retrieved_chunks`, `chunk_count`, and `source: "gemini"`.



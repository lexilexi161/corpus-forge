# Corpus Forge

Capstone Project — Generative AI for Software Engineering — EPITA 2026



---

## What it does

An AI-powered web platform that ingests heterogeneous document collections (PDF, Markdown, source code) and transforms them into actionable knowledge via RAG-powered chat, flashcard generation, quiz generation, and code review reports.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + TypeScript + Vite |
| Backend | Python + FastAPI |
| Vector DB | ChromaDB (local persistent) |
| LLM | OpenAI GPT-4o-mini |
| Storage | JSON + local filesystem |

---

## Setup (local dev)

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and add your OpenAI API key:

```bash
cp ../.env.example ../.env
export OPENAI_API_KEY=sk-...
```

Run:

```bash
uvicorn main:app --reload
```

API available at `http://localhost:8000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`

### 3. Docker (full stack)

```bash
cp .env.example .env  # add your key
docker-compose up --build
```

---

## Features

- Upload PDF, Markdown, and source code files
- Manage and select active documents for AI interaction
- Chat with your corpus (RAG-powered Q&A)
- Generate flashcards, quizzes, and code review reports
- Prompt steering: audience level, tone, creativity, custom instructions
- Cost & token usage dashboard
- All data persists across sessions

---

## Project Structure

```
corpus-forge/
├── backend/           # FastAPI app
│   ├── api/           # route handlers
│   ├── services/      # ingestion, retrieval, generation, storage
│   └── main.py
├── frontend/          # React app
│   └── src/
│       ├── pages/
│       └── api.ts
├── data/              # persisted documents, vectors, usage stats
├── docker-compose.yml
└── README.md
```

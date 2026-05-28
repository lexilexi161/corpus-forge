# Database Architecture

This document mirrors the current SQL schema defined in `backend/database/schema.sql`.

The active application uses SQLite through `backend/models/db.py`. The Flask backend should be started from the `backend` folder so the relative database path `database/corpus-forge.db` resolves correctly.

## Actively Used Tables

### `documents`

Stores uploaded document metadata.

- `document_id` - integer primary key
- `document_name` - uploaded file name
- `size` - file size in bytes
- `uploaded_at` - upload timestamp
- `document_type` - file extension/type
- `file_path` - local saved path

### `chunks`

Stores parsed and chunked text from uploaded documents.

- `file_id` - foreign key to `documents(document_id)`
- `id` - integer primary key
- `embedding` - text field currently left empty because retrieval is keyword-based
- `chunk_order` - order of the chunk inside the document
- `chunk_text` - extracted text for retrieval and prompts

### `artifacts`

Stores metadata for generated outputs such as flashcards, quizzes, and code-analysis reports.

- `artifact_id` - integer primary key
- `artifact_name` - saved artifact file name
- `artifact_date` - generation timestamp
- `artifact_size` - saved artifact file size
- `artifact_type` - `flashcards`, `quiz`, or `code_analysis`
- `artifact_path` - local path under `backend/generated_artifacts/`
- `artifact_prompt` - topic/prompt used to generate the artifact
- `corpus_id` - optional foreign key, currently usually null
- `document_id` - optional foreign key, currently usually null

### `cost`

Stores estimated AI usage.

- `request_id` - integer primary key
- `user_id` - optional foreign key to `user(user_id)`
- `request_type` - route or feature name, such as `chat` or `artifacts_quiz`
- `input_tokens` - estimated input tokens
- `output_tokens` - estimated output tokens
- `created_at` - timestamp

Usage tracking is estimated using a character-count approximation. It does not currently use exact Gemini billing metadata.

### `chats`

Stores saved chat conversation titles for the recent chats sidebar.

- `chat_id` - integer primary key
- `title` - saved chat title
- `created_at` - timestamp

### `chat_messages`

Stores saved messages for each chat conversation.

- `message_id` - integer primary key
- `chat_id` - foreign key to `chats(chat_id)`
- `role` - message role, such as `user` or `ai`
- `content` - message text
- `created_at` - timestamp

## Planned / Partially Used Tables

### `corpus`

Intended to represent named document collections.

- `corpus_id`
- `corpus_name`
- `upload_date`
- `corpus_desc`

### `corpus_documents`

Join table intended to connect documents to corpora.

- `document_id`
- `corpus_id`

### `user`

Planned user table.

- `user_id`
- `username`
- `user_password`
- `date_created`

### `session`

Planned session table.

- `session_id`
- `user_id`
- `session_token`
- `started_at`
- `ended_at`

The current frontend profile/login behavior is mostly localStorage-based and is not production authentication.

## Current Persistence Flow

1. User uploads a file through `POST /documents`.
2. Backend saves the file in `backend/uploads/`.
3. Backend parses the file and splits text into chunks.
4. Backend inserts one row into `documents`.
5. Backend inserts chunk rows into `chunks`.
6. The frontend reloads saved documents through `GET /documents`.
7. Chat and artifact routes retrieve from `chunks`, filtered by selected document IDs when provided.
8. Generated artifacts are saved in `backend/generated_artifacts/`.
9. Artifact metadata is inserted into `artifacts`.
10. Estimated usage is inserted into `cost` for AI-related requests with retrieved context.
11. Frontend chat conversations can be saved through `/chats`, which inserts rows into `chats` and `chat_messages`.

## Known Database Limitations

- Retrieval is keyword-based, so `chunks.embedding` is not populated yet.
- Corpus collection management is not fully implemented.
- Document deletion is not implemented yet.
- Exact Gemini token metadata is not stored yet.
- Saved chat persistence currently stores snapshots; a future version could update one ongoing conversation instead.

---

The older duplicate file in `misc docs/database_architecture.md` is retained as historical documentation. This file in `documentation/` is the current database architecture reference.

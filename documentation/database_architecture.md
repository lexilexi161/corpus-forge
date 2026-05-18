# Database Architecture

This document mirrors the current SQL schema defined in `backend/database/schema.sql`.

## Tables

- `documents`
  - `document_id` — int, PRIMARY KEY, AUTO_INCREMENT
  - `document_name` — varchar(255), NOT NULL
  - `size` — int, NOT NULL
  - `uploaded_at` — datetime, NOT NULL
  - `document_type` — varchar(255), NOT NULL
  - `file_path` — varchar(255), NOT NULL

- `chunks`
  - `file_id` — int, FOREIGN KEY → `documents(document_id)`
  - `id` — int, PRIMARY KEY, AUTO_INCREMENT
  - `embedding` — text, NOT NULL
  - `chunk_order` — int, NOT NULL
  - `chunk_text` — text, NOT NULL

- `corpus`
  - `corpus_id` — int, PRIMARY KEY, AUTO_INCREMENT
  - `corpus_name` — varchar(255), NOT NULL
  - `upload_date` — datetime, NOT NULL
  - `corpus_desc` — text

- `corpus_documents` (join table)
  - `document_id` — int, FOREIGN KEY → `documents(document_id)`
  - `corpus_id` — int, FOREIGN KEY → `corpus(corpus_id)`
  - PRIMARY KEY(`document_id`, `corpus_id`)

- `artifacts`
  - `artifact_id` — int, PRIMARY KEY, AUTO_INCREMENT
  - `artifact_name` — varchar(255), NOT NULL
  - `artifact_date` — datetime, NOT NULL
  - `artifact_size` — int, NOT NULL
  - `artifact_type` — varchar(255), NOT NULL
  - `artifact_path` — varchar(255), NOT NULL
  - `artifact_prompt` — text
  - `corpus_id` — int, FOREIGN KEY → `corpus(corpus_id)`
  - `document_id` — int, FOREIGN KEY → `documents(document_id)`

- `user`
  - `user_id` — int, PRIMARY KEY, AUTO_INCREMENT
  - `username` — varchar(255), NOT NULL
  - `user_password` — varchar(255), NOT NULL
  - `date_created` — datetime, NOT NULL

- `session`
  - `session_id` — int, PRIMARY KEY, AUTO_INCREMENT
  - `user_id` — int, FOREIGN KEY → `user(user_id)`
  - `session_token` — varchar(255), NOT NULL
  - `started_at` — datetime, NOT NULL
  - `ended_at` — datetime

- `cost`
  - `request_id` — int, PRIMARY KEY, AUTO_INCREMENT
  - `user_id` — int, FOREIGN KEY → `user(user_id)`
  - `request_type` — varchar(255), NOT NULL
  - `input_tokens` — int
  - `output_tokens` — int
  - `created_at` — datetime, NOT NULL

## Notes
- `documents` stores uploaded files and metadata.
- `chunks` stores document text splits and embeddings linked by `file_id` to `documents.document_id`.
- `corpus` groups documents; `corpus_documents` maps many-to-many relationships between `corpus` and `documents`.
- `artifacts` stores generated or derived files, optionally associated to a `corpus` and/or `document`.
- `user`, `session`, and `cost` tables track users, session tokens, and request cost accounting respectively.

---

Moved from `misc docs/database_architecture.md` to `documentation/database_architecture.md` on 2026-05-18.

If you want additional fields (e.g., checksums, content hashes, or ingestion status), I can add them and update the schema accordingly.



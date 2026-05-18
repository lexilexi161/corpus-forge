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



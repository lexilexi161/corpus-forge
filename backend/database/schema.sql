CREATE TABLE documents (
document_id INTEGER PRIMARY KEY AUTOINCREMENT,
document_name VARCHAR(255) NOT NULL,
size INTEGER NOT NULL,
uploaded_at DATETIME NOT NULL,
document_type VARCHAR(255) NOT NULL,
file_path VARCHAR(255) NOT NULL
);
CREATE TABLE chunks (
file_id INTEGER,
id INTEGER PRIMARY KEY AUTOINCREMENT, 
embedding TEXT NOT NULL,
chunk_order INTEGER NOT NULL,
chunk_text TEXT NOT NULL,
FOREIGN KEY (file_id) REFERENCES documents(document_id)
);
CREATE TABLE corpus(
corpus_id INTEGER PRIMARY KEY AUTOINCREMENT,
corpus_name VARCHAR(255) NOT NULL,
upload_date DATETIME NOT NULL,
corpus_desc TEXT
);
CREATE TABLE corpus_documents(
document_id INTEGER,
corpus_id INTEGER,
PRIMARY KEY(document_id, corpus_id),
FOREIGN KEY(document_id) REFERENCES documents(document_id),
FOREIGN KEY(corpus_id) REFERENCES corpus(corpus_id)
);
CREATE TABLE artifacts(
artifact_id INTEGER PRIMARY KEY AUTOINCREMENT,
artifact_name VARCHAR(255) NOT NULL,
artifact_date DATETIME NOT NULL,
artifact_size INTEGER NOT NULL,
artifact_type VARCHAR(255) NOT NULL,
artifact_path VARCHAR(255) NOT NULL,
artifact_prompt TEXT,
corpus_id INTEGER,
document_id INTEGER,
FOREIGN KEY(corpus_id) REFERENCES corpus(corpus_id),
FOREIGN KEY(document_id) REFERENCES documents(document_id)
);
CREATE TABLE user(
user_id INTEGER PRIMARY KEY AUTOINCREMENT,
username VARCHAR(255) NOT NULL,
user_password VARCHAR(255) NOT NULL,
date_created DATETIME NOT NULL
);
CREATE TABLE session(
session_id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER,
session_token VARCHAR(255) NOT NULL,
started_at DATETIME NOT NULL,
ended_at DATETIME,
FOREIGN KEY(user_id) REFERENCES user(user_id)
);
CREATE TABLE cost(
request_id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER,
request_type VARCHAR(255) NOT NULL,
input_tokens INTEGER,
output_tokens INTEGER,
created_at DATETIME NOT NULL,
FOREIGN KEY(user_id) REFERENCES user(user_id)
);

CREATE TABLE chats (
    chat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL
);
 
CREATE TABLE chat_messages (
    message_id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    role VARCHAR(10) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY(chat_id) REFERENCES chats(chat_id)
);
 
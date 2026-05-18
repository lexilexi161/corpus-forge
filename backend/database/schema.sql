CREATE TABLE documents (
document_id int PRIMARY KEY AUTO_INCREMENT,
document_name varchar(255) NOT NULL,
size int NOT NULL,
uploaded_at datetime NOT NULL,
document_type varchar(255) NOT NULL,
file_path varchar(255) NOT NULL
);
CREATE TABLE chunks (
file_id int,
id int PRIMARY KEY AUTO_INCREMENT, 
embedding text NOT NULL,
chunk_order int NOT NULL,
chunk_text text NOT NULL,
FOREIGN KEY (file_id) REFERENCES documents(document_id)
);
CREATE TABLE  corpus(
corpus_id int PRIMARY KEY AUTO_INCREMENT,
corpus_name varchar(255) NOT NULL,
upload_date datetime NOT NULL,
corpus_desc text
);
CREATE TABLE corpus_documents(
document_id int,
corpus_id   int,
PRIMARY KEY(document_id, corpus_id),
FOREIGN KEY(document_id) REFERENCES documents(document_id),
FOREIGN KEY(corpus_id) REFERENCES corpus(corpus_id)
);






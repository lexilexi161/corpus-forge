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
CREATE TABLE artifacts(
artifact_id int PRIMARY KEY AUTO_INCREMENT,
artifact_name varchar(255) NOT NULL,
artifact_date datetime NOT NULL,
artifact_size int NOT NULL,
artifact_type varchar(255) NOT NULL,
artifact_path varchar(255) NOT NULL,
artifact_prompt text,
corpus_id int,
document_id int, 
FOREIGN KEY(corpus_id) REFERENCES corpus(corpus_id),
FOREIGN KEY(document_id) REFERENCES documents(document_id)
);
CREATE TABLE user(
user_id int PRIMARY KEY AUTO_INCREMENT,
username varchar(255) NOT NULL,
user_password varchar(255) NOT NULL,
date_created datetime NOT NULL
);
CREATE TABLE session(
session_id INT PRIMARY KEY AUTO_INCREMENT,
user_id INT,
session_token varchar(255) NOT NULL,
started_at datetime NOT NULL,
ended_at datetime ,
FOREIGN KEY(user_id) REFERENCES user(user_id)
);
CREATE TABLE cost(
request_id int PRIMARY KEY AUTO_INCREMENT,
user_id int, 
request_type varchar(255) NOT NULL,
input_tokens int(255),
output_tokens int(255),
created_at datetime NOT NULL,
FOREIGN KEY(user_id) REFERENCEs user(user_id)
);





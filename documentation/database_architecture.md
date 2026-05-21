DATABASE  ARCHITECTURE MARKDOWN
TABLES
DOCUMENTS 
    collumns        type                      
        documents_file_id     integer|primary key
        documents_name        varchar(255)|not null
        documents_size        integer|bytes|not null
        documents_date        datetime|not null
        documents_format      varchar(255)|not null
        documents_file_path   varchar(255)|not null
        chch
CHUNKS
    collums
        documents_file_id     integer|foreign key
                              -(refrences docouments)
        chunk_id              integer|primary key
        chunk_embedding       text| not null
        chunk_order           integer|not null
        chunk_text            text|not null
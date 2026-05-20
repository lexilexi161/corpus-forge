import os 
import datetime
from models.db import get_connection
from flask import Blueprint, jsonify, request
from config import UPLOAD_FOLDER
documents_bp = Blueprint('documents',__name__)
@documents_bp.route('/documents', methods = ['POST'])
def add_file():
    file = request.files['file']
    filename = file.filename
    file.save(f'{UPLOAD_FOLDER}/{filename}')
    size = os.path.getsize(f'{UPLOAD_FOLDER}/{filename}')
    _, document_type = os.path.splitext(filename)
    uploaded_at = datetime.datetime.now()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO documents(document_name, size, uploaded_at, document_type, file_path) " \
    "VALUES(?, ?, ?, ?, ? )", (filename, size , uploaded_at, document_type, f'{UPLOAD_FOLDER}/{filename}' ) )
    conn.commit()
    uploaded_at_string = uploaded_at.isoformat()
    return jsonify({'status': 'ok', 'filename': filename, 'size': size,'uploaded_at': uploaded_at_string,'document_Type': document_type, 'filepath':f'{UPLOAD_FOLDER}/{filename}'  })

import os 
import datetime
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
    uploaded_at = datetime.datime.now()
    return jsonify({'status': 'ok', 'filename': filename})

    
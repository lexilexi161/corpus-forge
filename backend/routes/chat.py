from flask import Blueprint , jsonify , request
chat_bp = Blueprint('chat', __name__)
@chat_bp.route('/chat', methods = ['POST'])
def send_message():
    data = request.get_json()
    message = data['message']
    return jsonify({'message': message})
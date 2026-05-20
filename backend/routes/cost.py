from flask import Blueprint, jsonify
cost_bp = Blueprint('cost',__name__)
@cost_bp.route('/cost', methods = ['GET'])
def get_cost():
    return jsonify({'total_requests' : 0,
        'prompt_tokens' : 0,
        'completion_tokens' : 0,
        'estimated_cost' : 0.0 })
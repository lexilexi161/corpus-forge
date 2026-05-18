from flask import Flask
from flask_cors import CORS
from routes.documents import documents_bp
from routes.chat import chat_bp
from routes.cost import cost_bp
app = Flask(__name__)
CORS(app)
app.register_blueprint(documents_bp)
if __name__ == '__main__':
    app.run(debug = True, port = 5000)

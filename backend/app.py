from flask import Flask
from flask_cors import CORS
from routes.documents import documents_bp
from routes.chat import chat_bp
from routes.cost import cost_bp
from routes.artifacts import artifacts_bp
from routes.chats import chats_bp

app = Flask(__name__)
CORS(app)
app.register_blueprint(documents_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(cost_bp)
app.register_blueprint(artifacts_bp)
app.register_blueprint(chats_bp)

if __name__ == "__main__":
    app.run(debug=True, port=8001)
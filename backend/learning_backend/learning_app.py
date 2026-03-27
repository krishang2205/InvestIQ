from flask import Flask, jsonify
from flask_cors import CORS
from routes.learning_routes import learning_bp

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False

CORS(app)

app.register_blueprint(learning_bp)

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Learning backend is running successfully",
        "status": "ok"
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)
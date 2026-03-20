from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import Config
from backend.routes.report_routes import report_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config())

    CORS(app, resources={r"/*": {"origins": "*"}})

    app.register_blueprint(report_bp, url_prefix="/api")

    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "service": "InvestIQ Backend"}), 200

    return app

app = create_app()

if __name__ == "__main__":
    cfg = Config()
    app.run(host="0.0.0.0", port=cfg.PORT, debug=cfg.DEBUG)
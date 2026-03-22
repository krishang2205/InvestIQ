from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

from .extensions import cache
from .routes.stock_routes import stock_bp

load_dotenv()


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config["CACHE_TYPE"] = "SimpleCache"
    app.config["CACHE_DEFAULT_TIMEOUT"] = 300

    cache.init_app(app)

    app.register_blueprint(stock_bp, url_prefix="/api/stocks")

    @app.route("/", methods=["GET"])
    def home():
        return jsonify({
            "success": True,
            "message": "InvestIQ stock backend is running"
        })

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({
            "success": False,
            "error": "Route not found"
        }), 404

    @app.errorhandler(500)
    def internal_error(_):
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
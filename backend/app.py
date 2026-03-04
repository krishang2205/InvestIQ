from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load .env variables locally
load_dotenv()

app = Flask(__name__)
# Enable CORS for the React frontend
CORS(app)

# Import the simple clean routes
from routes.market_routes import market_bp, cache
from reports.api import reports_v2_bp

# Initialize the simple cache
cache.init_app(app, config={'CACHE_TYPE': 'SimpleCache'})

# Register the endpoints
app.register_blueprint(market_bp)
app.register_blueprint(reports_v2_bp)

@app.route('/')
def home():
    return jsonify({"message": "InvestIQ Backend is active!"})

# Catch-all simple error handler
@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Running natively on port 5001
    app.run(host="0.0.0.0", port=5001, debug=True)

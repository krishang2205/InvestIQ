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
from routes.portfolio_routes import portfolio_bp
from reports.api import reports_v2_bp

# Initialize the simple cache
cache.init_app(app, config={'CACHE_TYPE': 'SimpleCache'})

# Register the endpoints
app.register_blueprint(market_bp)
app.register_blueprint(portfolio_bp)
app.register_blueprint(reports_v2_bp)

@app.route('/')
def home():
    return jsonify({"message": "InvestIQ Backend is active!"})

@app.route('/api/v2/debug/providers')
def debug_providers():
    from reports.dependencies import report_di, MOCK_REPORTS_DB
    llm = report_di.get_llm_manager()
    
    # Get latest 3 reports
    recent_reports = []
    for job_id, record in list(MOCK_REPORTS_DB.items())[-3:]:
        recent_reports.append({
            "job_id": job_id,
            "symbol": record.get("symbol"),
            "status": record.get("status"),
            "has_real_data": "Mock" not in str(record.get("report_data", {}).get("header", {}).get("company", ""))
        })
        
    return jsonify({
        "providers_ready": llm.providers_ready,
        "gemini_key_set": bool(llm.gemini_key),
        "recent_reports": recent_reports,
        "db_size": len(MOCK_REPORTS_DB)
    })

# Catch-all simple error handler
@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Running natively on port 5001
    app.run(host="0.0.0.0", port=5001, debug=True)

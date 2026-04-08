from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load backend/.env explicitly to avoid ambiguity in monorepo setup.
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(_BACKEND_DIR, ".env"), override=True)

# --- AUTOMATIC MIGRATION: Update TATAMOTORS to TMPV in SQLite ---
try:
    import sqlite3
    db_path = os.path.join(os.path.dirname(__file__), 'data', 'investiq.sqlite3')
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        
        # Check if transactions table exists before updating
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='transactions'")
        if cur.fetchone():
            cur.execute("UPDATE transactions SET symbol = 'TMPV' WHERE symbol = 'TATAMOTORS'")
            conn.commit()
            print("AUTOMATIC MIGRATION COMPLETE: Updated TATAMOTORS to TMPV in SQLite transactions table.")
        
        conn.close()
except Exception as e:
    print("AUTOMATIC MIGRATION ERROR:", str(e))
# -----------------------------------------------------

app = Flask(__name__)
# Enable CORS for the React frontend
CORS(app)

# Import the simple clean routes
from routes.market_routes import market_bp, cache
from routes.portfolio_routes import portfolio_bp
from reports.api import reports_v2_bp
from routes.learning_routes import learning_bp

# Initialize the simple cache
cache.init_app(app, config={'CACHE_TYPE': 'SimpleCache'})

# Register the endpoints
app.register_blueprint(market_bp)
app.register_blueprint(portfolio_bp)
app.register_blueprint(reports_v2_bp)
app.register_blueprint(learning_bp)

@app.route('/')
def home():
    return jsonify({"message": "InvestIQ Backend is active!"})

@app.route('/api/v2/debug/providers')
def debug_providers():
    from reports.dependencies import report_di, MOCK_REPORTS_DB
    llm = report_di.get_llm_manager()
    def _mask_prefix(value: str):
        if not value:
            return None
        return f"{value[:8]}...({len(value)} chars)"
    
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
        "gemini_key_prefix": _mask_prefix(llm.gemini_key),
        "groq_key_prefix": _mask_prefix(llm.groq_key),
        "xai_key_prefix": _mask_prefix(llm.xai_key),
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

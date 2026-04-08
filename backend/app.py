from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
import mimetypes

# Crucial for Windows: ensure .js files are served with the correct MIME type
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

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

# Initialize Flask with frontend dist folder
app = Flask(__name__, 
            static_folder=os.path.join(os.path.dirname(_BACKEND_DIR), 'frontend', 'dist'),
            static_url_path='/')

# Enable CORS: restrictive in production, open in dev
if os.environ.get("FLASK_ENV") == "production":
    # Replace with your actual production domain when known
    CORS(app, resources={r"/api/*": {"origins": "*"}}) 
else:
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

# Serving the Frontend SPA
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path.startswith("api/") or path.startswith("v2/"):
        # This fallback is only hit if no blueprint matched the route
        return jsonify({"error": "Not Found"}), 404
        
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # For SPA routing: return index.html for any unknown route
        if os.path.exists(os.path.join(app.static_folder, 'index.html')):
            return send_from_directory(app.static_folder, 'index.html')
        return jsonify({"message": "InvestIQ Backend is active (Frontend build missing)"})

@app.route('/api/v2/debug/providers')
def debug_providers():
    if os.environ.get("FLASK_ENV") == "production":
        return jsonify({"error": "Debug endpoint disabled in production"}), 403
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
    port = int(os.environ.get("PORT", 5001))
    debug_mode = os.environ.get("FLASK_ENV") != "production"
    app.run(host="0.0.0.0", port=port, debug=debug_mode)

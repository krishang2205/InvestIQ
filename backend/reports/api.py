import logging
from flask import Blueprint, request, jsonify
from reports.orchestrator import ReportGenerationOrchestrator
from reports.dependencies import report_di
from schemas.report_schemas import validate_json_payload
from middleware.auth import require_auth
from utils.rate_limit import rate_limit

logger = logging.getLogger(__name__)

reports_v2_bp = Blueprint('reports_v2', __name__, url_prefix='/api/v2/reports')

@reports_v2_bp.route('/generate', methods=['POST'])
def generate_report_v2():
    """
    Initiates an asynchronous multi-agent financial report.
    Validates payloads strictly using Pydantic-like schemas.
    """
    payload = request.get_json()
    if not payload:
        return jsonify({"error": "Missing JSON payload"}), 400
        
    is_valid, errors = validate_json_payload(payload)
    if not is_valid:
        logger.warning(f"Rejecting invalid payload: {errors}")
        return jsonify({"error": "Validation failed", "details": errors}), 422
        
    symbol = payload.get("symbol").upper()
    prefs = payload.get("preferences", {})
    user_id = getattr(request, 'current_user', None)
    u_id_str = user_id.id if hasattr(user_id, 'id') else payload.get("user_id", "anonymous")

    try:
        job_id = ReportGenerationOrchestrator.initiate_report(
            symbol=symbol, 
            user_id=u_id_str, 
            prefs=prefs
        )
        return jsonify({
            "status": "accepted",
            "job_id": job_id,
            "message": "Report generation delegated to background worker."
        }), 202
    except Exception as e:
        logger.error(f"Failed to submit generation job: {e}")
        return jsonify({"error": str(e)}), 500

@reports_v2_bp.route('/history', methods=['GET'])
def get_report_history():
    db = report_di.get_db_client()
    try:
        res = db.table("reports").select("*").order("created_at", desc=True).limit(10).execute()
        return jsonify({"status": "success", "data": res.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reports_v2_bp.route('/status/<job_id>', methods=['GET'])
def get_job_status_v2(job_id):
    db = report_di.get_db_client()
    try:
        res = db.table("reports").select("status, report_data, error").eq("id", job_id).execute()
        if not res.data:
            return jsonify({"error": "Job ID not found"}), 404
            
        record = res.data[0]
        return jsonify({
            "job_id": job_id,
            "status": record["status"],
            "report_data": record.get("report_data"),
            "error": record.get("error")
        }), 200
    except Exception as e:
        logger.error(f"Error checking status for {job_id}: {e}")
        return jsonify({"error": "Database retrieval exception"}), 500

def _find_report(job_id):
    """Look up a report from MOCK_REPORTS_DB (fallback) or real Supabase DB."""
    from reports.dependencies import MOCK_REPORTS_DB
    
    # Check in-memory first (works when using MockDbClient)
    report = MOCK_REPORTS_DB.get(job_id)
    if report and report.get("status") == "completed":
        return report
    
    # Check real database
    try:
        db = report_di.get_db_client()
        res = db.table("reports").select("*").eq("id", job_id).execute()
        if res.data and len(res.data) > 0:
            record = res.data[0]
            # Also cache in memory for subsequent chat messages in the same session
            MOCK_REPORTS_DB[job_id] = record
            return record
    except Exception:
        pass
    
    return None

@reports_v2_bp.route('/chat', methods=['POST'])
def chat_with_report():
    payload = request.get_json()
    job_id = payload.get("job_id")
    message = payload.get("message")
    history = payload.get("history", [])

    if not job_id or not message:
        return jsonify({"error": "Missing job_id or message"}), 400

    from services.chat_service import ChatService
    
    report = _find_report(job_id)
    if not report or report.get("status") != "completed":
        return jsonify({"error": "Report not found or not ready"}), 404

    try:
        chat_service = ChatService(report_di.get_llm_manager())
        response = chat_service.process_chat(message, history, report.get("report_data"))
        return jsonify({"response": response}), 200
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return jsonify({"error": str(e)}), 500

@reports_v2_bp.route('/simulate', methods=['POST'])
def simulate_catalyst():
    payload = request.get_json()
    job_id = payload.get("job_id")
    catalyst = payload.get("catalyst")

    if not job_id or not catalyst:
        return jsonify({"error": "Missing job_id or catalyst"}), 400

    from services.chat_service import ChatService
    
    report = _find_report(job_id)
    if not report or report.get("status") != "completed":
        return jsonify({"error": "Report not found or not ready"}), 404

    try:
        chat_service = ChatService(report_di.get_llm_manager())
        result = chat_service.simulate_catalyst(catalyst, report.get("report_data"))
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Simulation error: {e}")
        return jsonify({"error": str(e)}), 500


from flask import Blueprint, request, jsonify
from services.report_service import ReportService
import logging

logger = logging.getLogger(__name__)

report_bp = Blueprint('report_bp', __name__)
report_service = ReportService()

@report_bp.route('/api/report/generate', methods=['POST'])
def handle_generate_report():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400

    symbol = data.get("symbol")
    preferences = data.get("preferences", {"standard": True})

    if not symbol or not isinstance(symbol, str):
        return jsonify({"error": "Symbol is required and must be string"}), 400

    if not report_service.health_check():
        return jsonify({"error": "AI Service unavailable"}), 503
    
    # Submit job and return job ID immediately
    job_id = report_service.submit_report_job(symbol, preferences)

    return jsonify({
        "status": "success",
        "message": "Report generation initiated.",
        "job_id": job_id
    }), 202

@report_bp.route('/api/report/status/<job_id>', methods=['GET'])
def get_report_status(job_id):
    job = report_service.get_job_status(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
        
    return jsonify({
        "job_id": job_id,
        "status": job["status"],
        "symbol": job["symbol"],
        "error": job.get("error"),
        "report_data": job.get("report_data")
    }), 200


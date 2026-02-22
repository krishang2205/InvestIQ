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
    
    result = report_service.generate_report(symbol, preferences)

    if result.get("error"):
        return jsonify({"error": result.get("message")}), 500

    return jsonify({
        "status": "success",
        "data": result.get("report_data")
    }), 200

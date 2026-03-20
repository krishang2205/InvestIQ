from flask import Blueprint, request, jsonify
from backend.services.analysis_service import build_intelligence_report
from backend.services.peer_service import get_default_peers  # ✅ add this

report_bp = Blueprint("report_bp", __name__)

@report_bp.post("/report")
def generate_report():
    """
    POST /api/report
    Body:
    {
      "symbol": "TCS.NS",
      "period": "6mo",
      "interval": "1d",
      "peers": ["INFY.NS","HCLTECH.NS"]   # optional
    }
    """
    try:
        payload = request.get_json(force=True) or {}

        symbol = (payload.get("symbol") or "").strip().upper()
        period = (payload.get("period") or "6mo").strip()
        interval = (payload.get("interval") or "1d").strip()

        # peers optional
        peers = payload.get("peers")
        if not isinstance(peers, list):
            peers = []

        if not symbol:
            return jsonify({"error": "symbol is required (example: TCS.NS)"}), 400

        # ✅ If peers not provided, auto-generate based on selected symbol
        if len(peers) == 0:
            peers = get_default_peers(symbol)

        # ✅ Ensure selected symbol is not repeated in peers
        peers = [p.strip().upper() for p in peers if isinstance(p, str) and p.strip()]
        peers = [p for p in peers if p != symbol]

        report = build_intelligence_report(
            symbol=symbol,
            period=period,
            interval=interval,
            peers=peers
        )

        return jsonify(report), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
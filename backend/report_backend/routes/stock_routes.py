from flask import Blueprint, jsonify, request

from ..extensions import cache
from ..services.market_data import MarketDataService
from ..services.analysis_service import AnalysisService
from ..utils.symbol_utils import normalize_symbol

stock_bp = Blueprint("stock_bp", __name__)

market_service = MarketDataService()
analysis_service = AnalysisService()


def error_response(e):
    message = str(e)

    if "Too Many Requests" in message or "Rate limited" in message:
        return jsonify({
            "success": False,
            "error": "Too Many Requests. Rate limited. Try after a while."
        }), 429

    return jsonify({
        "success": False,
        "error": message
    }), 400


@stock_bp.route("/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "message": "Stock API is healthy"
    })


@stock_bp.route("/overview", methods=["GET"])
@cache.cached(timeout=180, query_string=True)
def get_overview():
    try:
        raw_symbol = request.args.get("symbol", "").strip()
        exchange = request.args.get("exchange", "NSE").strip()

        symbol = normalize_symbol(raw_symbol, exchange)
        overview = market_service.get_stock_overview(symbol)

        return jsonify({
            "success": True,
            "data": overview
        })
    except Exception as e:
        return error_response(e)


@stock_bp.route("/history", methods=["GET"])
@cache.cached(timeout=300, query_string=True)
def get_history():
    try:
        raw_symbol = request.args.get("symbol", "").strip()
        exchange = request.args.get("exchange", "NSE").strip()
        period = request.args.get("period", "6mo").strip()
        interval = request.args.get("interval", "1d").strip()

        symbol = normalize_symbol(raw_symbol, exchange)
        history = market_service.get_price_history(
            symbol=symbol,
            period=period,
            interval=interval
        )

        return jsonify({
            "success": True,
            "data": history
        })
    except Exception as e:
        return error_response(e)


@stock_bp.route("/benchmark", methods=["GET"])
@cache.cached(timeout=300, query_string=True)
def get_benchmark():
    try:
        raw_symbol = request.args.get("symbol", "").strip()
        exchange = request.args.get("exchange", "NSE").strip()

        symbol = normalize_symbol(raw_symbol, exchange)
        benchmark = market_service.get_peer_benchmark(symbol)

        return jsonify({
            "success": True,
            "data": benchmark
        })
    except Exception as e:
        return error_response(e)


@stock_bp.route("/peer-chart", methods=["GET"])
@cache.cached(timeout=300, query_string=True)
def get_peer_chart():
    try:
        raw_symbol = request.args.get("symbol", "").strip()
        exchange = request.args.get("exchange", "NSE").strip()
        period = request.args.get("period", "6mo").strip()
        interval = request.args.get("interval", "1d").strip()

        symbol = normalize_symbol(raw_symbol, exchange)
        peer_chart = market_service.get_peer_performance_chart(
            symbol=symbol,
            period=period,
            interval=interval
        )

        return jsonify({
            "success": True,
            "data": peer_chart
        })
    except Exception as e:
        return error_response(e)


@stock_bp.route("/report", methods=["GET"])
@cache.cached(timeout=300, query_string=True)
def get_report():
    try:
        raw_symbol = request.args.get("symbol", "").strip()
        exchange = request.args.get("exchange", "NSE").strip()
        period = request.args.get("period", "6mo").strip()
        interval = request.args.get("interval", "1d").strip()

        symbol = normalize_symbol(raw_symbol, exchange)

        overview = market_service.get_stock_overview(symbol)
        history = market_service.get_price_history(
            symbol=symbol,
            period=period,
            interval=interval
        )

        benchmark = []
        peer_chart = {
            "baseSymbol": symbol,
            "series": []
        }

        indicators = analysis_service.calculate_indicators(history)
        summary = analysis_service.build_summary(overview, indicators)
        narrative = analysis_service.generate_narrative(overview, indicators)

        return jsonify({
            "success": True,
            "data": {
                "overview": overview,
                "history": history,
                "benchmark": benchmark,
                "peerChart": peer_chart,
                "indicators": indicators,
                "summary": summary,
                "narrative": narrative
            }
        })
    except Exception as e:
        return error_response(e)
from flask import Blueprint, jsonify, request
from services.market_data import MarketDataService
from flask_caching import Cache

market_bp = Blueprint('market', __name__)
market_data_service = MarketDataService()

cache = Cache()

@market_bp.route('/api/market/indices')
@cache.cached(timeout=60)
def get_indices():
    try:
        data = market_data_service.get_indices()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@market_bp.route('/api/market/mood')
@cache.cached(timeout=300)
def get_market_mood():
    try:
        data = market_data_service.get_market_mood()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@market_bp.route('/api/market/movers')
@cache.cached(timeout=300, query_string=True)
def get_movers():
    try:
        category = request.args.get('category', 'large_cap')
        data = market_data_service.get_top_movers(category)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@market_bp.route('/api/market/news')
@cache.cached(timeout=300)
def get_news():
    try:
        data = market_data_service.get_news()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from flask import Blueprint, jsonify, request
from services.market_data import MarketDataService
from services.logo_resolver import LogoResolverService
from flask_caching import Cache

market_bp = Blueprint('market', __name__)
market_data_service = MarketDataService()
logo_resolver_service = LogoResolverService()

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

@market_bp.route('/api/market/history')
@cache.cached(timeout=300, query_string=True)
def get_history():
    try:
        symbol = request.args.get('symbol', '^NSEI')
        period = request.args.get('period', '1mo')
        interval = request.args.get('interval', '1d')
        data = market_data_service.get_index_history(symbol, period, interval)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@market_bp.route('/api/market/stock/<symbol>')
@cache.cached(timeout=3600)
def get_stock_profile(symbol):
    try:
        data = market_data_service.get_instrument_profile(symbol)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@market_bp.route('/api/market/logo/<ticker>')
@cache.cached(timeout=86400) # Cache for 1 day
def resolve_logo(ticker):
    try:
        domain = logo_resolver_service.resolve_ticker_to_domain(ticker)
        if domain:
            return jsonify({"domain": domain, "url": f"https://cdn.tickerlogos.com/{domain}"})
        else:
            return jsonify({"error": "Could not resolve domain for ticker"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from flask import Blueprint, jsonify, request
from services.portfolio_service import PortfolioService
from services.portfolio_intelligence import PortfolioIntelligence
from services.ai_doctor_service import PortfolioDoctorService
from datetime import datetime
from db.sqlite_store import SqliteStore

portfolio_bp = Blueprint('portfolio', __name__, url_prefix='/api/portfolio')
portfolio_service = PortfolioService()
portfolio_intel = PortfolioIntelligence(portfolio_service)
portfolio_doctor = PortfolioDoctorService(portfolio_intel)
store = SqliteStore()

@portfolio_bp.route('/summary', methods=['GET'])
def get_portfolio_summary():
    """
    Returns high-level stats for the Portfolio Hero and DrillDown cards.
    """
    try:
        ident = store.get_or_create_default_portfolio()
        transactions = store.list_transactions(ident.portfolio_id)
        holdings = portfolio_service.get_holdings(
            ident.portfolio_id,
            transactions
        )
        
        # 1. Get all unique symbols
        symbols = [h["ticker"] for h in holdings]
        
        # 2. Fetch Live Prices
        current_prices = portfolio_service.get_live_prices(symbols)
        
        # 3. Calculate Unrealized PnL
        report = portfolio_service.calculate_unrealized_pnl(holdings, current_prices)
        
        return jsonify({
            "total_value": report["total_current_value"],
            "total_invested": report["total_invested_value"],
            "pnl": report["total_pnl"],
            "pnl_percent": report["total_pnl_percent"],
            "currency": "INR",
            "last_updated": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@portfolio_bp.route('/holdings', methods=['GET'])
def get_portfolio_holdings():
    """
    Returns the detailed list of instruments for the Holdings Table.
    """
    try:
        ident = store.get_or_create_default_portfolio()
        transactions = store.list_transactions(ident.portfolio_id)
        holdings = portfolio_service.get_holdings(
            ident.portfolio_id,
            transactions
        )
        # 1. Get all unique symbols
        symbols = [h["ticker"] for h in holdings]
        
        # 2. Fetch Live Prices
        current_prices = portfolio_service.get_live_prices(symbols)
        
        # 3. Calculate Unrealized PnL
        report = portfolio_service.calculate_unrealized_pnl(holdings, current_prices)
        
        # Enrich with cached instrument metadata (name/sector/marketCap bucket)
        enriched = []
        for h in report["holdings"]:
            sym = h.get("ticker")
            meta = store.get_cached_instrument(sym)
            if not meta:
                meta = portfolio_service.market_data.get_instrument_profile(sym)
                store.set_cached_instrument(sym, meta)
            enriched.append({
                "id": sym,
                "ticker": sym,
                "name": meta.get("name") or sym,
                "sector": meta.get("sector") or "Unknown",
                "marketCap": meta.get("marketCap") or "Large",
                "qty": h.get("qty"),
                "avgPrice": h.get("avg_price"),
                "ltp": h.get("ltp"),
                "day_high": h.get("day_high"),
                "day_low": h.get("day_low"),
                "sparkline": h.get("sparkline", []),
                "weight": h.get("weight"),
                "pnl": h.get("pnl"),
                "pnl_percent": h.get("pnl_percent"),
                "current_value": h.get("current_value"),
                "total_invested": h.get("total_invested"),
            })
        return jsonify(enriched)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@portfolio_bp.route('/bootstrap', methods=['GET'])
def get_portfolio_bootstrap():
    """
    Single round-trip: summary + enriched holdings + XIRR.
    Avoids duplicate DB reads and duplicate yfinance quote storms from parallel /summary + /holdings + /xirr.
    """
    try:
        ident = store.get_or_create_default_portfolio()
        transactions = store.list_transactions(ident.portfolio_id)
        holdings = portfolio_service.get_holdings(ident.portfolio_id, transactions)
        symbols = [h["ticker"] for h in holdings]
        current_prices = portfolio_service.get_live_prices(symbols)
        report = portfolio_service.calculate_unrealized_pnl(holdings, current_prices)

        summary = {
            "total_value": report["total_current_value"],
            "total_invested": report["total_invested_value"],
            "pnl": report["total_pnl"],
            "pnl_percent": report["total_pnl_percent"],
            "currency": "INR",
            "last_updated": datetime.now().isoformat(),
        }

        enriched = []
        for h in report["holdings"]:
            sym = h.get("ticker")
            meta = store.get_cached_instrument(sym)
            if not meta:
                meta = portfolio_service.market_data.get_instrument_profile(sym)
                store.set_cached_instrument(sym, meta)
            enriched.append({
                "id": sym,
                "ticker": sym,
                "name": meta.get("name") or sym,
                "sector": meta.get("sector") or "Unknown",
                "marketCap": meta.get("marketCap") or "Large",
                "qty": h.get("qty"),
                "avgPrice": h.get("avg_price"),
                "ltp": h.get("ltp"),
                "day_high": h.get("day_high"),
                "day_low": h.get("day_low"),
                "sparkline": h.get("sparkline", []),
                "weight": h.get("weight"),
                "pnl": h.get("pnl"),
                "pnl_percent": h.get("pnl_percent"),
                "current_value": h.get("current_value"),
                "total_invested": h.get("total_invested"),
            })

        # 4. Calculate XIRR & Alpha
        cash_flows = []
        for tx in transactions:
            cash_flows.append({
                "date": tx["transaction_date"],
                "amount": float(tx["quantity"]) * float(tx["price"]),
                "type": tx["transaction_type"],
            })
        current_value = float(report["total_current_value"])
        xirr_data = portfolio_intel.calculate_xirr(cash_flows, current_value)
        xirr_val = xirr_data["value"]

        # Calculate Portfolio Age for fair Alpha comparison
        days_active = xirr_data.get("days", 365)
        days_active = max(1, days_active)

        # Real Benchmark Calculation (Period-Matched)
        bench = portfolio_intel.get_benchmark_comparison(days=days_active)
        bench_return = bench["return"]
        
        xirr_payload = {
            "xirr": xirr_val,
            "xirr_type": xirr_data.get("type", "annualized"),
            "benchmark_xirr": bench_return,
            "alpha": round(xirr_val - bench_return, 2),
            "benchmark_days": days_active
        }

        return jsonify({
            "summary": summary,
            "holdings": enriched,
            "xirr": xirr_payload,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@portfolio_bp.route('/transactions', methods=['POST'])
def add_transaction():
    """
    Endpoint for adding new buy/sell records via AddTransactionModal.
    """
    data = request.json
    try:
        ident = store.get_or_create_default_portfolio()
        user_id = ident.user_id
        new_tx = portfolio_service.add_transaction(ident.portfolio_id, user_id, data)
        saved = store.insert_transaction(ident.portfolio_id, user_id, new_tx)
        return jsonify(saved), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@portfolio_bp.route('/transactions/<symbol>', methods=['DELETE'])
def delete_portfolio_stock(symbol):
    """
    Endpoint for removing a specific ticker and all its history from the portfolio.
    """
    try:
        ident = store.get_or_create_default_portfolio()
        deleted = store.delete_transactions_by_symbol(ident.portfolio_id, symbol)
        if deleted:
            return jsonify({"success": True, "message": f"Deleted {symbol} transactions"}), 200
        else:
            return jsonify({"error": f"Symbol {symbol} not found in portfolio"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@portfolio_bp.route('/intelligence', methods=['GET'])
def get_portfolio_intelligence():
    """
    Returns the AI-driven 'Problem-Solution' metrics for the user.
    Includes Stress Test, Alpha Divergence, and Tax Friction.
    """
    try:
        ident = store.get_or_create_default_portfolio()
        transactions = store.list_transactions(ident.portfolio_id)
        holdings = portfolio_service.get_holdings(
            ident.portfolio_id,
            transactions
        )
        symbols = [h["ticker"] for h in holdings]
        current_prices = portfolio_service.get_live_prices(symbols)
        report = portfolio_service.calculate_unrealized_pnl(holdings, current_prices)
        
        # Calculate Intelligence Metrics
        stress_results = portfolio_intel.simulate_stress_test(report["holdings"])
        alpha_data = portfolio_intel.get_herd_divergence_score(report["holdings"])
        tax_data = portfolio_intel.get_tax_friction_estimate(report["holdings"])
        rebalance_data = portfolio_intel.get_rebalancing_suggestions(report["holdings"])
        
        # 4. Generate AI Doctor Health Check
        health_check = portfolio_doctor.generate_health_check(report)
        
        return jsonify({
            "doctor_summary": health_check["diagnosis"],
            "doctor_note": health_check,
            "stress_test": stress_results,
            "alpha_divergence": alpha_data,
            "tax_friction": tax_data,
            "rebalancing": rebalance_data,
            "alpha_score": alpha_data["score"],
            "resilience_score": stress_results.get("resilience_score", 0),
            "net_gain_post_tax": tax_data["net_capital_gain"]
        })
    except Exception as e:
        return jsonify({"error": f"Intelligence Engine Error: {str(e)}"}), 500

@portfolio_bp.route('/analytics/xirr', methods=['GET'])
def get_portfolio_xirr():
    """
    Calculates the precise XIRR for the current portfolio.
    """
    try:
        ident = store.get_or_create_default_portfolio()
        transactions = store.list_transactions(ident.portfolio_id)
        # Convert transactions to cash flow format
        cash_flows = []
        for tx in transactions:
            cash_flows.append({
                "date": tx["transaction_date"],
                "amount": float(tx["quantity"] * tx["price"]),
                "type": tx["transaction_type"]
            })

        # Current value computed from live prices + holdings
        holdings = portfolio_service.get_holdings(ident.portfolio_id, transactions)
        symbols = [h["ticker"] for h in holdings]
        current_prices = portfolio_service.get_live_prices(symbols)
        report = portfolio_service.calculate_unrealized_pnl(holdings, current_prices)
        # 4. Calculate XIRR & Alpha
        cash_flows = []
        for tx in transactions:
            cash_flows.append({
                "date": tx["transaction_date"],
                "amount": float(tx["quantity"]) * float(tx["price"]),
                "type": tx["transaction_type"],
            })
        current_value = float(report["total_current_value"])
        xirr_data = portfolio_intel.calculate_xirr(cash_flows, current_value)
        xirr_val = xirr_data["value"]
        
        # Calculate Portfolio Age for fair Alpha comparison
        days_active = xirr_data.get("days", 365)
        days_active = max(1, days_active)

        # Real Benchmark Calculation (Period-Matched)
        bench = portfolio_intel.get_benchmark_comparison(days=days_active)
        bench_return = bench["return"]
        
        return jsonify({
            "xirr": xirr_val,
            "xirr_type": xirr_data.get("type", "annualized"),
            "benchmark_xirr": bench_return,
            "alpha": round(xirr_val - bench_return, 2),
            "benchmark_days": days_active
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@portfolio_bp.route('/history', methods=['GET'])
def get_portfolio_history():
    """
    Real portfolio performance history based on historical closes of the held symbols.
    Query params:
      - days: int (default 365)
    """
    try:
        days = int(request.args.get("days", "365"))
        days = max(7, min(days, 3650))

        ident = store.get_or_create_default_portfolio()
        transactions = store.list_transactions(ident.portfolio_id)
        
        if not transactions:
            return jsonify([])

        # Use the new transaction-aware History Reconstructor
        history = portfolio_service.get_performance_history(
            ident.portfolio_id, 
            transactions, 
            days=days
        )
        
        return jsonify(history)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from flask import Blueprint, jsonify, request
from services.portfolio_service import PortfolioService
from services.portfolio_intelligence import PortfolioIntelligence
from services.ai_doctor_service import PortfolioDoctorService
from datetime import datetime

portfolio_bp = Blueprint('portfolio', __name__, url_prefix='/api/portfolio')
portfolio_service = PortfolioService()
portfolio_intel = PortfolioIntelligence(portfolio_service)
portfolio_doctor = PortfolioDoctorService(portfolio_intel)

# Mock storage for development (mimics DB behavior)
TEMP_PORTFOLIO_DB = {
    "default_id": "88888888-4444-4444-4444-121212121212",
    "transactions": [
        {
            "id": "tx1",
            "symbol": "RELIANCE",
            "quantity": 10,
            "price": 2400.0,
            "transaction_type": "buy",
            "asset_segment": "equity",
            "transaction_date": "2024-01-15"
        },
        {
            "id": "tx2",
            "symbol": "TCS",
            "quantity": 5,
            "price": 3500.0,
            "transaction_type": "buy",
            "asset_segment": "equity",
            "transaction_date": "2024-02-10"
        }
    ]
}

@portfolio_bp.route('/summary', methods=['GET'])
def get_portfolio_summary():
    """
    Returns high-level stats for the Portfolio Hero and DrillDown cards.
    """
    try:
        holdings = portfolio_service.get_holdings(
            TEMP_PORTFOLIO_DB["default_id"], 
            TEMP_PORTFOLIO_DB["transactions"]
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
        holdings = portfolio_service.get_holdings(
            TEMP_PORTFOLIO_DB["default_id"], 
            TEMP_PORTFOLIO_DB["transactions"]
        )
        # 1. Get all unique symbols
        symbols = [h["ticker"] for h in holdings]
        
        # 2. Fetch Live Prices
        current_prices = portfolio_service.get_live_prices(symbols)
        
        # 3. Calculate Unrealized PnL
        report = portfolio_service.calculate_unrealized_pnl(holdings, current_prices)
        
        return jsonify(report["holdings"])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@portfolio_bp.route('/transactions', methods=['POST'])
def add_transaction():
    """
    Endpoint for adding new buy/sell records via AddTransactionModal.
    """
    data = request.json
    try:
        user_id = "test-user-id" # Placeholder
        new_tx = portfolio_service.add_transaction(
            TEMP_PORTFOLIO_DB["default_id"], 
            user_id, 
            data
        )
        TEMP_PORTFOLIO_DB["transactions"].append(new_tx)
        return jsonify(new_tx), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@portfolio_bp.route('/intelligence', methods=['GET'])
def get_portfolio_intelligence():
    """
    Returns the AI-driven 'Problem-Solution' metrics for the user.
    Includes Stress Test, Alpha Divergence, and Tax Friction.
    """
    try:
        holdings = portfolio_service.get_holdings(
            TEMP_PORTFOLIO_DB["default_id"], 
            TEMP_PORTFOLIO_DB["transactions"]
        )
        # Mock current prices for integration
        current_prices = {"RELIANCE": 2950.0, "TCS": 4100.0}
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
        # Convert transactions to cash flow format
        cash_flows = []
        for tx in TEMP_PORTFOLIO_DB["transactions"]:
            cash_flows.append({
                "date": tx["transaction_date"],
                "amount": float(tx["quantity"] * tx["price"]),
                "type": tx["transaction_type"]
            })
            
        current_value = 15542050.0 # Mock current portfolio value
        xirr_val = portfolio_intel.calculate_xirr(cash_flows, current_value)
        
        return jsonify({
            "xirr": xirr_val,
            "benchmark_xirr": 14.2, # Nifty 50 average
            "alpha": round(xirr_val - 14.2, 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

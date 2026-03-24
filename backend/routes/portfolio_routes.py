from flask import Blueprint, jsonify, request
from services.portfolio_service import PortfolioService
from datetime import datetime

portfolio_bp = Blueprint('portfolio', __name__, url_prefix='/api/portfolio')
portfolio_service = PortfolioService()

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
        # Mock current prices for initial summary
        current_prices = {"RELIANCE": 2950.0, "TCS": 4100.0}
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
        # Using mock prices for now; later this integrates with market_data service
        current_prices = {"RELIANCE": 2950.0, "TCS": 4100.0}
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

import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from decimal import Decimal

from services.market_data import MarketDataService

class PortfolioService:
    """
    PortfolioService handles the core business logic for managing user portfolios
    and their underlying transactions. This service ensures data integrity
    and provides the foundation for the AI-driven intelligence layer.
    """

    def __init__(self, db_session=None):
        self.db = db_session
        self.market_data = MarketDataService()

    def get_live_prices(self, symbols: List[str]) -> Dict[str, float]:
        """
        Fetches the Latest Traded Price (LTP) for a list of symbols.
        Uses the shared MarketDataService to ensure consistency across the app.
        """
        prices = {}
        for symbol in symbols:
            try:
                # Assuming market_data.get_quote() returns a dict with 'price'
                quote = self.market_data.get_quote(symbol)
                prices[symbol] = float(quote.get("price", 0))
            except Exception:
                # Fallback to a zero price if provider fails
                prices[symbol] = 0.0
        return prices

    def create_portfolio(self, user_id: str, name: str = "Primary Portfolio") -> Dict[str, Any]:
        """
        Initializes a new portfolio for a user.
        """
        portfolio_id = str(uuid.uuid4())
        portfolio = {
            "id": portfolio_id,
            "user_id": user_id,
            "name": name,
            "created_at": datetime.now().isoformat(),
            "currency": "INR"
        }
        # INSERT INTO portfolios (id, user_id, name) VALUES (...)
        return portfolio

    def add_transaction(self, portfolio_id: str, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Adds a single transaction record to the database.
        Includes validation for required fields like symbol, qty, and price.
        """
        transaction_id = str(uuid.uuid4())
        
        # Validate critical fields
        required = ["symbol", "quantity", "price", "transaction_type", "asset_segment"]
        for field in required:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")

        transaction = {
            "id": transaction_id,
            "portfolio_id": portfolio_id,
            "user_id": user_id,
            "symbol": data["symbol"].upper(),
            "asset_segment": data["asset_segment"],
            "transaction_type": data["transaction_type"].lower(),
            "quantity": float(data["quantity"]),
            "price": float(data["price"]),
            "brokerage": float(data.get("brokerage", 0)),
            "transaction_date": data.get("transaction_date", datetime.now().isoformat()),
            "notes": data.get("notes", ""),
            "created_at": datetime.now().isoformat()
        }
        
        # Business Rule: Quantity must be positive
        if transaction["quantity"] <= 0:
            raise ValueError("Quantity must be greater than zero.")
            
        # Business Rule: Price must be positive
        if transaction["price"] < 0:
            raise ValueError("Price cannot be negative.")

        # Logic for writing to database would go here
        return transaction

    def delete_transaction(self, transaction_id: str) -> bool:
        """
        Removes a transaction record. In a production environment, 
        this would also trigger a recalculation of the holding's average cost.
        """
        # DELETE FROM transactions WHERE id = ?
        return True

    def get_holdings(self, portfolio_id: str, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Processes a list of transactions to derive the current state of holdings.
        Calculates weighted average cost, total quantity, and current unrealized P&L.
        """
        holdings_map = {}
        
        for tx in transactions:
            symbol = tx["symbol"]
            qty = Decimal(str(tx["quantity"]))
            price = Decimal(str(tx["price"]))
            tx_type = tx["transaction_type"].lower()

            if symbol not in holdings_map:
                holdings_map[symbol] = {
                    "ticker": symbol,
                    "qty": Decimal("0"),
                    "total_cost": Decimal("0"),
                    "avg_price": Decimal("0"),
                    "transactions_count": 0
                }

            h = holdings_map[symbol]
            h["transactions_count"] += 1

            if tx_type == "buy":
                # Average Cost = (Old Total Cost + New Cost) / New Total Qty
                h["total_cost"] += (qty * price)
                h["qty"] += qty
                if h["qty"] > 0:
                    h["avg_price"] = h["total_cost"] / h["qty"]
            elif tx_type == "sell":
                # Selling reduces quantity but theoretically preserves the average cost 
                # for the remaining shares in a simple FIFO/WAC model.
                h["qty"] -= qty
                # We deduct from total cost based on the average price to maintain consistency
                h["total_cost"] = h["qty"] * h["avg_price"]
                
                # Check for short positions (not usually recommended for retail long-term)
                if h["qty"] < 0:
                    print(f"Warning: Negative inventory for {symbol}. Short selling detected.")

        # Filter out closed positions (qty = 0)
        active_holdings = [h for h in holdings_map.values() if h["qty"] > 0]
        
        # Calculate Total Portfolio Value (Cost Basis) for weights
        total_p_cost = sum(h["total_cost"] for h in active_holdings)
        
        # Final Format for Frontend
        final_holdings = []
        for h in active_holdings:
            # Type casting to float for JSON serialization later
            weight = (h["total_cost"] / total_p_cost * 100) if total_p_cost > 0 else 0
            
            final_holdings.append({
                "ticker": h["ticker"],
                "qty": float(h["qty"]),
                "avg_price": float(h["avg_price"]),
                "weight": round(float(weight), 2),
                "total_invested": float(h["total_cost"])
            })

        return sorted(final_holdings, key=lambda x: x["weight"], reverse=True)

    def calculate_unrealized_pnl(self, holdings: List[Dict[str, Any]], current_prices: Dict[str, float]) -> Dict[str, Any]:
        """
        Merges current holdings with live market prices to calculate unrealized gains.
        """
        total_current_value = Decimal("0")
        total_invested_value = Decimal("0")
        
        for h in holdings:
            symbol = h["ticker"]
            ltp = Decimal(str(current_prices.get(symbol, h["avg_price"])))
            
            current_val = Decimal(str(h["qty"])) * ltp
            invested_val = Decimal(str(h["total_invested"]))
            
            h["ltp"] = float(ltp)
            h["current_value"] = float(current_val)
            h["pnl"] = float(current_val - invested_val)
            h["pnl_percent"] = float(((current_val / invested_val) - 1) * 100) if invested_val > 0 else 0
            
            total_current_value += current_val
            total_invested_value += invested_val
            
        return {
            "holdings": holdings,
            "total_current_value": float(total_current_value),
            "total_invested_value": float(total_invested_value),
            "total_pnl": float(total_current_value - total_invested_value),
            "total_pnl_percent": float(((total_current_value / total_invested_value) - 1) * 100) if total_invested_value > 0 else 0
        }

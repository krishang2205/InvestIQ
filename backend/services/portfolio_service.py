import uuid
import random
from datetime import datetime
from typing import List, Dict, Any, Optional
from decimal import Decimal

try:
    from services.market_data import MarketDataService
except ImportError:
    from .market_data import MarketDataService

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
        Batches into one yfinance download when multiple symbols (much faster).
        """
        if not symbols:
            return {}
        return self.market_data.get_batch_quotes(symbols)

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
        qty_val = float(transaction["quantity"])
        price_val = float(transaction["price"])
        
        if qty_val <= 0:
            raise ValueError("Quantity must be greater than zero.")
            
        # Business Rule: Price must be positive
        if price_val < 0:
            raise ValueError("Price cannot be negative.")

        # Logic for writing to database would go here
        return transaction

    def record_daily_nav(self, portfolio_id: str, date_str: str = None) -> Dict[str, Any]:
        """
        Calculates the Net Asset Value (NAV) of the portfolio and records it.
        This enables the 'Performance Chart' on the Portfolio Hero.
        """
        if not date_str:
            date_str = datetime.now().strftime("%Y-%m-%d")
            
        # 1. Get Holdings
        # In mock mode, we use the TEMP_DB; in prod, we'd query SQL
        from db.mock_db import TEMP_PORTFOLIO_DB
        holdings = self.get_holdings(portfolio_id, TEMP_PORTFOLIO_DB["transactions"])
        
        # 2. Get Live Prices
        symbols = [h["ticker"] for h in holdings]
        prices = self.get_live_prices(symbols)
        
        # 3. Calculate Total Value
        report = self.calculate_unrealized_pnl(holdings, prices)
        nav_value = report["total_current_value"]
        invested = report["total_invested_value"]
        
        snapshot = {
            "portfolio_id": portfolio_id,
            "nav_date": date_str,
            "total_value": float(nav_value),
            "invested_value": float(invested),
            "pnl": float(nav_value - invested)
        }
        
        # SQL: INSERT INTO daily_nav (...) VALUES (...) ON CONFLICT UPDATE
        return snapshot

    def get_performance_history(self, portfolio_id: str, transactions: List[Dict[str, Any]], days: int = 180) -> List[Dict[str, Any]]:
        """
        Reconstructs the historical Net Asset Value (NAV) of the portfolio.
        Instead of simulating, it uses historical price data and your trade dates.
        """
        if not transactions:
            return []

        # 1. Get unique symbols and date range
        symbols = list(set(tx["symbol"] for tx in transactions))
        
        # 2. Fetch Historical Data (Batch)
        period = "1y" if days > 180 else "6mo"
        hist_df = self.market_data.get_history(symbols, period=period)
        
        if hist_df.empty:
            return []

        # 3. Process Trades into a Daily Quantity Map
        # We need to know exactly how many shares were held on any given Date.
        sorted_txs = sorted(transactions, key=lambda x: x["transaction_date"])
        
        # Normalize Dataframe Format (MultiIndex handling)
        series_map = {}
        if hasattr(hist_df.columns, "levels"):
            for s in symbols:
                yf_s = self.market_data.normalize_symbol(s)
                if yf_s in hist_df.columns.levels[0]:
                    series_map[s] = hist_df[yf_s]["Close"].dropna()
        else:
            if len(symbols) == 1:
                series_map[symbols[0]] = hist_df["Close"].dropna()

        if not series_map:
            return []

        # 4. Align by the dates present in the market data
        timeline = sorted(list(next(iter(series_map.values())).index))
        # Filter to the requested window
        timeline = timeline[-days:]
        
        history = []
        for dt in timeline:
            dt_str = dt.strftime("%Y-%m-%d")
            total_value = Decimal("0")
            
            # Calculate holdings for this specific date
            for s, ser in series_map.items():
                # Qty of this stock on this day = Sum of buys - Sum of sells before or on this day
                qty = sum(
                    Decimal(str(tx["quantity"])) if tx["transaction_type"] == "buy" else -Decimal(str(tx["quantity"]))
                    for tx in sorted_txs 
                    if tx["symbol"] == s and tx["transaction_date"] <= dt_str
                )
                
                if qty > 0:
                    try:
                        # Find closest price (as market might be closed on tx date)
                        price = Decimal(str(ser.asof(dt) if hasattr(ser, 'asof') else ser.iloc[0]))
                        total_value += qty * price
                    except Exception:
                        continue
            
            history.append({
                "date": dt_str,
                "value": round(float(total_value), 2)
            })

        return history

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
            total_cost_val = Decimal(str(h["total_cost"]))
            total_p_cost_val = Decimal(str(total_p_cost))
            
            weight = (total_cost_val / total_p_cost_val * Decimal("100")) if total_p_cost_val > 0 else Decimal("0")
            
            final_holdings.append({
                "ticker": h["ticker"],
                "qty": float(h["qty"]),
                "avg_price": float(h["avg_price"]),
                "weight": round(float(weight), 2),
                "total_invested": float(h["total_cost"])
            })

        return sorted(final_holdings, key=lambda x: x["weight"], reverse=True)

    def calculate_unrealized_pnl(self, holdings: List[Dict[str, Any]], current_prices: Dict[str, Any]) -> Dict[str, Any]:
        """
        Merges current holdings with live market prices, high/low stats, and sparklines.
        """
        total_current_value = Decimal("0")
        total_invested_value = Decimal("0")
        
        for h in holdings:
            symbol = h["ticker"]
            market_data = current_prices.get(symbol, {})
            
            # If market_data is a float (legacy) or missing, handle gracefully
            if isinstance(market_data, (int, float, Decimal)):
                ltp = Decimal(str(market_data))
                day_high = float(ltp)
                day_low = float(ltp)
                sparkline = []
            else:
                ltp = Decimal(str(market_data.get("price", h["avg_price"])))
                day_high = market_data.get("high", float(ltp))
                day_low = market_data.get("low", float(ltp))
                sparkline = market_data.get("sparkline", [])
            
            current_val = Decimal(str(h["qty"])) * ltp
            invested_val = Decimal(str(h["total_invested"]))
            
            h["ltp"] = float(ltp)
            h["day_high"] = day_high
            h["day_low"] = day_low
            h["sparkline"] = sparkline
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

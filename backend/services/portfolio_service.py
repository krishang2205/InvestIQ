import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from decimal import Decimal

class PortfolioService:
    """
    PortfolioService handles the core business logic for managing user portfolios
    and their underlying transactions. This service ensures data integrity
    and provides the foundation for the AI-driven intelligence layer.
    """

    def __init__(self, db_session=None):
        # In a real app, we would inject a database session here.
        # For now, we interact via the schema and potentially a mock DB for logic testing.
        self.db = db_session

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

    def get_portfolio_metadata(self, portfolio_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves basic info about the portfolio.
        """
        # SELECT * FROM portfolios WHERE id = ?
        return {
            "id": portfolio_id,
            "name": "Wealth Builder",
            "risk_profile": "Moderate"
        }

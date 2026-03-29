import unittest
import sys
import os

# Ensure the backend root is in the path for resolution
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.portfolio_service import PortfolioService
from decimal import Decimal

class TestPortfolioService(unittest.TestCase):
    def setUp(self):
        self.service = PortfolioService()
        self.mock_txs = [
            {
                "symbol": "RELIANCE",
                "quantity": 10,
                "price": 2000.0,
                "transaction_type": "buy",
                "asset_segment": "equity"
            },
            {
                "symbol": "RELIANCE",
                "quantity": 10,
                "price": 2500.0,
                "transaction_type": "buy",
                "asset_segment": "equity"
            },
            {
                "symbol": "TCS",
                "quantity": 5,
                "price": 3000.0,
                "transaction_type": "buy",
                "asset_segment": "equity"
            }
        ]

    def test_holdings_calculation(self):
        holdings = self.service.get_holdings("port-123", self.mock_txs)
        
        # Check counts
        self.assertEqual(len(holdings), 2)
        
        # Check Reliance Avg Price: (20000 + 25000) / 20 = 2250
        rel = next(h for h in holdings if h["ticker"] == "RELIANCE")
        self.assertEqual(rel["avg_price"], 2250.0)
        self.assertEqual(rel["qty"], 20.0)

    def test_sell_logic(self):
        txs_with_sell = self.mock_txs + [{
            "symbol": "RELIANCE",
            "quantity": 5,
            "price": 2800.0,
            "transaction_type": "sell",
            "asset_segment": "equity"
        }]
        holdings = self.service.get_holdings("port-123", txs_with_sell)
        rel = next(h for h in holdings if h["ticker"] == "RELIANCE")
        
        # Qty should decrease to 15
        self.assertEqual(rel["qty"], 15.0)
        # Avg price should remain 2250 (WAC principle)
        self.assertEqual(rel["avg_price"], 2250.0)

if __name__ == '__main__':
    unittest.main()

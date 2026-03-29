from services.portfolio_service import PortfolioService
from db.sqlite_store import SqliteStore
import json

def test_sparkline_data():
    store = SqliteStore()
    service = PortfolioService()
    
    ident = store.get_or_create_default_portfolio()
    transactions = store.list_transactions(ident.portfolio_id)
    holdings = service.get_holdings(ident.portfolio_id, transactions)
    
    symbols = [h["ticker"] for h in holdings]
    print(f"Fetching data for: {symbols}")
    
    current_prices = service.get_live_prices(symbols)
    report = service.calculate_unrealized_pnl(holdings, current_prices)
    
    for h in report["holdings"]:
        print(f"\nSymbol: {h['ticker']}")
        print(f"LTP: {h['ltp']}")
        print(f"High: {h['day_high']}")
        print(f"Low: {h['day_low']}")
        print(f"Sparkline (last 3 points): {h['sparkline'][-3:] if h['sparkline'] else 'EMPTY'}")
        
if __name__ == "__main__":
    test_sparkline_data()

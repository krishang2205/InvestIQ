from backend.services.stock_service import StockService

def get_live_snapshot(symbol: str):
    svc = StockService()
    return svc.get_quote(symbol)
from backend.services.yahoo_data import YahooDataProvider

class StockService:
    def __init__(self):
        self.provider = YahooDataProvider()

    def get_quote(self, symbol: str):
        return self.provider.get_quote(symbol)

    def get_historical(self, symbol: str, period="6mo", interval="1d"):
        return self.provider.get_historical(symbol, period=period, interval=interval)

    def get_fundamentals(self, symbol: str):
        return self.provider.get_fundamentals(symbol)
class GrowwDataProvider:
    def get_quote(self, symbol: str):
        raise NotImplementedError("Groww has no official free public API. Use Yahoo provider.")

    def get_historical(self, symbol: str, period="6mo", interval="1d"):
        raise NotImplementedError("Groww has no official free public API. Use Yahoo provider.")
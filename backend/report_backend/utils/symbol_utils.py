def normalize_symbol(symbol: str, exchange: str = "NSE") -> str:
    if not symbol:
        raise ValueError("Stock symbol is required")

    symbol = symbol.strip().upper()

    if symbol.endswith(".NS") or symbol.endswith(".BO"):
        return symbol

    if exchange.upper() == "BSE":
        return f"{symbol}.BO"

    return f"{symbol}.NS"
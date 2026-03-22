def safe_round(value, digits=2):
    try:
        if value is None:
            return None
        return round(float(value), digits)
    except Exception:
        return None


def format_percent(value):
    try:
        if value is None:
            return None
        return f"{float(value):.2f}%"
    except Exception:
        return None


def format_market_cap(value):
    try:
        if value is None:
            return None

        value = float(value)

        if value >= 1_00_00_00_00_000:
            return f"₹{value / 1_00_00_00_00_000:.2f} L Cr"
        elif value >= 1_00_00_000:
            return f"₹{value / 1_00_00_000:.2f} Cr"
        elif value >= 1_00_000:
            return f"₹{value / 1_00_000:.2f} L"
        else:
            return f"₹{value:.2f}"
    except Exception:
        return None
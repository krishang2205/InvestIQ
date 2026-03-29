# Centralized mock database for InvestIQ development.
# Avoids circular imports between services and routes.

TEMP_PORTFOLIO_DB = {
    "default_id": "88888888-4444-4444-4444-121212121212",
    "transactions": [
        {
            "id": "tx1",
            "symbol": "RELIANCE",
            "quantity": 10,
            "price": 2400.0,
            "transaction_type": "buy",
            "asset_segment": "equity",
            "transaction_date": "2024-01-15"
        },
        {
            "id": "tx2",
            "symbol": "TCS",
            "quantity": 5,
            "price": 3500.0,
            "transaction_type": "buy",
            "asset_segment": "equity",
            "transaction_date": "2024-02-10"
        }
    ]
}

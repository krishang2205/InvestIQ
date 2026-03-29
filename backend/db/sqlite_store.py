import json
import os
import sqlite3
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from uuid import uuid4
 
 
def _utcnow_iso() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
 
 
def _default_db_path() -> str:
    # Persist under backend/data so it’s local-dev friendly.
    base_dir = os.path.dirname(os.path.dirname(__file__))  # backend/
    data_dir = os.path.join(base_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    return os.path.join(data_dir, "investiq.sqlite3")
 
 
@dataclass(frozen=True)
class PortfolioIdentity:
    user_id: str
    portfolio_id: str
 
 
class SqliteStore:
    """
    Minimal SQLite persistence for local portfolio management.
 
    - No auth in this repo yet; we store a single default user/portfolio unless specified.
    - Safe for dev usage; not intended for multi-process production workloads.
    """
 
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or os.getenv("INVESTIQ_SQLITE_PATH") or _default_db_path()
        self._init_db()
 
    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
 
    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS portfolios (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    currency TEXT NOT NULL DEFAULT 'INR',
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS transactions (
                    id TEXT PRIMARY KEY,
                    portfolio_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    symbol TEXT NOT NULL,
                    asset_segment TEXT NOT NULL,
                    transaction_type TEXT NOT NULL,
                    quantity REAL NOT NULL,
                    price REAL NOT NULL,
                    brokerage REAL NOT NULL DEFAULT 0,
                    transaction_date TEXT NOT NULL,
                    notes TEXT NOT NULL DEFAULT '',
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_transactions_portfolio_date
                ON transactions (portfolio_id, transaction_date)
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS instrument_cache (
                    symbol TEXT PRIMARY KEY,
                    payload_json TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            conn.commit()
 
    def get_or_create_default_portfolio(self) -> PortfolioIdentity:
        user_id = os.getenv("INVESTIQ_DEFAULT_USER_ID", "local-user")
        portfolio_name = os.getenv("INVESTIQ_DEFAULT_PORTFOLIO_NAME", "Primary Portfolio")
 
        with self._connect() as conn:
            row = conn.execute(
                "SELECT id, user_id FROM portfolios WHERE user_id = ? ORDER BY created_at ASC LIMIT 1",
                (user_id,),
            ).fetchone()
            if row:
                return PortfolioIdentity(user_id=row["user_id"], portfolio_id=row["id"])
 
            portfolio_id = str(uuid4())
            conn.execute(
                "INSERT INTO portfolios (id, user_id, name, currency, created_at) VALUES (?,?,?,?,?)",
                (portfolio_id, user_id, portfolio_name, "INR", _utcnow_iso()),
            )
            conn.commit()
            return PortfolioIdentity(user_id=user_id, portfolio_id=portfolio_id)
 
    def list_transactions(self, portfolio_id: str) -> List[Dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT id, portfolio_id, user_id, symbol, asset_segment, transaction_type,
                       quantity, price, brokerage, transaction_date, notes, created_at
                FROM transactions
                WHERE portfolio_id = ?
                ORDER BY transaction_date ASC, created_at ASC
                """,
                (portfolio_id,),
            ).fetchall()
            return [dict(r) for r in rows]
 
    def insert_transaction(self, portfolio_id: str, user_id: str, tx: Dict[str, Any]) -> Dict[str, Any]:
        tx_id = str(uuid4())
        created_at = _utcnow_iso()
        transaction_date = tx.get("transaction_date") or datetime.utcnow().date().isoformat()
 
        record = {
            "id": tx_id,
            "portfolio_id": portfolio_id,
            "user_id": user_id,
            "symbol": str(tx["symbol"]).upper(),
            "asset_segment": str(tx["asset_segment"]).lower(),
            "transaction_type": str(tx["transaction_type"]).lower(),
            "quantity": float(tx["quantity"]),
            "price": float(tx["price"]),
            "brokerage": float(tx.get("brokerage", 0) or 0),
            "transaction_date": transaction_date,
            "notes": str(tx.get("notes", "") or ""),
            "created_at": created_at,
        }
 
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO transactions (
                    id, portfolio_id, user_id, symbol, asset_segment, transaction_type,
                    quantity, price, brokerage, transaction_date, notes, created_at
                )
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
                """,
                (
                    record["id"],
                    record["portfolio_id"],
                    record["user_id"],
                    record["symbol"],
                    record["asset_segment"],
                    record["transaction_type"],
                    record["quantity"],
                    record["price"],
                    record["brokerage"],
                    record["transaction_date"],
                    record["notes"],
                    record["created_at"],
                ),
            )
            conn.commit()
 
        return record
 
    def get_cached_instrument(self, symbol: str, max_age_seconds: int = 86400) -> Optional[Dict[str, Any]]:
        symbol = symbol.upper()
        with self._connect() as conn:
            row = conn.execute(
                "SELECT payload_json, updated_at FROM instrument_cache WHERE symbol = ?",
                (symbol,),
            ).fetchone()
            if not row:
                return None
 
            try:
                updated_at = datetime.fromisoformat(row["updated_at"].replace("Z", "+00:00"))
            except Exception:
                return None
 
            age = (datetime.utcnow() - updated_at.replace(tzinfo=None)).total_seconds()
            if age > max_age_seconds:
                return None
 
            try:
                return json.loads(row["payload_json"])
            except Exception:
                return None
 
    def set_cached_instrument(self, symbol: str, payload: Dict[str, Any]) -> None:
        symbol = symbol.upper()
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO instrument_cache (symbol, payload_json, updated_at)
                VALUES (?,?,?)
                ON CONFLICT(symbol) DO UPDATE SET
                    payload_json=excluded.payload_json,
                    updated_at=excluded.updated_at
                """,
                (symbol, json.dumps(payload), _utcnow_iso()),
            )
            conn.commit()
    def delete_transactions_by_symbol(self, portfolio_id: str, symbol: str) -> bool:
        symbol = symbol.upper()
        with self._connect() as conn:
            cursor = conn.execute(
                "DELETE FROM transactions WHERE portfolio_id = ? AND symbol = ?",
                (portfolio_id, symbol),
            )
            conn.commit()
            return cursor.rowcount > 0

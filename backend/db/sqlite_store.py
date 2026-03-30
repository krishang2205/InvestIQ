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
            # --- Learning Model Tables ---
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS learning_lessons (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    video_url TEXT NOT NULL,
                    thumbnail_url TEXT,
                    duration TEXT,
                    order_index INTEGER NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS learning_quizzes (
                    id TEXT PRIMARY KEY,
                    lesson_id TEXT NOT NULL,
                    question TEXT NOT NULL,
                    options_json TEXT NOT NULL,
                    correct_option_index INTEGER NOT NULL,
                    order_index INTEGER NOT NULL,
                    FOREIGN KEY (lesson_id) REFERENCES learning_lessons (id)
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS learning_progress (
                    user_id TEXT NOT NULL,
                    lesson_id TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'not_started', -- 'watched', 'quiz_completed'
                    quiz_score INTEGER,
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY (user_id, lesson_id),
                    FOREIGN KEY (lesson_id) REFERENCES learning_lessons (id)
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS learning_final_questions (
                    id TEXT PRIMARY KEY,
                    question TEXT NOT NULL,
                    options_json TEXT NOT NULL,
                    correct_option_index INTEGER NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS learning_assessments (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    score INTEGER NOT NULL,
                    total_questions INTEGER NOT NULL,
                    completed_at TEXT NOT NULL
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

    # --- Learning Model Methods ---

    def list_lessons(self, user_id: str) -> List[Dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT l.*, p.status, p.quiz_score, p.updated_at
                FROM learning_lessons l
                LEFT JOIN learning_progress p ON l.id = p.lesson_id AND p.user_id = ?
                ORDER BY l.order_index ASC
                """,
                (user_id,),
            ).fetchall()
            return [dict(r) for r in rows]

    def get_lesson_with_quiz(self, lesson_id: str) -> Optional[Dict[str, Any]]:
        with self._connect() as conn:
            lesson = conn.execute("SELECT * FROM learning_lessons WHERE id = ?", (lesson_id,)).fetchone()
            if not lesson:
                return None
            
            quizzes = conn.execute(
                "SELECT * FROM learning_quizzes WHERE lesson_id = ? ORDER BY order_index ASC", 
                (lesson_id,)
            ).fetchall()
            
            result = dict(lesson)
            result["quizzes"] = [dict(q) for q in quizzes]
            for q in result["quizzes"]:
                q["options"] = json.loads(q["options_json"])
            return result

    def update_learning_progress(self, user_id: str, lesson_id: str, status: str, quiz_score: Optional[int] = None) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO learning_progress (user_id, lesson_id, status, quiz_score, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(user_id, lesson_id) DO UPDATE SET
                    status = excluded.status,
                    quiz_score = COALESCE(excluded.quiz_score, learning_progress.quiz_score),
                    updated_at = excluded.updated_at
                """,
                (user_id, lesson_id, status, quiz_score, _utcnow_iso()),
            )
            conn.commit()

    def get_final_assessment_questions(self) -> List[Dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute("SELECT * FROM learning_final_questions ORDER BY id ASC").fetchall()
            questions = [dict(r) for r in rows]
            for q in questions:
                q["options"] = json.loads(q["options_json"])
            return questions

    def save_final_assessment_result(self, user_id: str, score: int, total: int) -> str:
        assessment_id = str(uuid4())
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO learning_assessments (id, user_id, score, total_questions, completed_at) VALUES (?, ?, ?, ?, ?)",
                (assessment_id, user_id, score, total, _utcnow_iso()),
            )
            conn.commit()
        return assessment_id

    def set_lessons(self, lessons: List[Dict[str, Any]]) -> None:
        """Seed or update lessons."""
        with self._connect() as conn:
            for l in lessons:
                conn.execute(
                    """
                    INSERT INTO learning_lessons (id, title, description, video_url, thumbnail_url, duration, order_index, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        title=excluded.title,
                        description=excluded.description,
                        video_url=excluded.video_url,
                        thumbnail_url=excluded.thumbnail_url,
                        duration=excluded.duration,
                        order_index=excluded.order_index
                    """,
                    (l["id"], l["title"], l["description"], l["video_url"], l.get("thumbnail_url"), l.get("duration"), l["order_index"], _utcnow_iso())
                )
            conn.commit()

    def set_quizzes(self, lesson_id: str, quizzes: List[Dict[str, Any]]) -> None:
        """Seed or update quizzes for a lesson."""
        with self._connect() as conn:
            conn.execute("DELETE FROM learning_quizzes WHERE lesson_id = ?", (lesson_id,))
            for q in quizzes:
                conn.execute(
                    """
                    INSERT INTO learning_quizzes (id, lesson_id, question, options_json, correct_option_index, order_index)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (str(uuid4()), lesson_id, q["question"], json.dumps(q["options"]), q["correct_option_index"], q["order_index"])
                )
            conn.commit()

    def set_final_questions(self, questions: List[Dict[str, Any]]) -> None:
        """Seed or update final assessment questions."""
        with self._connect() as conn:
            conn.execute("DELETE FROM learning_final_questions")
            for q in questions:
                conn.execute(
                    """
                    INSERT INTO learning_final_questions (id, question, options_json, correct_option_index)
                    VALUES (?, ?, ?, ?)
                    """,
                    (str(uuid4()), q["question"], json.dumps(q["options"]), q["correct_option_index"])
                )
            conn.commit()

    def clear_all_learning_data(self) -> None:
        """Wipe all tables related to the curriculum to prevent ID fragmentation."""
        with self._connect() as conn:
            conn.execute("DELETE FROM learning_progress")
            conn.execute("DELETE FROM learning_quizzes")
            conn.execute("DELETE FROM learning_lessons")
            conn.execute("DELETE FROM learning_final_questions")
            conn.commit()

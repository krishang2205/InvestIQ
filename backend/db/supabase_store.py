import json
import os
import time
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

# The python Supabase client requires the "supabase" package.
from supabase import create_client, Client
from db.sqlite_store import PortfolioIdentity

def _utcnow_iso() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"

class SupabaseStore:
    """
    Supabase (PostgreSQL) persistence for production workloads.
    Provides identical interface to SqliteStore.
    Includes aggressive in-memory caching to minimize cloud round-trips.
    """

    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables are required.")
        
        self.supabase: Client = create_client(url, key)
        
        # --- In-Memory Caches ---
        self._portfolio_cache: Optional[PortfolioIdentity] = None
        self._transactions_cache: Optional[List[Dict[str, Any]]] = None
        self._transactions_cache_time: float = 0
        self._transactions_cache_portfolio: Optional[str] = None
        self._instrument_mem_cache: Dict[str, Dict[str, Any]] = {}  # symbol -> {payload, fetched_at}
        
        # Cache TTLs (seconds)
        self._TX_CACHE_TTL = 30  # Transactions refresh every 30s
        self._INSTRUMENT_CACHE_TTL = 3600  # Instruments valid for 1 hour in memory

    def get_or_create_default_portfolio(self) -> PortfolioIdentity:
        # Return cached result immediately - portfolio identity never changes at runtime
        if self._portfolio_cache is not None:
            return self._portfolio_cache
            
        user_id = os.getenv("INVESTIQ_DEFAULT_USER_ID", "local-user")
        portfolio_name = os.getenv("INVESTIQ_DEFAULT_PORTFOLIO_NAME", "Primary Portfolio")

        response = self.supabase.table("portfolios").select("id, user_id").eq("user_id", user_id).order("created_at").limit(1).execute()
        
        if response.data and len(response.data) > 0:
            row = response.data[0]
            self._portfolio_cache = PortfolioIdentity(user_id=row["user_id"], portfolio_id=row["id"])
            return self._portfolio_cache

        portfolio_id = str(uuid4())
        insert_data = {
            "id": portfolio_id,
            "user_id": user_id,
            "name": portfolio_name,
            "currency": "INR",
            "created_at": _utcnow_iso()
        }
        self.supabase.table("portfolios").insert(insert_data).execute()
        self._portfolio_cache = PortfolioIdentity(user_id=user_id, portfolio_id=portfolio_id)
        return self._portfolio_cache

    def list_transactions(self, portfolio_id: str) -> List[Dict[str, Any]]:
        now = time.time()
        # Return cached if fresh
        if (self._transactions_cache is not None 
            and self._transactions_cache_portfolio == portfolio_id
            and (now - self._transactions_cache_time) < self._TX_CACHE_TTL):
            return self._transactions_cache
        
        response = self.supabase.table("transactions") \
            .select("*") \
            .eq("portfolio_id", portfolio_id) \
            .order("transaction_date", desc=False) \
            .order("created_at", desc=False) \
            .execute()
        
        self._transactions_cache = response.data
        self._transactions_cache_time = now
        self._transactions_cache_portfolio = portfolio_id
        return response.data

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

        self.supabase.table("transactions").insert(record).execute()
        # Invalidate transactions cache so next read fetches fresh data
        self._transactions_cache = None
        return record

    def delete_transactions_by_symbol(self, portfolio_id: str, symbol: str) -> bool:
        symbol = symbol.upper()
        response = self.supabase.table("transactions") \
            .delete() \
            .eq("portfolio_id", portfolio_id) \
            .eq("symbol", symbol) \
            .execute()
        # Invalidate transactions cache
        self._transactions_cache = None
        return len(response.data) > 0

    def get_cached_instrument(self, symbol: str, max_age_seconds: int = 86400) -> Optional[Dict[str, Any]]:
        symbol = symbol.upper()
        now = time.time()
        
        # Check in-memory cache first (avoids Supabase round-trip entirely)
        mem = self._instrument_mem_cache.get(symbol)
        if mem and (now - mem["fetched_at"]) < self._INSTRUMENT_CACHE_TTL:
            return mem["payload"]
        
        # Fall back to Supabase
        response = self.supabase.table("instrument_cache").select("*").eq("symbol", symbol).execute()
        if not response.data:
            return None
        
        row = response.data[0]
        try:
            date_str = row["updated_at"]
            if date_str.endswith("Z"):
                date_str = date_str.replace("Z", "+00:00")
            updated_at = datetime.fromisoformat(date_str)
        except Exception:
            return None

        age = (datetime.utcnow() - updated_at.replace(tzinfo=None)).total_seconds()
        if age > max_age_seconds:
            return None

        payload = row["payload_json"]
        if isinstance(payload, str):
            try:
                payload = json.loads(payload)
            except Exception:
                return None
        
        # Store in memory cache
        self._instrument_mem_cache[symbol] = {"payload": payload, "fetched_at": now}
        return payload

    def set_cached_instrument(self, symbol: str, payload: Dict[str, Any]) -> None:
        symbol = symbol.upper()
        record = {
            "symbol": symbol,
            "payload_json": payload,
            "updated_at": _utcnow_iso()
        }
        self.supabase.table("instrument_cache").upsert(record).execute()
        # Also update memory cache
        self._instrument_mem_cache[symbol] = {"payload": payload, "fetched_at": time.time()}

    def preload_instruments_batch(self, symbols: List[str]) -> None:
        """Fetch all instrument cache entries in ONE Supabase query and warm the memory cache."""
        now = time.time()
        # Filter out symbols already in memory cache
        needed = [s.upper() for s in symbols if s.upper() not in self._instrument_mem_cache 
                  or (now - self._instrument_mem_cache[s.upper()].get("fetched_at", 0)) >= self._INSTRUMENT_CACHE_TTL]
        
        if not needed:
            return
        
        # Single batch query using .in_()
        response = self.supabase.table("instrument_cache").select("*").in_("symbol", needed).execute()
        for row in response.data:
            payload = row["payload_json"]
            if isinstance(payload, str):
                try:
                    payload = json.loads(payload)
                except Exception:
                    continue
            self._instrument_mem_cache[row["symbol"]] = {"payload": payload, "fetched_at": now}

    # --- Learning Model Methods ---

    def list_lessons(self, user_id: str) -> List[Dict[str, Any]]:
        # We need to manually perform a left join because the Supabase REST API handles standard joins,
        # but custom left joins on a specific user_id condition are trickier.
        lessons_resp = self.supabase.table("learning_lessons").select("*").order("order_index").execute()
        lessons = lessons_resp.data

        if not lessons:
            return []

        progress_resp = self.supabase.table("learning_progress").select("*").eq("user_id", user_id).execute()
        progress_map = {p["lesson_id"]: p for p in progress_resp.data}

        for l in lessons:
            p = progress_map.get(l["id"])
            if p:
                l["status"] = p["status"]
                l["quiz_score"] = p["quiz_score"]
                l["updated_at"] = p["updated_at"]
            else:
                l["status"] = None
                l["quiz_score"] = None
                l["updated_at"] = None

        return lessons

    def get_lesson_with_quiz(self, lesson_id: str) -> Optional[Dict[str, Any]]:
        lesson_resp = self.supabase.table("learning_lessons").select("*").eq("id", lesson_id).execute()
        if not lesson_resp.data:
            return None
        
        lesson = lesson_resp.data[0]
        
        quizzes_resp = self.supabase.table("learning_quizzes").select("*").eq("lesson_id", lesson_id).order("order_index").execute()
        quizzes = quizzes_resp.data
        
        for q in quizzes:
            # JSONB auto parses
            q["options"] = q["options_json"]
        
        lesson["quizzes"] = quizzes
        return lesson

    def update_learning_progress(self, user_id: str, lesson_id: str, status: str, quiz_score: Optional[int] = None) -> None:
        # Check if exists first to decide whether to update or insert
        check_resp = self.supabase.table("learning_progress").select("*").eq("user_id", user_id).eq("lesson_id", lesson_id).execute()
        
        if check_resp.data:
            # Update
            update_data = {
                "status": status,
                "updated_at": _utcnow_iso()
            }
            if quiz_score is not None:
                update_data["quiz_score"] = quiz_score
                
            self.supabase.table("learning_progress").update(update_data).eq("user_id", user_id).eq("lesson_id", lesson_id).execute()
        else:
            # Insert
            insert_data = {
                "user_id": user_id,
                "lesson_id": lesson_id,
                "status": status,
                "quiz_score": quiz_score,
                "updated_at": _utcnow_iso()
            }
            self.supabase.table("learning_progress").insert(insert_data).execute()

    def get_final_assessment_questions(self) -> List[Dict[str, Any]]:
        resp = self.supabase.table("learning_final_questions").select("*").order("id").execute()
        questions = resp.data
        for q in questions:
             q["options"] = q["options_json"]
        return questions

    def save_final_assessment_result(self, user_id: str, score: int, total: int) -> str:
        assessment_id = str(uuid4())
        record = {
            "id": assessment_id,
            "user_id": user_id,
            "score": score,
            "total_questions": total,
            "completed_at": _utcnow_iso()
        }
        self.supabase.table("learning_assessments").insert(record).execute()
        return assessment_id

    def set_lessons(self, lessons: List[Dict[str, Any]]) -> None:
        for l in lessons:
            record = {
                "id": l["id"],
                "title": l["title"],
                "description": l["description"],
                "video_url": l["video_url"],
                "thumbnail_url": l.get("thumbnail_url"),
                "duration": l.get("duration"),
                "order_index": l["order_index"],
                "created_at": _utcnow_iso()
            }
            self.supabase.table("learning_lessons").upsert(record).execute()

    def set_quizzes(self, lesson_id: str, quizzes: List[Dict[str, Any]]) -> None:
        self.supabase.table("learning_quizzes").delete().eq("lesson_id", lesson_id).execute()
        records = []
        for q in quizzes:
            records.append({
                "id": str(uuid4()),
                "lesson_id": lesson_id,
                "question": q["question"],
                "options_json": q["options"], 
                "correct_option_index": q["correct_option_index"],
                "order_index": q["order_index"]
            })
        if records:
            self.supabase.table("learning_quizzes").insert(records).execute()

    def set_final_questions(self, questions: List[Dict[str, Any]]) -> None:
        # Note: Since there's no TRUNCATE exposed via simple REST, we delete all by filtering on id not null, 
        # or we rely on the specific architecture of the frontend.
        # This deletes all existing rows:
        self.supabase.table("learning_final_questions").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        
        records = []
        for q in questions:
            records.append({
                "id": str(uuid4()),
                "question": q["question"],
                "options_json": q["options"],
                "correct_option_index": q["correct_option_index"]
            })
        if records:
            self.supabase.table("learning_final_questions").insert(records).execute()

    def clear_all_learning_data(self) -> None:
        dummy_uuid = "00000000-0000-0000-0000-000000000000"
        self.supabase.table("learning_progress").delete().neq("user_id", "dummy").execute()
        self.supabase.table("learning_quizzes").delete().neq("id", dummy_uuid).execute()
        self.supabase.table("learning_lessons").delete().neq("id", dummy_uuid).execute()
        self.supabase.table("learning_final_questions").delete().neq("id", dummy_uuid).execute()

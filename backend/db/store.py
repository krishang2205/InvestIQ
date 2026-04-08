import os

# We will lazily instantiate the store so environment variables load first in app.py
_store_instance = None

def get_store():
    global _store_instance
    if _store_instance is None:
        db_type = os.getenv("DB_TYPE", "sqlite").lower()
        if db_type == "supabase":
            from db.supabase_store import SupabaseStore
            _store_instance = SupabaseStore()
        else:
            from db.sqlite_store import SqliteStore
            _store_instance = SqliteStore()
    return _store_instance

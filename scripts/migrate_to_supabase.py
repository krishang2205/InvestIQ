import os
import sys
import sqlite3
from typing import Dict, Any

# Ensure we can import from backend
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from supabase import create_client, Client
from dotenv import load_dotenv

def get_sqlite_conn(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def migrate():
    print("Starting Migration from SQLite to Supabase...")
    
    # Load backend .env because that's where the secrets are
    backend_env_path = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
    load_dotenv(dotenv_path=backend_env_path, override=True)
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        print("Error: SUPABASE_URL and SUPABASE_KEY must be set in backend/.env")
        return
        
    supabase: Client = create_client(supabase_url, supabase_key)
    
    sqlite_db_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'data', 'investiq.sqlite3')
    if not os.path.exists(sqlite_db_path):
        print(f"Error: SQLite database not found at {sqlite_db_path}")
        return
        
    sqlite_conn = get_sqlite_conn(sqlite_db_path)
    
    try:
        print("\n--- Migrating Portfolios ---")
        portfolios = sqlite_conn.execute("SELECT * FROM portfolios").fetchall()
        for p in portfolios:
            pd = dict(p)
            try:
                # Check if exists
                check = supabase.table("portfolios").select("id").eq("id", pd["id"]).execute()
                if check.data:
                    print(f"Portfolio {pd['id']} already exists, skipping.")
                else:
                    supabase.table("portfolios").insert(pd).execute()
                    print(f"Migrated portfolio: {pd['name']} ({pd['id']})")
            except Exception as e:
                print(f"Failed to migrate portfolio {pd['id']}: {e}")
                
        print("\n--- Migrating Transactions ---")
        transactions = sqlite_conn.execute("SELECT * FROM transactions").fetchall()
        for t in transactions:
            td = dict(t)
            try:
                check = supabase.table("transactions").select("id").eq("id", td["id"]).execute()
                if check.data:
                    print(f"Transaction {td['symbol']} ({td['id']}) already exists, skipping.")
                else:
                    supabase.table("transactions").insert(td).execute()
                    print(f"Migrated transaction: {td['symbol']} | Qty: {td['quantity']} | Price: {td['price']}")
            except Exception as e:
                print(f"Failed to migrate transaction {td['id']}: {e}")
                
        print("\n--- Migrating Learning Progress ---")
        progress = sqlite_conn.execute("SELECT * FROM learning_progress").fetchall()
        for p in progress:
            pd = dict(p)
            try:
                check = supabase.table("learning_progress").select("status").eq("user_id", pd["user_id"]).eq("lesson_id", pd["lesson_id"]).execute()
                if check.data:
                    print(f"Learning progress for user {pd['user_id']} lesson {pd['lesson_id']} already exists, skipping.")
                else:
                     supabase.table("learning_progress").insert(pd).execute()
                     print(f"Migrated learning progress for lesson {pd['lesson_id']}")
            except Exception as e:
                print(f"Failed to migrate learning progress for {pd['lesson_id']}: {e}")
                
        print("\nMigration Complete!")
    
    except Exception as e:
        print(f"Migration aborted due to error: {e}")
    finally:
        sqlite_conn.close()

if __name__ == "__main__":
    migrate()

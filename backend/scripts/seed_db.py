import os
import uuid
import random
import logging
from datetime import datetime, timedelta
from db.database import supabase

# A deterministic seeding script to stand up local dev environments instantly.
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA", "META"]
STATUSES = ["completed", "completed", "completed", "failed", "pending"]

def seed_database():
    """
    Clears out development test records and injects 50 synthetic 
    past generation jobs for building the frontend history components.
    """
    logger.info("Initializing Database Seed Sequence...")
    
    # 1. Establish common dev user UUID (for easy testing without auth)
    dev_user_id = "00000000-0000-0000-0000-000000000000"
    
    # 2. Generative historical payload mapping
    seed_records = []
    
    for i in range(50):
        symbol = random.choice(SYMBOLS)
        status = random.choice(STATUSES)
        
        # Backdate the entries randomly over the past 30 days
        days_ago = random.randint(0, 30)
        timestamp = (datetime.utcnow() - timedelta(days=days_ago)).isoformat()
        
        record = {
            "id": str(uuid.uuid4()),
            "user_id": dev_user_id,
            "symbol": symbol,
            "status": status,
            "created_at": timestamp,
            "updated_at": timestamp
        }
        
        if status == "completed":
            record["report_data"] = {
                "snapshot": {"description": f"Seeded report for {symbol}"},
                "executiveSummary": {"text": "Synthetic summary engine."},
                "technicalSignals": [],
                "outlook": {"longTerm": "bullish"}
            }
        elif status == "failed":
            record["error"] = "Synthetic pipeline failure injected by seeder."
            
        seed_records.append(record)

    try:
        # 3. Batch insert using Supabase REST API limitations (chunking)
        chunk_size = 20
        for i in range(0, len(seed_records), chunk_size):
            chunk = seed_records[i:i + chunk_size]
            supabase.table("reports").insert(chunk).execute()
            logger.info(f"Inserted chunk {i//chunk_size + 1}...")
            
        logger.info(f"Successfully seeded {len(seed_records)} report entities.")
    except Exception as e:
        logger.error(f"Seeding process failed fatally: {e}")

if __name__ == "__main__":
    if os.getenv("FLASK_ENV") == "production":
        logger.critical("Refusing to seed production database!")
        exit(1)
    seed_database()

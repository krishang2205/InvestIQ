import sqlite3
import os
import shutil

# Paths
db_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'data', 'investiq.sqlite3')
db_path = os.path.abspath(db_path)
backup_path = f"{db_path}.bak"

if not os.path.exists(db_path):
    print(f"Error: Database file not found at {db_path}")
    exit(1)

# 1. Create a backup
try:
    shutil.copy2(db_path, backup_path)
    print(f"✅ Created database backup at: {backup_path}")
except Exception as e:
    print(f"❌ Failed to create backup: {e}")
    exit(1)

# 2. Perform Migration
try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Update transactions
    print("\nUpdating transactions...")
    cursor.execute("UPDATE transactions SET symbol = 'TMPV' WHERE symbol = 'TATAMOTORS'")
    transactions_updated = cursor.rowcount
    print(f"   -> Updated {transactions_updated} rows in transactions table.")
    
    # Update reports
    print("Updating reports...")
    # Reports might have '.NS' suffix depending on how they were saved
    cursor.execute("UPDATE reports SET symbol = 'TMPV.NS' WHERE symbol = 'TATAMOTORS.NS'")
    reports_updated_ns = cursor.rowcount
    
    cursor.execute("UPDATE reports SET symbol = 'TMPV' WHERE symbol = 'TATAMOTORS'")
    reports_updated_bare = cursor.rowcount
    print(f"   -> Updated {reports_updated_ns + reports_updated_bare} rows in reports table.")
    
    conn.commit()
    print("\n✅ Migration completed successfully.")
    
except Exception as e:
    print(f"\n❌ Migration failed: {e}")
    if conn:
         conn.rollback()
finally:
    if conn:
        conn.close()

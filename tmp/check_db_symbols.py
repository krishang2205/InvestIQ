import sqlite3
import os

db_path = r'c:\Users\Ishan Yogesh Jingar\OneDrive\Desktop\InvestIQ_Final\InvestIQ\backend\data\investiq.sqlite3'

if not os.path.exists(db_path):
    print(f"Error: Database file not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Checking for TATAMOTORS in transactions table...")
cursor.execute("SELECT DISTINCT symbol FROM transactions WHERE symbol LIKE '%TATAMOTORS%'")
rows = cursor.fetchall()
for row in rows:
    print(f"Found symbol in transactions: {row[0]}")

print("\nChecking for TATAMOTORS in reports table...")
cursor.execute("SELECT DISTINCT symbol FROM reports WHERE symbol LIKE '%TATAMOTORS%'")
rows = cursor.fetchall()
for row in rows:
    print(f"Found symbol in reports: {row[0]}")

conn.close()

import os
import argparse
import logging
from datetime import datetime
from db.database import supabase

# CLI tool for database administrative tasks
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseAdminCLI:
    """
    Command Line Interface utility for manipulating Supabase entries,
    cleaning up stale background jobs, and generating admin metrics.
    """
    @staticmethod
    def cleanup_stale_jobs(hours_old: int = 24):
        """Finds jobs that have been 'processing' for too long and marks them failed."""
        logger.info(f"Scanning for stale jobs older than {hours_old} hours...")
        
        try:
            # We fetch all processing jobs and manually filter for now, 
            # though an RPC call via Supabase would be more efficient in prod
            response = supabase.table("reports").select("*").eq("status", "processing").execute()
            stale_count = 0
            
            for job in response.data:
                # Mock date parsing logic
                created_at_date = datetime.fromisoformat(job["created_at"].replace('Z', '+00:00'))
                time_diff = datetime.now(created_at_date.tzinfo) - created_at_date
                
                if time_diff.total_seconds() > (hours_old * 3600):
                    logger.warning(f"Marking job {job['id']} as failed (timeout).")
                    supabase.table("reports").update({
                        "status": "failed",
                        "error": "Job timed out during worker processing phase."
                    }).eq("id", job["id"]).execute()
                    stale_count += 1
                    
            logger.info(f"Cleanup complete. Marked {stale_count} jobs as failed.")
        except Exception as e:
            logger.error(f"Cleanup script failed: {str(e)}")

    @staticmethod
    def generate_metrics():
        logger.info("Generating Database Metrics...")
        try:
            completed = supabase.table("reports").select("id", count="exact").eq("status", "completed").execute()
            failed = supabase.table("reports").select("id", count="exact").eq("status", "failed").execute()
            
            print(f"--- System Metrics ---")
            print(f"Total Completed Reports: {completed.count}")
            print(f"Total Failed Reports: {failed.count}")
            print(f"----------------------")
        except Exception as e:
            logger.error(f"Metrics generation failed: {str(e)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="InvestIQ Database Admin Tools")
    parser.add_argument("--cleanup", type=int, help="Cleanup stale jobs older than X hours")
    parser.add_argument("--metrics", action="store_true", help="Generate db metrics report")
    args = parser.parse_args()
    
    if args.cleanup:
        DatabaseAdminCLI.cleanup_stale_jobs(hours_old=args.cleanup)
    elif args.metrics:
        DatabaseAdminCLI.generate_metrics()
    else:
        parser.print_help()

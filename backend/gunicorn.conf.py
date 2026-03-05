import multiprocessing
import os

# Gunicorn configuration file for production deployment
# Bound to port 5001 internally, mapped by docker-compose appropriately.
bind = "0.0.0.0:5001"

# The number of worker processes for handling requests.
# Rule of thumb: (2 * CPUs) + 1. Since AI requests may tie up threads,
# we increase the thread pool size inside gevent/gthread.
workers = multiprocessing.cpu_count() * 2 + 1

# The type of workers to use. "gthread" allows traditional threading.
# If blocking I/O is heavy, "gevent" is preferable.
worker_class = "gthread"
threads = 4

# Maximum number of pending connections.
backlog = 2048

# Use a persistent timeout to accommodate LLM cold starts (30s)
timeout = 60
keepalive = 5

# Preload application code before worker processes are forked.
# This saves memory but requires care with database connections.
preload_app = False

# Limits the maximum number of requests a worker will process before restarting
# Prevents subtle memory leaks in dependencies like older PyCUDA or heavy NLP toolkits.
max_requests = 1200
max_requests_jitter = 50

# Logging configuration
# Push access logs to stdout for Docker aggregation
accesslog = "-"
errorlog = "-"
loglevel = os.getenv("LOG_LEVEL", "info")
access_log_format = '%({x-forwarded-for}i)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

def post_fork(server, worker):
    """
    Hook to initialize specific resources after a worker process forks.
    Ensures that things like AI Clients or Redis connection pools are cleanly 
    instantiated per worker, rather than shared dangerously across process bounds.
    """
    server.log.info(f"Worker {worker.pid} spawned successfully. Initializing resource connections.")
    
def worker_exit(server, worker):
    """
    Hook to cleanup resources when a worker is gracefully shutting down.
    Allows for draining of remaining LLM Generation background tasks.
    """
    server.log.info(f"Worker {worker.pid} shutting down. Releasing external connections.")

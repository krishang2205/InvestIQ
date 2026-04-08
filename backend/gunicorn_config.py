import os

# Render deployment optimization
port = int(os.environ.get("PORT", 5001))
bind = f"0.0.0.0:{port}"

# To handle concurrent connections from React & LLM API calls appropriately
workers = int(os.environ.get("GUNICORN_WORKERS", 2))
threads = int(os.environ.get("GUNICORN_THREADS", 4))

# Use sync worker class by default, wait up to 120s because LLM generation can occasionally spike over 30s
worker_class = 'gthread'
timeout = 120

# Limit request line size to avoid issues with long prompt requests if any
limit_request_line = 8190

# Standard Render Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

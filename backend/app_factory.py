import logging
from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix

# Import standard architectures generated in previous sprints
from config.settings import conf
from utils.logger import setup_production_logging
from metrics.prometheus import init_metrics_middleware

def create_app(config_override=None):
    """
    Application Factory Pattern.
    Replaces global app instantiation allowing for modular testing, 
    easier migrations, and isolated application states.
    """
    app = Flask(__name__)
    
    # 1. Base Configuration Mapping
    app.config["ENV"] = conf.environment
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024 # 10MB strict limit
    
    if config_override:
        app.config.update(config_override)

    # 2. Enable reverse-proxy safely (for Docker/Nginx/Gunicorn)
    # Required for tracking true Remote IP addresses for rate limiting
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_host=1)

    # 3. Initialize Production Observability Engines
    if not app.config.get("TESTING"):
        setup_production_logging()
    init_metrics_middleware(app)

    # 4. Bind Modular Bounded Contexts (Blueprints)
    from reports.api import reports_v2_bp
    from reports.health import health_bp
    
    app.register_blueprint(reports_v2_bp)
    app.register_blueprint(health_bp)

    # 5. Global Error Handling overriding standard Flask HTML dumps
    @app.errorhandler(404)
    def resource_not_found(e):
        return {"error": "The requested API resource does not exist."}, 404

    @app.errorhandler(500)
    def internal_server_error(e):
        logging.getLogger(__name__).error(f"Unhandled system fault: {e}")
        return {"error": "Critical infrastructure failure."}, 500

    @app.errorhandler(429)
    def rate_limit_handler(e):
        return {"error": "Rate limit exceeded globally. Slow down."}, 429

    logging.getLogger(__name__).info("Application Factory successfully constructed Flask App.")
    return app

# The standard entrypoint expected by Gunicorn
# Executed via `gunicorn 'app_factory:app'`
app = create_app()

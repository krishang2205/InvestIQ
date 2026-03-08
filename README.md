# InvestIQ Production Backend V2

InvestIQ is a comprehensive intelligence platform bridging financial APIs with autonomous multi-agent systems via Google Gemini. This repository contains the high-performance, strictly structured backend services responsible for asynchronous report synthesis and observability.

## Architecture & Domain-Driven Design (DDD)

The project leverages a robust Application Factory Pattern and enforces **Domain-Driven Design (DDD)** principles to separate technical concerns.

Key Modules:
- **`/reports`**: The primary bounded context for the asynchronous Generation system.
  - `orchestrator.py`: Resolves dependencies, writes DB jobs, and spans Thread Workers.
  - `queue/worker.py`: Safe thread pool handling Dead Letter Queues (DLQ).
  - `cache/report_cache.py`: Idempotent API protection reducing token costs mapping matching SHAs within 24h.
  - `ingestion/financial_adapter.py`: Strict integration layer for standard market inputs like yfinance.
- **`/middleware`**: Strict JWT Authorization mechanisms mapping generic UUID scopes.
- **`/docs`**: Full OpenAPI V3 compliant JSON interfaces mapping available routes.

## Local Configuration & Bootstrapping

We utilize pip requirements for local tooling but mandate standard Docker builds for absolute configuration parity.

1. `pip install -r backend/requirements.txt`
2. `export SUPABASE_URL=...` (Or populate `.env`)
3. `flask run --port=5001`

### Running the Tests

A comprehensive end-to-end suite using PyTest asserts application health natively.
```bash
# Validates both Unit and standard REST endpoints without engaging network calls
cd backend/
pytest -v tests/ --cov
```

## Production Docker Deployment

We explicitly utilize **Multi-stage Docker builds** limiting standard vulnerabilities inside our network bound. 

```bash
# Deploys standard Postgres tracking via Alembic configurations
cd backend/
alembic upgrade head

# Initialize the containers mapping Gunicorn onto standard VPC local interfaces
./scripts/deploy.sh
```

## Security & Rate Limiting

This system strictly mandates generic API interactions behind a `TokenBucket` algorithm ensuring that we do not overload underlying provider networks. All prompt data passes through `SecuritySanitizer` eliminating arbitrary script execution logic or jailbreak vulnerabilities mapped heavily inside traditional generic AI wrappers.

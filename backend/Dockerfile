# --------- BUILDER STAGE ---------
# Using a slim python foundational image for reduced attack surface
FROM python:3.10-slim AS builder

WORKDIR /app

# Install system-level dependencies required for building C-extensions
# like asyncpg, psycopg2, or heavy ML libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install specific versions of core Python dependencies to validate hashes
COPY requirements.txt .

# We compile the wheels to /app/wheels, rather than installing them directly
# This isolates build-time artifacts from the final production layer
# and produces a significantly smaller, more secure container boundary.
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt


# --------- PRODUCTION STAGE ---------
FROM python:3.10-slim AS runner

# Run as an unprivileged user for security compliance (CIS benchmark)
# System processes should never run as root when connecting externally
RUN groupadd -r investiq && useradd -r -g investiq investiquser

WORKDIR /app

# Explicitly copy over the pre-compiled packages from the builder stage
COPY --from=builder /app/wheels /wheels

# Install the wheels without requiring gcc/build-essential
RUN pip install --no-cache /wheels/*

# Copy the actual application logic, yielding ownership immediately
COPY --chown=investiquser:investiq . /app/

# Remove the default flask development server port and expose the Gunicorn port
EXPOSE 5001

# Swap from root to the secure limited user context
USER investiquser

# Configure Python bytecode writing semantics to prevent permission errors
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Launch the Application Service via the explicit Gunicorn configuration file
CMD ["gunicorn", "-c", "gunicorn.conf.py", "app:app"]

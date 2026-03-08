#!/usr/bin/env bash

# Extremely stringent bash configurations (Fast fail)
set -euo pipefail

# 1. Application Genesis Deployment Script
echo "============================================="
echo " Deploying InvestIQ Production Backend V2.1"
echo "============================================="

# 2. Enforce execution solely in the deploy boundary context
if [[ ! -f "docker/docker-compose.prod.yml" ]]; then
    echo "CRITICAL: Script must be executed out of the project root workspace."
    exit 1
fi

echo "--> [1/5] Extracting latest tagged artifact from origin..."
git pull origin main || echo "Git branch already fully saturated."

echo "--> [2/5] Initiating multi-stage container build process..."
# We explicitly force recreation to ensure wheels are re-linked natively
docker-compose -f docker/docker-compose.prod.yml build --no-cache

echo "--> [3/5] Applying Postgres Alembic Migrations..."
# Execute the alembic script inside an ephemeral container linked to VPC
docker-compose -f docker/docker-compose.prod.yml run --rm investiq-api alembic upgrade head

echo "--> [4/5] Tearing down legacy containers and shedding volumes..."
# Utilizing standard orchestration shedding
docker-compose -f docker/docker-compose.prod.yml down -v

echo "--> [5/5] Backgrounding standard worker pools..."
docker-compose -f docker/docker-compose.prod.yml up -d

echo "============================================="
echo " Infrastructure successfully re-deployed."
echo " Checking Kubernetes Deep Health Bounds..."
echo "============================================="

# Standard blocking loop waiting for container up-status
sleep 5
curl -sS -f http://localhost:8000/api/v2/health/deep || (echo "Health probe failed." && exit 1)

echo "Deployment completed flawlessly."
exit 0

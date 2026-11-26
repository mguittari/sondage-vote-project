#!/bin/bash
# Une base par microservice : aucun service ne lit la base d'un autre.
set -euo pipefail
for svc in auth metier; do
  psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -c "CREATE DATABASE $svc"
  psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$svc" -f "/schemas/$svc.sql"
done

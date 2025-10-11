#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
until npx prisma db push --skip-generate --accept-data-loss 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "Database schema is ready!"
echo "Starting Next.js application..."
exec "$@"

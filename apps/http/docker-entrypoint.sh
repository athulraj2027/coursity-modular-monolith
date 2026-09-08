#!/bin/sh
set -e

echo "🚀 [Backend Entrypoint] Synchronizing database schema with Prisma..."
npx prisma db push --skip-generate

echo "✅ [Backend Entrypoint] Database schema synchronized successfully."

exec "$@"

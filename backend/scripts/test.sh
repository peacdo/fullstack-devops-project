#!/bin/bash

# Wait for PostgreSQL to be ready
until PGPASSWORD=postgres psql -h postgres -U postgres -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

# Create test database if it doesn't exist
PGPASSWORD=postgres psql -h postgres -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'library_test'" | grep -q 1 || PGPASSWORD=postgres psql -h postgres -U postgres -c "CREATE DATABASE library_test"

# Run migrations
NODE_ENV=test npx prisma migrate deploy

# Run tests
NODE_ENV=test jest $@ 
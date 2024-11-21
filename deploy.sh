#!/bin/bash
echo "Starting deployment process..."

# Check environment variables
echo "Checking environment variables..."
npm run check:env

# Check database connection
echo "Checking database connection..."
npm run check:db

# Run migrations
echo "Running database migrations..."
npm run migration:run

# Start application
echo "Starting application..."
npm run start:prod
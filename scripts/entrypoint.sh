#!/bin/bash
set -e

echo "📦 Running entrypoint script..."

# Run Go server if built, fallback to node if needed
if [ -f /app/server ]; then
  exec ./server
elif [ -f ingest/setupMeili.js ]; then
  node ingest/setupMeili.js
  exec sleep infinity
else
  echo "❌ No executable found"
  exec sleep infinity
fi

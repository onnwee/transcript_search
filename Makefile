# Load environment from .env (for local dev tools)
ifneq (,$(wildcard .env))
  include .env
  export
endif

# 🐳 Start Docker containers
start:
	docker-compose up -d
	@echo "⏳ Waiting for Postgres..."
	until docker exec transcript_pg pg_isready -U postgres > /dev/null 2>&1; do sleep 1; done
	@echo "✅ Postgres is ready."

# 🧱 Apply DB schema
schema:
	docker exec -i transcript_pg psql -U postgres -d transcripts < schema.sql
	@echo "📄 Schema applied."

# 🔧 Setup Meilisearch index settings
meili-setup:
	docker-compose run --rm meili_setup

# 🌱 Ingest recent videos
ingest-all:
	docker-compose exec ingest node ingest/ingest_all.js

# 🔍 Quick test query
test-db:
	docker exec -i transcript_pg psql -U postgres -d transcripts -c "SELECT video_id, video_title FROM videos LIMIT 5;"

# 💥 Stop all containers
stop:
	docker-compose down

# 📜 Logs
logs:
	docker-compose logs -f

# 🧪 Meilisearch health check
meili-health:
	curl --silent --fail http://localhost:7700/health && echo "✅ Meilisearch is healthy." || (echo "❌ Meilisearch not reachable." && exit 1)

# 🧪 Ingest service test
test:
	cd ingest && npx vitest run

# 📈 Coverage report
coverage: test
	@echo "📂 Opening local coverage report..."
	@xdg-open file://$(shell pwd)/ingest/coverage/index.html 2>/dev/null || \
     open ingest/coverage/index.html || \
     echo "👉 Open manually: ingest/coverage/index.html"

# 🔄 Reset database
reset:
	docker exec -i transcript_pg psql -U postgres -d transcripts < reset.sql

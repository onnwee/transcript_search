# Load environment from .env (for local dev tools)
ifneq (,$(wildcard .env))
  -include .env
endif

.PHONY: dev start schema ingest test-db stop restart logs meili-health test coverage reset

# 🎯 Full local dev environment
dev:
	docker-compose up -d
	@echo "⏳ Waiting for Postgres..."
	node scripts/wait-for-postgres.js
	@echo "✅ Postgres is ready."
	docker exec -i transcript_pg psql -U postgres -d transcripts < schema.sql
	@echo "📄 Schema applied."
	sleep 5
	docker-compose exec backend node batch.js
	curl --silent --fail http://localhost:7700/health && echo "✅ Meilisearch is healthy." || (echo "❌ Meilisearch not reachable." && exit 1)

# 🐳 Start Docker services
start:
	docker-compose up -d
	@echo "⏳ Waiting for Postgres..."
	until docker exec transcript_pg pg_isready -U postgres > /dev/null 2>&1; do sleep 1; done
	@echo "✅ Postgres is ready."

# 🧱 Apply schema
schema:
	docker exec -i transcript_pg psql -U postgres -d transcripts < schema.sql
	@echo "📄 Schema applied."

# 🌱 Seed recent videos
ingest:
	docker-compose exec backend node batch.js

# 🧪 Run DB test query
test-db:
	docker exec -i transcript_pg psql -U postgres -d transcripts -c "SELECT video_id, video_title FROM videos LIMIT 5;"

# 💥 Stop and remove containers
stop:
	docker-compose down -v

# 🔁 Restart environment
restart: stop dev

# 📜 View logs
logs:
	docker-compose logs -f

# 🔎 Check Meilisearch health
meili-health:
	curl --silent --fail http://localhost:7700/health && echo "✅ Meilisearch is healthy." || (echo "❌ Meilisearch not reachable." && exit 1)

# 🧪 Run all ingest tests with coverage
test:
	cd ingest && npx vitest run

# 🧪 Run tests and open coverage report
coverage: test
	@echo "📂 Opening local coverage report..."
	@xdg-open file://$(shell pwd)/ingest/coverage/index.html 2>/dev/null || \
     open ingest/coverage/index.html || \
     echo "👉 Open manually: ingest/coverage/index.html"

reset:
	docker exec -i transcript_pg psql -U postgres -d transcripts < reset.sql

# Load environment from .env (for local dev tools)
ifneq (,$(wildcard .env))
  include .env
  export
endif

# Forward common Docker build env toggles if provided by the user.
# - COMPOSE_BAKE=true lets docker compose use Buildx Bake for builds
# - DOCKER_BUILDKIT=1 enables BuildKit
# - COMPOSE_DOCKER_CLI_BUILD=1 uses Docker CLI for building
export COMPOSE_BAKE
export DOCKER_BUILDKIT
export COMPOSE_DOCKER_CLI_BUILD

# Select docker compose CLI: prefer plugin (`docker compose`), fallback to legacy (`docker-compose`)
DOCKER_COMPOSE ?= $(shell docker compose version >/dev/null 2>&1 && echo "docker compose" || (docker-compose version >/dev/null 2>&1 && echo docker-compose || echo ""))
ifeq ($(DOCKER_COMPOSE),)
$(error Neither `docker compose` nor `docker-compose` is available in PATH)
endif

# Default database name if not provided via .env
POSTGRES_DB ?= transcripts

.PHONY: start build schema meili-setup ingest-all backfill-sentences test-db stop logs meili-health test coverage reset

# 🐳 Start Docker containers
start:
	# Ensure external network `web` exists (compose expects it for reverse proxy setups)
	@if ! docker network ls --format '{{.Name}}' | grep -Fxq web; then \
		echo "Creating external docker network 'web'"; \
		docker network create web; \
	fi
	# If you want to force rebuild during start: make start BUILD=1
	$(DOCKER_COMPOSE) up -d $(if $(BUILD),--build,)
	@echo "⏳ Waiting for Postgres..."
	until docker exec transcript_pg pg_isready -U postgres > /dev/null 2>&1; do sleep 1; done
	@echo "✅ Postgres is ready."

# 🏗️ Build images (honors COMPOSE_BAKE=true when set)
build:
	$(DOCKER_COMPOSE) build

# 🧱 Apply DB schema
schema:
	docker exec -i transcript_pg psql -U postgres -d $(POSTGRES_DB) < schema.sql
	@echo "📄 Schema applied."

# 🔧 Setup Meilisearch index settings
meili-setup:
	$(DOCKER_COMPOSE) run --rm meili_setup

# 🌱 Ingest recent videos
ingest-all:
	$(DOCKER_COMPOSE) exec ingest node ingest/ingest_all.js

# 🧱 Backfill transcript sentences (optionally pass VIDEO_IDs after --)
backfill-sentences:
	$(DOCKER_COMPOSE) exec ingest node ingest/backfill_sentences.js

# 🔍 Quick test query
test-db:
	docker exec -i transcript_pg psql -U postgres -d transcripts -c "SELECT video_id, video_title FROM videos LIMIT 5;"

# 💥 Stop all containers
stop:
	$(DOCKER_COMPOSE) down

# 📜 Logs
logs:
	$(DOCKER_COMPOSE) logs -f

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

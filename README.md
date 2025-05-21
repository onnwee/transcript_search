# 🎙️ Transcript Search

A full-stack application for ingesting, formatting, and searching YouTube video transcripts. Built for speed, usability, and extensibility.

---

## 📦 Project Structure

- ✅ **Fetch from YouTube** using `youtube-transcript`
- 🧐 **No AI Required**: Uses lightweight NLP for punctuation & formatting
- 🤖 **Still Loads an AI container**: LMAO
- 🧹 **Cleaner**: Doesn't really work great right now
- 🔍 **Fast Fuzzy Search** powered by Meilisearch
- 🚧 **Containerized** with Docker Compose for isolated services
- ⚖️ **PostgreSQL Storage** of full transcript and segment-level access

---

### Clone & Configure

```bash
git clone https://github.com/yourname/transcript_search.git
cd transcript_search/ingest
npm install
cd ../frontend
npm install
cd ..
docker-compose up --build -dmake
make schema
make ingest
```

### Example .env

#### _!place the .env in root and /ingest & don't ask questions!_

```dotenv
YOUTUBE_API_KEY=
YOUTUBE_CHANNEL_ID=
YOUTUBE_PUBLISHED_AFTER=
DEEPSEEK_API_KEY=
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=masterKey
```

### systemd

```sh
journalctl -u transcript-batch.service --since "1 hour ago"
systemctl list-timers
```

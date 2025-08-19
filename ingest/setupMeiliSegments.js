import "dotenv/config";
import axios from "axios";
import { configureSegmentIndex } from "./utils/meili.js";

const MEILI_HOST = process.env.MEILISEARCH_HOST || "http://localhost:7700";
const MEILI_API_KEY = process.env.MEILISEARCH_API_KEY || "masterKey";
const INDEX_NAME = process.env.MEILI_SEGMENT_INDEX || "transcript_sentences";

const headers = {
  "X-Meili-API-Key": MEILI_API_KEY,
  "Content-Type": "application/json",
};

async function ensureIndex() {
  try {
    await axios.get(`${MEILI_HOST}/indexes/${INDEX_NAME}`, { headers });
    console.log(`📦 Index '${INDEX_NAME}' exists`);
  } catch (err) {
    if (err.response?.status === 404) {
      console.log(`📁 Creating index '${INDEX_NAME}'...`);
      await axios.post(
        `${MEILI_HOST}/indexes`,
        { uid: INDEX_NAME, primaryKey: "id" },
        { headers }
      );
      console.log(`✅ Created index '${INDEX_NAME}'`);
    } else {
      throw err;
    }
  }
}

async function run() {
  console.log(`⚙️ Connecting to Meilisearch at ${MEILI_HOST}`);
  await ensureIndex();
  await configureSegmentIndex();
  console.log("✅ Segment index configured");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((e) => {
    console.error("❌ Meili segment setup failed:", e.message);
    if (e.response?.data) console.error("📄 Meili response:", e.response.data);
    process.exit(1);
  });
}

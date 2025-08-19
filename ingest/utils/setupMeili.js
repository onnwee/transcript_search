// setupMeili.js
import axios from "axios";
import "dotenv/config";
import { configureSegmentIndex } from "./meili.js";

const MEILI_HOST = process.env.MEILISEARCH_HOST || "http://localhost:7700";
const MEILI_API_KEY = process.env.MEILISEARCH_API_KEY || "masterKey";
const INDEX_NAME = "transcripts";
const SEGMENT_INDEX = process.env.MEILI_SEGMENT_INDEX || "transcript_sentences";

const headers = {
  Authorization: `Bearer ${MEILI_API_KEY}`,
  "Content-Type": "application/json",
};

async function ensureIndex(uid) {
  try {
    await axios.get(`${MEILI_HOST}/indexes/${uid}`, { headers });
    console.log(`📦 Index '${uid}' already exists`);
    return;
  } catch (err) {
    if (err.response?.status !== 404) throw err;
  }
  console.log(`📁 Creating index '${uid}'...`);
  await axios.post(
    `${MEILI_HOST}/indexes`,
    { uid, primaryKey: "id" },
    { headers }
  );
  console.log(`✅ Created index '${uid}'`);
}

async function setupMeili() {
  try {
    console.log(`⚙️ Connecting to Meilisearch at ${MEILI_HOST}`);

    await ensureIndex(INDEX_NAME);

    // Patch settings
    console.log("🔧 Updating index settings...");
    await axios.patch(
      `${MEILI_HOST}/indexes/${INDEX_NAME}/settings`,
      {
        searchableAttributes: ["title", "transcript"],
        displayedAttributes: ["id", "title", "transcript"],
        stopWords: [
          "a",
          "an",
          "the",
          "and",
          "or",
          "but",
          "if",
          "then",
          "else",
          "when",
          "at",
          "by",
          "for",
          "in",
          "of",
          "on",
          "to",
          "up",
          "with",
          "as",
          "is",
          "it",
          "be",
          "are",
          "was",
          "were",
          "been",
          "so",
          "from",
          "this",
          "that",
          "these",
          "those",
        ],
        synonyms: {
          ai: ["a.i.", "artificial intelligence"],
          llm: ["large language model", "large-language model"],
          gpu: ["graphics processing unit", "graphics card"],
          youtube: ["yt"],
          usa: ["u.s.", "u.s.a.", "united states", "america"],
          uk: ["u.k.", "united kingdom", "britain", "great britain"],
          vs: ["versus", "v."],
          tv: ["t.v."],
          twitch: ["twitch.tv", "ttv", "live stream", "livestream", "stream"],
          vod: ["VOD", "past broadcast", "recording"],
          hasanabi: ["hasan abi", "hasan", "hasan piker", "hasanpiker"],
          central_committee: [
            "central committee",
            "centralcommittee",
            "mike_from_pa",
            "mike from pa",
            "mikefrompa",
          ],
        },
      },
      { headers }
    );

    await axios.patch(
      `${MEILI_HOST}/indexes/${INDEX_NAME}/settings/typo-tolerance`,
      { enabled: true },
      { headers }
    );

    // Ensure and configure segment index as well
    await ensureIndex(SEGMENT_INDEX);
    await configureSegmentIndex();
    console.log(`✅ Segment index '${SEGMENT_INDEX}' configured`);

    console.log("✅ Meilisearch index is ready");
  } catch (err) {
    console.error("❌ Meilisearch setup failed:", err.message);
    if (err.response?.data) {
      console.error("📄 Meili response:", err.response.data);
    }
    process.exit(1);
  }
}

setupMeili();

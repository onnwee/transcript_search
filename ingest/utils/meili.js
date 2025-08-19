import "dotenv/config";

import axios from "axios";
import { logger } from "./logger.js";

/**
 * Index a single video document in the 'transcripts' index.
 * Note: Uses Authorization: Bearer header (compatible with Meili v1.x).
 */
export async function indexTranscript(video_id, title, transcript) {
  const index = "transcripts";
  console.log(
    "📡 Indexing URL:",
    `${process.env.MEILISEARCH_HOST}/indexes/${index}/documents`
  );
  // Avoid printing full secrets; show a short fingerprint only
  const k = process.env.MEILISEARCH_API_KEY || "";
  const masked = k ? `${k.slice(0, 4)}…${k.slice(-3)}` : "<empty>";
  console.log("🔑 API Key:", masked);
  try {
    const res = await axios.post(
      `${process.env.MEILISEARCH_HOST}/indexes/${index}/documents`,
      [{ id: video_id, title, transcript }],
      {
        headers: {
          Authorization: `Bearer ${process.env.MEILISEARCH_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    logger.info(`📨 Meili indexing task queued for ${video_id}`, res.data);
    return res.data;
  } catch (err) {
    logger.error(`❌ Meili indexing failed for ${video_id}:`, err.message);
    if (err.response?.data) {
      logger.error("📄 Meili response:", err.response.data);
    }
    throw err;
  }
}

/**
 * Configure the 'transcripts' index settings: searchable/displayed, stopWords, synonyms.
 */
export async function configureIndex() {
  const index = "transcripts";
  await axios.patch(
    `${process.env.MEILISEARCH_HOST}/indexes/${index}/settings`,
    {
      searchableAttributes: ["title", "transcript"],
      displayedAttributes: ["title", "transcript"],
      // Basic English stop-words to reduce noise
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
      // Helpful synonyms for common acronyms and variations
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
        // Politics & current events
        // Politics & current events
        potus: [
          "president",
          "u.s. president",
          "president of the united states",
        ],
        scotus: ["supreme court", "u.s. supreme court"],
        congress: [
          "u.s. congress",
          "us congress",
          "capitol hill",
          "house and senate",
        ],
        house: ["house of representatives", "the house"],
        senate: ["u.s. senate", "the senate"],
        gop: ["republican party", "republicans", "grand old party"],
        republicans: ["gop", "republican party"],
        democrats: ["democratic party", "dems"],
        doj: ["department of justice"],
        dod: ["department of defense", "pentagon"],
        epa: ["environmental protection agency"],
        irs: ["internal revenue service"],
        fbi: ["federal bureau of investigation"],
        cia: ["central intelligence agency"],
        white_house: ["white house", "west wing"],
        election: ["elections", "vote", "voting", "polls"],
        primary: ["primaries"],
        midterms: ["midterm elections"],
        ukraine: ["ukraine war", "russia ukraine war", "russo-ukrainian war"],
        israel: [
          "israel-palestine",
          "israeli-palestinian",
          "gaza war",
          "gaza conflict",
        ],
        roe_v_wade: ["roe", "roe v. wade"],
        dobbs: ["dobbs decision", "dobbs v. jackson"],
        aca: ["affordable care act", "obamacare"],
        covid: ["coronavirus", "sars-cov-2", "pandemic"],
        ira: ["inflation reduction act"],
        student_loans: ["student debt"],
        january_6: ["jan 6", "j6", "capitol riot"],
        blm: ["black lives matter"],
        lgbtq: ["lgbt", "lgbtq+", "queer community"],
        trans: ["transgender", "trans people"],
        climate_change: ["global warming", "climate crisis"],
        immigration: ["migrants", "migration", "border", "asylum"],
        border_security: [
          "border patrol",
          "cbp",
          "customs and border protection",
        ],
        isis: ["isil", "daesh"],
        nytimes: ["new york times", "nyt"],
        wapo: ["washington post", "the washington post"],
        wsj: ["wall street journal"],
        fox: ["fox news"],
        bbc: ["bbc news"],
        cnn: ["cnn news"],
        msnbc: ["msnbc news"],
        biden: ["joe biden", "president biden", "potus"],
        trump: ["donald trump", "president trump", "45"],
        kamala: ["kamala harris", "vice president harris", "vp harris"],
        desantis: ["ron desantis", "gov desantis", "governor desantis"],
        newsom: ["gavin newsom", "gov newsom", "governor newsom"],
        bernie: ["bernie sanders", "sen sanders", "senator sanders"],
        aoc: ["alexandria ocasio-cortez"],
        mtg: ["marjorie taylor greene"],
        boebert: ["lauren boebert"],
        mcconnell: ["mitch mcconnell", "sen mcconnell", "senator mcconnell"],
        mccarthy: ["kevin mccarthy", "speaker mccarthy"],
        wapo: ["washington post", "the washington post"],
        wsj: ["wall street journal"],
        fox: ["fox news"],
        bbc: ["bbc news"],
        cnn: ["cnn news"],
        msnbc: ["msnbc news"],
        biden: ["joe biden", "president biden", "potus"],
        trump: ["donald trump", "president trump", "45"],
        kamala: ["kamala harris", "vice president harris", "vp harris"],
        desantis: ["ron desantis", "gov desantis", "governor desantis"],
        newsom: ["gavin newsom", "gov newsom", "governor newsom"],
        bernie: ["bernie sanders", "sen sanders", "senator sanders"],
        aoc: ["alexandria ocasio-cortez"],
        mtg: ["marjorie taylor greene"],
        boebert: ["lauren boebert"],
        mcconnell: ["mitch mcconnell", "sen mcconnell", "senator mcconnell"],
        mccarthy: ["kevin mccarthy", "speaker mccarthy"],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.MEILISEARCH_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Configure the sentence-level index settings.
 * Uses Authorization: Bearer header (Meili v1.x recommended).
 */
export async function configureSegmentIndex() {
  const index = process.env.MEILI_SEGMENT_INDEX || "transcript_sentences";
  await axios.patch(
    `${process.env.MEILISEARCH_HOST}/indexes/${index}/settings`,
    {
      searchableAttributes: ["text", "title"],
      displayedAttributes: [
        "id",
        "video_id",
        "title",
        "text",
        "start",
        "end",
        "published_at",
      ],
      filterableAttributes: ["video_id", "published_at"],
      pagination: { maxTotalHits: 2000 },
      // Basic English stop-words to reduce noise in queries
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
      // Helpful synonyms for common acronyms and variations
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
        // Politics & current events
        potus: [
          "president",
          "u.s. president",
          "president of the united states",
        ],
        scotus: ["supreme court", "u.s. supreme court"],
        congress: [
          "u.s. congress",
          "us congress",
          "capitol hill",
          "house and senate",
        ],
        house: ["house of representatives", "the house"],
        senate: ["u.s. senate", "the senate"],
        gop: ["republican party", "republicans", "grand old party"],
        republicans: ["gop", "republican party"],
        democrats: ["democratic party", "dems"],
        doj: ["department of justice"],
        dod: ["department of defense", "pentagon"],
        epa: ["environmental protection agency"],
        irs: ["internal revenue service"],
        fbi: ["federal bureau of investigation"],
        cia: ["central intelligence agency"],
        white_house: ["white house", "west wing"],
        election: ["elections", "vote", "voting", "polls"],
        primary: ["primaries"],
        midterms: ["midterm elections"],
        ukraine: ["ukraine war", "russia ukraine war", "russo-ukrainian war"],
        israel: [
          "israel-palestine",
          "israeli-palestinian",
          "gaza war",
          "gaza conflict",
        ],
        roe_v_wade: ["roe", "roe v. wade"],
        dobbs: ["dobbs decision", "dobbs v. jackson"],
        aca: ["affordable care act", "obamacare"],
        covid: ["coronavirus", "sars-cov-2", "pandemic"],
        ira: ["inflation reduction act"],
        student_loans: ["student debt"],
        january_6: ["jan 6", "j6", "capitol riot"],
        blm: ["black lives matter"],
        lgbtq: ["lgbt", "lgbtq+", "queer community"],
        trans: ["transgender", "trans people"],
        climate_change: ["global warming", "climate crisis"],
        immigration: ["migrants", "migration", "border", "asylum"],
        border_security: [
          "border patrol",
          "cbp",
          "customs and border protection",
        ],
        isis: ["isil", "daesh"],
        nytimes: ["new york times", "nyt"],
        wapo: ["washington post", "the washington post"],
        wsj: ["wall street journal"],
        fox: ["fox news"],
        bbc: ["bbc news"],
        cnn: ["cnn news"],
        msnbc: ["msnbc news"],
        biden: ["joe biden", "president biden", "potus"],
        trump: ["donald trump", "president trump", "45"],
        kamala: ["kamala harris", "vice president harris", "vp harris"],
        desantis: ["ron desantis", "gov desantis", "governor desantis"],
        newsom: ["gavin newsom", "gov newsom", "governor newsom"],
        bernie: ["bernie sanders", "sen sanders", "senator sanders"],
        aoc: ["alexandria ocasio-cortez"],
        mtg: ["marjorie taylor greene"],
        boebert: ["lauren boebert"],
        mcconnell: ["mitch mcconnell", "sen mcconnell", "senator mcconnell"],
        mccarthy: ["kevin mccarthy", "speaker mccarthy"],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.MEILISEARCH_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Bulk index sentence documents into the segment index.
 * @param {Array<{id:string, video_id:string, title:string, text:string, start:number, end:number, published_at?:string}>} docs
 */
export async function indexSentenceDocuments(docs) {
  const index = process.env.MEILI_SEGMENT_INDEX || "transcript_sentences";
  const res = await axios.post(
    `${process.env.MEILISEARCH_HOST}/indexes/${index}/documents`,
    docs,
    {
      headers: {
        Authorization: `Bearer ${process.env.MEILISEARCH_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  logger.info(`📨 Meili segment indexing task queued`, res.data);
  return res.data;
}

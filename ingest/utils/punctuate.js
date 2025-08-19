import "dotenv/config";
import axios from "axios";
import pMap from "p-map";
import { logger } from "./logger.js";

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_CONCURRENCY = parseInt(
  process.env.PUNCTUATOR_CONCURRENCY || "3",
  10
);

/** Quick health check for the punctuator service. */
export async function punctuatorHealthcheck() {
  const base = getPunctuatorBaseUrl();
  try {
    const res = await axios.get(`${base}/health`, { timeout: 5_000 });
    return res.status === 200;
  } catch (e) {
    return false;
  }
}

/** Resolve base URL for the punctuator service (docker vs local). */
function getPunctuatorBaseUrl() {
  return (
    process.env.PUNCTUATOR_URL ||
    (process.env.DOCKER_ENV
      ? "http://punctuator:8000"
      : "http://localhost:8000")
  );
}

/**
 * Punctuate a single chunk with retries and backoff.
 * Returns original text on persistent failure to keep pipeline moving.
 */
async function punctuateOne(
  text,
  baseUrl,
  retries = 3,
  timeout = DEFAULT_TIMEOUT_MS
) {
  let attempt = 0;
  // Exponential backoff with jitter
  const backoff = async (n) =>
    new Promise((r) =>
      setTimeout(r, Math.min(10_000, 500 * 2 ** n) + Math.random() * 250)
    );

  while (attempt < retries) {
    try {
      const res = await axios.post(
        `${baseUrl}/punctuate`,
        { text },
        { timeout }
      );
      return res.data?.result || text;
    } catch (err) {
      attempt += 1;
      const status = err.response?.status;
      const isRetryable = !status || status >= 500 || status === 429;
      logger.warn("punctuateOne failure", {
        attempt,
        status,
        message: err.message,
      });
      if (!isRetryable || attempt >= retries) return text; // fallback to original
      await backoff(attempt);
    }
  }
  return text;
}

/**
 * Punctuate an array of text chunks with concurrency control.
 * @param {string[]} segments
 * @param {{concurrency?:number,retries?:number,timeoutMs?:number}} opts
 */
export async function punctuateSentences(segments, opts = {}) {
  const base = getPunctuatorBaseUrl();
  logger.info("PUNCTUATOR_URL", base);
  const concurrency = opts.concurrency || DEFAULT_CONCURRENCY;
  const retries = opts.retries ?? 3;
  const timeout = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const results = await pMap(
    segments,
    (text) => punctuateOne(text, base, retries, timeout),
    {
      concurrency,
    }
  );

  logger.info("Punctuation completed", { total: segments.length });
  return results;
}

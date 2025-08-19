import Bottleneck from "bottleneck";
import { logger } from "./logger.js";

// Simple, configurable limiter for YouTube requests.
// - One request at a time by default.
// - Gap between calls via minTime.
// - Special backoff on captcha errors.
const minTime = parseInt(process.env.YT_MIN_DELAY_MS || "500", 10);
const limiter = new Bottleneck({ maxConcurrent: 1, minTime });

function isCaptchaError(err) {
  const msg = String(err?.message || "");
  return (
    msg.includes("captcha") ||
    msg.includes("too many requests") ||
    msg.includes("429")
  );
}

export async function limitYouTube(fn) {
  try {
    return await limiter.schedule(fn);
  } catch (err) {
    if (isCaptchaError(err)) {
      const backoffMs = parseInt(
        process.env.YT_CAPTCHA_BACKOFF_MS || "60000",
        10
      );
      logger.warn(
        `🛑 CAPTCHA/RATE detected. Backing off for ${backoffMs}ms before continuing...`
      );
      await new Promise((r) => setTimeout(r, backoffMs));
    }
    throw err;
  }
}

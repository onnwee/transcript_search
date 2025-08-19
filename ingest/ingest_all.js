import "dotenv/config";

import { getAllVideos } from "./utils/youtube.js";
import { ingestVideo } from "./utils/ingest.js";
import { logger } from "./utils/logger.js";
import pMap from "p-map";
import pRetry from "p-retry";

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}

export async function run() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!channelId) {
    logger.error("❌ Missing YOUTUBE_CHANNEL_ID in .env");
    process.exit(1);
  }

  const concurrency = parseInt(process.env.INGEST_CONCURRENCY || "2", 10);
  let videos = await getAllVideos(channelId);
  const limit = parseInt(process.env.INGEST_LIMIT || "0", 10);
  if (limit > 0) {
    videos = videos.slice(0, limit);
  }

  let completed = 0;
  let skipped = 0;
  console.log(
    `📺 Found ${videos.length} videos to ingest (concurrency: ${concurrency})`
  );

  const retryMinTimeout = parseInt(
    process.env.INGEST_RETRY_MIN_TIMEOUT_MS || "2000",
    10
  );
  const retryFactor = parseFloat(process.env.INGEST_RETRY_FACTOR || "2");
  const retries = parseInt(process.env.INGEST_RETRIES || "3", 10);

  await pMap(
    videos,
    async (video) => {
      try {
        const ok = await pRetry(() => ingestVideo(video), {
          retries,
          factor: retryFactor,
          minTimeout: retryMinTimeout,
          onFailedAttempt: (error) => {
            console.warn(
              `🔁 Retry ${error.attemptNumber} for ${video.video_id}: ${error.message}`
            );
          },
        });
        if (ok) {
          completed++;
          console.log(`✅ [${completed}/${videos.length}] ${video.video_id}`);
        } else {
          skipped++;
          console.log(`⏭️ [skip ${skipped}] ${video.video_id}`);
        }
      } catch (err) {
        console.error(`❌ Failed permanently: ${video.video_id}`, err.message);
      }
    },
    { concurrency }
  );

  console.log(
    `🎉 Done. ${completed}/${videos.length} succeeded. ${skipped} skipped.`
  );
}

import 'dotenv/config';
import pMap from 'p-map';
import pRetry from 'p-retry';

import { ingestVideo } from './utils/ingest.js';
import { getAllVideos } from './utils/youtube.js';

if (import.meta.url === `file://${process.argv[1]}`) {
    run();
}

export async function run() {
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    if (!channelId) {
        console.error('❌ Missing YOUTUBE_CHANNEL_ID in .env');
        process.exit(1);
    }

    const concurrency = parseInt(process.env.INGEST_CONCURRENCY || '2', 10);
    const videos = await getAllVideos(channelId);

    let completed = 0;
    console.log(
        `📺 Found ${videos.length} videos to ingest (concurrency: ${concurrency})`
    );

    await pMap(
        videos,
        async (video) => {
            try {
                await pRetry(() => ingestVideo(video), {
                    retries: 3,
                    onFailedAttempt: (error) => {
                        console.warn(
                            `🔁 Retry ${error.attemptNumber} for ${video.video_id}: ${error.message}`
                        );
                    },
                });
                completed++;
                console.log(
                    `✅ [${completed}/${videos.length}] ${video.video_id}`
                );
            } catch (err) {
                console.error(
                    `❌ Failed permanently: ${video.video_id}`,
                    err.message
                );
            }
        },
        { concurrency }
    );

    console.log(`🎉 Done. ${completed}/${videos.length} succeeded.`);
}

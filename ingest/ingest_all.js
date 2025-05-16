import 'dotenv/config';

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

    const videos = await getAllVideos(channelId);
    for (const video of videos) {
        await ingestVideo(video);
    }
}

import fetch from 'node-fetch';
import pLimit from 'p-limit';
import { ingestVideo } from './ingest_new.js';
import { logger } from './utils/logger.js';

const concurrency = parseInt(process.env.INGEST_CONCURRENCY || '3');
const limit = pLimit(concurrency);
const maxRetries = 2;

const skipped = [];
const failed = [];

// ✅ Check environment variables
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    logger.error('Missing YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID');
    process.exit(1);
}

async function fetchRecentVideos() {
    const baseUrl = `https://www.googleapis.com/youtube/v3/search`;
    const params = new URLSearchParams({
        key: YOUTUBE_API_KEY,
        channelId: YOUTUBE_CHANNEL_ID,
        part: 'snippet,id',
        order: 'date',
        maxResults: '25',
    });

    if (process.env.YOUTUBE_PUBLISHED_AFTER) {
        params.append('publishedAfter', process.env.YOUTUBE_PUBLISHED_AFTER);
    }

    const apiUrl = `${baseUrl}?${params.toString()}`;
    logger.info(`📡 Fetching videos from: ${apiUrl}`);

    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.items) {
        logger.error('❌ YouTube API response missing `items`', {
            response: json,
        });
        throw new Error('Failed to fetch videos from YouTube API');
    }

    return json.items
        .filter((item) => item.id.kind === 'youtube#video')
        .map((item) => ({
            video_id: item.id.videoId,
            title: item.snippet.title,
            published_at: item.snippet.publishedAt,
        }));
}

async function processVideo(video, attempt = 1) {
    try {
        await ingestVideo(video);
        return 'success';
    } catch (err) {
        if (attempt <= maxRetries) {
            logger.info(`🔁 Retrying ${video.video_id} (attempt ${attempt})`);
            return await processVideo(video, attempt + 1);
        } else {
            logger.error(
                `❌ Failed after ${maxRetries} retries: ${video.video_id}`,
                { error: err.message }
            );
            failed.push(video);
            return 'failed';
        }
    }
}

async function ingestAll() {
    let successCount = 0;
    let skipCount = 0;

    const videos = await fetchRecentVideos();

    const tasks = videos.map((video) =>
        limit(async () => {
            const result = await processVideo(video);
            if (result === 'success') successCount++;
            if (result === 'skipped') skipCount++;
        })
    );

    await Promise.allSettled(tasks);

    logger.info(`✅ Ingested: ${successCount}`);
    logger.info(`⏭️ Skipped: ${skipCount}`);
    logger.info(`❌ Failed: ${failed.length}`);
    if (failed.length) {
        logger.info(
            'Failed videos:',
            failed.map((v) => v.video_id)
        );
    }
}

ingestAll();

import * as ingest from '../utils/ingest.js';
import * as youtube from '../utils/youtube.js';

import { describe, expect, it, vi } from 'vitest';

import { run } from '../ingest_all.js';

vi.mock('../utils/youtube.js');
vi.mock('../utils/ingest.js');

describe('ingest_all CLI runner', () => {
    it('calls ingestVideo on all videos', async () => {
        const mockVideos = [
            {
                video_id: 'abc1',
                title: 'Video 1',
                published_at: '2024-01-01T00:00:00Z',
            },
            {
                video_id: 'abc2',
                title: 'Video 2',
                published_at: '2024-01-02T00:00:00Z',
            },
        ];

        youtube.getAllVideos.mockResolvedValue(mockVideos);
        ingest.ingestVideo.mockResolvedValue(undefined);

        process.env.YOUTUBE_CHANNEL_ID = 'mock-channel-id';

        await run();

        expect(youtube.getAllVideos).toHaveBeenCalledWith('mock-channel-id');
        expect(ingest.ingestVideo).toHaveBeenCalledTimes(2);
        expect(ingest.ingestVideo).toHaveBeenCalledWith(mockVideos[0]);
        expect(ingest.ingestVideo).toHaveBeenCalledWith(mockVideos[1]);
    });
});

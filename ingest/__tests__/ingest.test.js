let mockClient;

vi.mock('pg', () => ({
    Pool: vi.fn(() => ({
        connect: vi.fn().mockImplementation(() => mockClient),
    })),
}));

vi.mock('youtube-transcript', () => ({
    default: {
        fetchTranscript: vi.fn().mockResolvedValue([
            { text: 'hello', offset: 0 },
            { text: 'world', offset: 3000 },
        ]),
    },
}));

vi.mock('../deepseek.js', () => ({
    formatTranscript: vi.fn(() => 'formatted transcript'),
}));

vi.mock('../meili.js', () => ({
    indexTranscript: vi.fn(),
}));

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { YoutubeTranscript } from 'youtube-transcript';

import * as deepseek from '../deepseek.js';
import * as meili from '../meili.js';
import { ingestVideo } from '../utils/ingest.js';

// Test data
const fakeVideo = {
    video_id: 'abc123',
    title: 'Fake Title',
    published_at: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
    mockClient = {
        query: vi.fn(),
        release: vi.fn(),
    };
    vi.clearAllMocks();
});

describe('ingestVideo()', () => {
    it('ingests a new video successfully', async () => {
        mockClient.query.mockResolvedValueOnce({ rows: [] }); // Not in DB

        await ingestVideo(fakeVideo);

        expect(YoutubeTranscript.fetchTranscript).toHaveBeenCalledWith(
            fakeVideo.video_id
        );
        expect(deepseek.formatTranscript).toHaveBeenCalled();
        expect(meili.indexTranscript).toHaveBeenCalled();
    });

    it('skips if video already exists', async () => {
        mockClient.query.mockResolvedValueOnce({ rows: [{}] }); // Already in DB

        await ingestVideo(fakeVideo);

        expect(YoutubeTranscript.fetchTranscript).not.toHaveBeenCalled();
    });

    it('handles transcript fetch failure gracefully', async () => {
        mockClient.query.mockResolvedValueOnce({ rows: [] });
        YoutubeTranscript.fetchTranscript.mockRejectedValue(
            new Error('Transcript not found')
        );

        await ingestVideo(fakeVideo);

        expect(deepseek.formatTranscript).not.toHaveBeenCalled();
        expect(meili.indexTranscript).not.toHaveBeenCalled();
    });
});

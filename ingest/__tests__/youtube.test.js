import { describe, expect, it, vi } from 'vitest';
import {
    getAllVideos,
    getRecentVideos,
    getUploadsPlaylistId,
} from '../utils/youtube.js';

import axios from 'axios';

vi.mock('axios');

const mockChannelId = 'UC1234567890abcdef';

describe('YouTube Utils', () => {
    it('gets the uploads playlist ID from a channel', async () => {
        axios.get.mockResolvedValue({
            data: {
                items: [
                    {
                        contentDetails: {
                            relatedPlaylists: {
                                uploads: 'UPLOADS_PLAYLIST_ID',
                            },
                        },
                    },
                ],
            },
        });

        const playlistId = await getUploadsPlaylistId(mockChannelId);
        expect(playlistId).toBe('UPLOADS_PLAYLIST_ID');
        expect(axios.get).toHaveBeenCalledOnce();
    });

    it('throws error when no uploads playlist is found', async () => {
        axios.get.mockResolvedValue({ data: { items: [] } });

        await expect(getUploadsPlaylistId(mockChannelId)).rejects.toThrow(
            'Failed to retrieve uploads playlist from channel.'
        );
    });

    it('gets all videos from a playlist (multiple pages)', async () => {
        axios.get
            // ✅ 1st call: getUploadsPlaylistId
            .mockResolvedValueOnce({
                data: {
                    items: [
                        {
                            contentDetails: {
                                relatedPlaylists: {
                                    uploads: 'UPLOADS_PLAYLIST_ID',
                                },
                            },
                        },
                    ],
                },
            })
            // ✅ 2nd call: first page of videos
            .mockResolvedValueOnce({
                data: {
                    items: [
                        {
                            snippet: {
                                resourceId: { videoId: 'abc1' },
                                title: 'Test Video 1',
                                publishedAt: '2024-01-01T00:00:00Z',
                            },
                        },
                    ],
                    nextPageToken: 'NEXT',
                },
            })
            // ✅ 3rd call: second page
            .mockResolvedValueOnce({
                data: {
                    items: [
                        {
                            snippet: {
                                resourceId: { videoId: 'abc2' },
                                title: 'Test Video 2',
                                publishedAt: '2024-01-02T00:00:00Z',
                            },
                        },
                    ],
                },
            });

        const videos = await getAllVideos(mockChannelId);
        expect(videos).toHaveLength(2);
        expect(videos[0].video_id).toBe('abc1');
        expect(videos[1].video_id).toBe('abc2');
    });

    it('gets recent videos (single page)', async () => {
        axios.get
            .mockResolvedValueOnce({
                data: {
                    items: [
                        {
                            contentDetails: {
                                relatedPlaylists: {
                                    uploads: 'UPLOADS_PLAYLIST_ID',
                                },
                            },
                        },
                    ],
                },
            })
            .mockResolvedValueOnce({
                data: {
                    items: [
                        {
                            snippet: {
                                resourceId: { videoId: 'abc3' },
                                title: 'Recent Video',
                                publishedAt: '2024-01-03T00:00:00Z',
                            },
                        },
                    ],
                },
            });

        const videos = await getRecentVideos(mockChannelId, 1);
        expect(videos).toHaveLength(1);
        expect(videos[0].title).toBe('Recent Video');
    });
});

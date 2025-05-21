import 'dotenv/config';

import axios from 'axios';

export async function getUploadsPlaylistId(channelId) {
    const res = await axios.get(
        'https://www.googleapis.com/youtube/v3/channels',
        {
            params: {
                part: 'contentDetails',
                id: channelId,
                key: process.env.YOUTUBE_API_KEY,
            },
        }
    );

    const playlistId =
        res.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!playlistId) {
        throw new Error('Failed to retrieve uploads playlist from channel.');
    }

    return playlistId;
}

export async function getAllVideos(channelId) {
    const uploadsPlaylist = await getUploadsPlaylistId(channelId);
    let videos = [];
    let nextPageToken = '';

    do {
        const res = await axios.get(
            'https://www.googleapis.com/youtube/v3/playlistItems',
            {
                params: {
                    part: 'snippet',
                    maxResults: 10000,
                    pageToken: nextPageToken,
                    playlistId: uploadsPlaylist,
                    key: process.env.YOUTUBE_API_KEY,
                },
            }
        );

        const pageVideos = res.data.items.map((item) => ({
            video_id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            published_at: item.snippet.publishedAt,
        }));

        videos = videos.concat(pageVideos);
        nextPageToken = res.data.nextPageToken;
    } while (nextPageToken);

    return videos;
}

export async function getRecentVideos(channelId, limit = 20) {
    const uploadsPlaylist = await getUploadsPlaylistId(channelId);
    const res = await axios.get(
        'https://www.googleapis.com/youtube/v3/playlistItems',
        {
            params: {
                part: 'snippet',
                maxResults: limit,
                playlistId: uploadsPlaylist,
                key: process.env.YOUTUBE_API_KEY,
            },
        }
    );

    return res.data.items.map((item) => ({
        video_id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        published_at: item.snippet.publishedAt,
    }));
}

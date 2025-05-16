import * as meili from '../meili.js';

import { describe, expect, it, vi } from 'vitest';

import axios from 'axios';

vi.mock('axios');

describe('Meilisearch Integration', () => {
    it('indexes a transcript successfully', async () => {
        axios.post.mockResolvedValue({ data: {} });

        await meili.indexTranscript(
            'abc123',
            'Cool Video',
            'Transcript content'
        );
        expect(axios.post).toHaveBeenCalledOnce();
    });

    it('configures index settings', async () => {
        axios.post.mockResolvedValue({ data: {} });

        await meili.configureIndex();
        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/settings'),
            expect.objectContaining({
                searchableAttributes: expect.any(Array),
            }),
            expect.any(Object)
        );
    });
});

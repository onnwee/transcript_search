import * as deepseek from '../deepseek.js';

import { describe, expect, it, vi } from 'vitest';

import axios from 'axios';

vi.mock('axios');

describe('Deepseek Transcript Formatter', () => {
    it('formats transcript via Deepseek API', async () => {
        axios.post.mockResolvedValue({
            data: {
                choices: [
                    { message: { content: 'Formatted transcript here.' } },
                ],
            },
        });

        const result = await deepseek.formatTranscript('test text');
        expect(result).toBe('Formatted transcript here.');
    });

    it('throws error on API failure', async () => {
        axios.post.mockRejectedValue(new Error('Deepseek is down'));
        await expect(deepseek.formatTranscript('text')).rejects.toThrow(
            'Deepseek is down'
        );
    });
});

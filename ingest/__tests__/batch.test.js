import { beforeEach, expect, test, vi } from 'vitest';
import * as ingestModule from '../../ingest/ingest_new.js';
import * as loggerModule from '../../ingest/utils/logger.js';

vi.mock('../../ingest/ingest_new.js');
vi.mock('../../ingest/utils/logger.js', async () => {
    const actual = await vi.importActual('../../ingest/utils/logger.js');
    return {
        ...actual,
        logger: {
            info: vi.fn(),
            error: vi.fn(),
        },
    };
});

const { logger } = loggerModule;

beforeEach(() => {
    vi.clearAllMocks();
});

test('should process all videos and log success', async () => {
    ingestModule.ingestVideo.mockResolvedValueOnce(undefined); // simulate successful ingestion for each

    const batch = await import('../../ingest/batch.js');

    expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('✅ Ingested')
    );
});

test('should retry failed videos and log error', async () => {
    ingestModule.ingestVideo
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'));

    await import('../../ingest/batch.js');

    expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('🔁 Retrying')
    );
    expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('❌ Failed after'),
        expect.objectContaining({ error: expect.any(String) })
    );
});

test('should skip ingest if already handled (mocked inside ingestVideo)', async () => {
    ingestModule.ingestVideo.mockImplementation(async () => {
        throw new Error('skip');
    });

    await import('../../ingest/batch.js');

    expect(logger.error).toHaveBeenCalled();
});

// setupMeili.js
import axios from 'axios';
import 'dotenv/config';

const MEILI_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILI_API_KEY = process.env.MEILISEARCH_API_KEY || 'masterKey';

const headers = {
    Authorization: `Bearer ${MEILI_API_KEY}`,
    'Content-Type': 'application/json',
};

async function setupMeili() {
    try {
        console.log('⚙️ Setting Meili index settings...');

        await axios.patch(
            `${MEILI_HOST}/indexes/transcripts/settings`,
            {
                searchableAttributes: ['title', 'transcript'],
                displayedAttributes: ['id', 'title', 'transcript'],
            },
            { headers }
        );

        await axios.patch(
            `${MEILI_HOST}/indexes/transcripts/settings/typo-tolerance`,
            {
                enabled: true,
            },
            { headers }
        );

        console.log('✅ Meili configuration complete.');
    } catch (err) {
        console.error('❌ Failed to configure Meilisearch:', err.message);
        if (err.response?.data) {
            console.error('📄 Meili response:', err.response.data);
        }
        process.exit(1);
    }
}

setupMeili();

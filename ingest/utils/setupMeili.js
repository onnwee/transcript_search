// setupMeili.js
import axios from 'axios';
import 'dotenv/config';

const MEILI_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILI_API_KEY = process.env.MEILISEARCH_API_KEY || 'masterKey';
const INDEX_NAME = 'transcripts';

const headers = {
    Authorization: `Bearer ${MEILI_API_KEY}`,
    'Content-Type': 'application/json',
};

async function setupMeili() {
    try {
        console.log(`⚙️ Connecting to Meilisearch at ${MEILI_HOST}`);

        // Check if index exists
        const existing = await axios
            .get(`${MEILI_HOST}/indexes/${INDEX_NAME}`, { headers })
            .then(() => true)
            .catch((err) => {
                if (err.response?.status === 404) return false;
                throw err;
            });

        if (!existing) {
            console.log(`📁 Index '${INDEX_NAME}' does not exist. Creating...`);
            await axios.post(
                `${MEILI_HOST}/indexes`,
                { uid: INDEX_NAME, primaryKey: 'id' },
                { headers }
            );
            console.log(`✅ Created index '${INDEX_NAME}'`);
        } else {
            console.log(`📦 Index '${INDEX_NAME}' already exists`);
        }

        // Patch settings
        console.log('🔧 Updating index settings...');
        await axios.patch(
            `${MEILI_HOST}/indexes/${INDEX_NAME}/settings`,
            {
                searchableAttributes: ['title', 'transcript'],
                displayedAttributes: ['id', 'title', 'transcript'],
            },
            { headers }
        );

        await axios.patch(
            `${MEILI_HOST}/indexes/${INDEX_NAME}/settings/typo-tolerance`,
            { enabled: true },
            { headers }
        );

        console.log('✅ Meilisearch index is ready');
    } catch (err) {
        console.error('❌ Meilisearch setup failed:', err.message);
        if (err.response?.data) {
            console.error('📄 Meili response:', err.response.data);
        }
        process.exit(1);
    }
}

setupMeili();

import { execSync } from 'child_process';

const MAX_RETRIES = 30;
let attempts = 0;

while (attempts < MAX_RETRIES) {
    try {
        console.log('⏳ Checking Postgres status...');
        execSync(`docker exec transcript_pg pg_isready -U postgres`, {
            stdio: 'ignore',
        });
        console.log('✅ Postgres is ready.');
        process.exit(0);
    } catch {
        attempts++;
        console.log(`🔁 Waiting for Postgres... (${attempts}/${MAX_RETRIES})`);
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000); // sleep 1s
    }
}

console.error('❌ Postgres did not become ready in time.');
process.exit(1);

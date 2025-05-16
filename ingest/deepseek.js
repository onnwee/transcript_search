import axios from 'axios';

export async function formatTranscript(text) {
    const chunks = chunkTranscript(text);
    const formattedChunks = [];

    for (const chunk of chunks) {
        const response = await axios.post(
            'http://localhost:11434/api/generate',
            {
                model: 'mistral-formatting',
                prompt: `
                    You are not a chatbot. You are not an assistant. You are not a summarizer.

                    You are a formatting engine.

                    Your task is to take unpunctuated YouTube auto-transcript text and:
                    - Add punctuation (.,?! etc.)
                    - Break into readable paragraphs
                    - Fix *only* obvious transcription glitches (e.g., repeated “um”, stutters)

                    ❌ Do NOT summarize.
                    ❌ Do NOT explain.
                    ❌ Do NOT add <think> or any commentary.
                    ❌ Do NOT change, interpret, or reword the text.
                    ❌ DO NOT ADD CONTEXT or say what it “seems like” or “looks like.”

                    ✅ DO preserve slang, swearing, informal grammar
                    ✅ DO treat it as a literal script to be made readable — like formatting a screenplay

                    This is a literal transcription. Just format it. Nothing more.

                    Return only the formatted transcript. No markdown, no metadata, no explanation.

                    Here is the transcript:
                    ---
                    ${chunk}
                    ---
                    Formatted version:
                    `,
                stream: false,
            }
        );
        formattedChunks.push(response.data.response.trim());
    }
    console.log(`Formatted ${formattedChunks.length} chunks`);
    console.log(`First unformatted chunk: ${chunks[0]}`);
    console.log(`Formatted transcript: ${formattedChunks.join('\n\n')}`);

    return formattedChunks.join('\n\n');
}

function chunkTranscript(text, maxLength = 1000) {
    const chunks = [];
    let current = '';
    for (const paragraph of text.split('\n')) {
        if ((current + paragraph).length < maxLength) {
            current += paragraph + '\n';
        } else {
            chunks.push(current.trim());
            current = paragraph + '\n';
        }
    }
    if (current) chunks.push(current.trim());
    return chunks;
}

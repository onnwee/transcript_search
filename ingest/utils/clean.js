import he from 'he';

const twitchSlang = new Set([
    'pog',
    'pogchamp',
    'LULW',
    'OMEGALUL',
    'peepo',
    'peeposad',
    'kekw',
    'monkaS',
    'monkaW',
    'FeelsBadMan',
    'FeelsGoodMan',
    'based',
    'cringe',
    'raid',
    'subathon',
    'chat',
    'mods',
    'copium',
    'cope',
    'ratio',
    'sus',
    'bro',
    'giga',
    'peepoLeave',
    'sadge',
    'ayaya',
]);

export function cleanTranscript(text) {
    let result = he.decode(text);

    // Replace redacted underscores with [censored]
    result = result.replace(/\[?_{2,}\]?/g, '[censored]');

    // Collapse repeated [music] tags
    result = result.replace(/(\[music\]\s*){2,}/gi, '[music] ');

    // Fix rogue punctuation like .,
    result = result.replace(/([.?!]),/g, '$1');

    // Remove repeated words unless they're Twitch slang
    result = result.replace(/\b(\w+)\b(?:\s+\1\b){1,}/gi, (match, word) => {
        return twitchSlang.has(word.toLowerCase()) ? match : word;
    });

    // Collapse excessive punctuation (e.g. !!! or ...)
    result = result.replace(/([!?.,])\1+/g, '$1');

    // Normalize whitespace
    result = result.replace(/\s+/g, ' ').trim();

    // Add paragraph breaks between sentence endings and capital letter
    result = result.replace(/([.?!])\s+(?=[A-Z])/g, '$1\n\n');

    // Capitalize start of new paragraphs if needed
    result = result.replace(
        /(^|\n\n)([a-z])/g,
        (match, p1, p2) => p1 + p2.toUpperCase()
    );

    return result;
}

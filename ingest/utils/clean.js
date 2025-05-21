// import he from 'he';

// const twitchSlang = new Set([
//     'pog',
// ]);

// // List of common filler words and stutter fragments
// const fillerWords = [
//     'uh',
//     'um',
//     'er',
//     'ah',
// ];

// // Regex utility to check for valid end punctuation
// const sentenceEnd = /([.?!])\s+(?=[A-Z])/g;

// export function cleanTranscript(text) {
//     let result = he.decode(text);

//     // 1. Normalize bracketed noise: [music], [laughter], etc.
//     result = result.replace(/\[.*?\]/gi, '[...]');

//     // 2. Remove repeated bracketed noise
//     result = result.replace(/(\[\.\.\.\]\s*){2,}/gi, '[...] ');

//     // 3. Remove HTML tags, malformed unicode, garbage characters
//     result = result
//         .replace(/<[^>]+>/g, '') // tags
//         .replace(/[^\x00-\x7F]+/g, ''); // non-ascii artifacts

//     // 4. Collapse repeated punctuation (!!! → !)
//     result = result.replace(/([!?.,])\1+/g, '$1');

//     // 5. Replace stutters (e.g. "th-th-that") unless it's twitch slang
//     result = result.replace(/\b(\w+)-\1\b/g, (match, word) =>
//         twitchSlang.has(word.toLowerCase()) ? match : word
//     );

//     // 6. Remove long runs of repeated filler words unless in slang
//     fillerWords.forEach((word) => {
//         const regex = new RegExp(`\\b(${word})(\\s+\\1){1,}\\b`, 'gi');
//         result = result.replace(regex, (match, w) =>
//             twitchSlang.has(w.toLowerCase()) ? match : w
//         );
//     });

//     // 7. Collapse multiple whitespace
//     result = result.replace(/\s+/g, ' ').trim();

//     // 8. Add paragraph breaks intelligently
//     result = result.replace(sentenceEnd, '$1\n\n');

//     // 9. Fix punctuation spacing
//     result = result.replace(/([.?!])(?=\w)/g, '$1 '); // missing space after punctuation

//     // 10. Preserve intentional caps like ALL CAPS
//     // Optional: normalize random caps if needed:
//     result = result.replace(/\b([A-Z])([a-z]+)\b/g, (_, a, b) => a + b);

//     return result;
// }

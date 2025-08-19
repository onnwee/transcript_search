import { describe, it, expect } from "vitest";
import {
  splitIntoSentences,
  alignSentencesToSegments,
} from "../utils/sentences.js";

describe("sentence splitting and alignment", () => {
  it("splits by punctuation and aligns to segments approximately", () => {
    const punctuated = "hello world. how are you? this is a test!";
    const sentences = splitIntoSentences(punctuated);
    expect(sentences.length).toBe(3);

    const segments = [
      { text: "hello world how", offset: 0, duration: 2000 },
      { text: "are you this", offset: 2000, duration: 2000 },
      { text: "is a test", offset: 4000, duration: 2000 },
    ];
    const aligned = alignSentencesToSegments(sentences, segments);
    expect(aligned.length).toBe(3);
    // First sentence should start at 0
    expect(aligned[0].start_time).toBeCloseTo(0);
    // Sentences should be monotonic and within overall bounds
    expect(aligned[0].end_time).toBeLessThanOrEqual(aligned[1].start_time);
    expect(aligned[2].end_time).toBeGreaterThan(3.9);
    expect(aligned[2].end_time).toBeLessThanOrEqual(6.5);
  });
});

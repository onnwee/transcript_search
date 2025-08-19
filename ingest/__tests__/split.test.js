import { describe, it, expect } from "vitest";
import { splitIntoChunks } from "../utils/split.js";

describe("splitIntoChunks", () => {
  it("splits long unpunctuated text by size", () => {
    const text = Array(500).fill("word").join(" ");
    const chunks = splitIntoChunks(text, 100);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.length <= 100)).toBe(true);
  });

  it("handles extremely long tokens", () => {
    const long = "x".repeat(250);
    const text = `short ${long} tail`;
    const chunks = splitIntoChunks(text, 100);
    expect(chunks.some((c) => c.length === 100)).toBe(true);
  });

  it("returns empty for empty input", () => {
    expect(splitIntoChunks("")).toEqual([]);
  });
});

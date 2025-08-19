import { describe, it, expect } from "vitest";
import { describe, it, expect, vi } from "vitest";
// Mock 'he' to avoid external dependency in test runtime
vi.mock("he", () => ({
  default: {
    decode: (s) => s.replaceAll("&amp;", "&").replaceAll("&nbsp;", " "),
  },
}));
const { cleanTranscript } = await import("../utils/clean.js");

describe("cleanTranscript", () => {
  it("decodes HTML and normalizes whitespace", () => {
    const input = "Hello &amp; world!  This\n is\r\n  a test.";
    const out = cleanTranscript(input);
    expect(out).toBe("Hello & world! This is a test.");
  });

  it("collapses repeated fillers", () => {
    const input = "um um um this is, like like, you know you know";
    const out = cleanTranscript(input);
    expect(out).toContain("um this is, like, you know");
  });

  it("normalizes noise tags and strips html", () => {
    const input = "before [music] <b>bold</b> after [unintelligible]";
    const out = cleanTranscript(input);
    expect(out).toContain("[Noise]");
    expect(out).toContain("[Unintelligible]");
    expect(out).toMatch(/before\s+/);
    expect(out).toMatch(/\s+after\s+/);
  });

  it("is idempotent", () => {
    const input = 'Hi...  there -- "quote" ‘apostrophe’';
    const once = cleanTranscript(input);
    const twice = cleanTranscript(once);
    expect(once).toBe(twice);
  });
});

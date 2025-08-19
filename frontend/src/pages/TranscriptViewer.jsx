// Transcript viewer: embeds YouTube, fetches sentence window, allows timestamp jumps.
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TranscriptViewer = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sentences, setSentences] = useState([]);
  const [error, setError] = useState("");
  const containerRef = useRef(null);

  const startSec = useMemo(() => {
    const t = Number(searchParams.get("t") || 0);
    return Number.isFinite(t) ? t : 0;
  }, [searchParams]);

  useEffect(() => {
    async function fetchTranscript() {
      try {
        const res = await axios.get(`${API_BASE}/api/video/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: false, // set to true if using cookies/auth
        });
        setVideo(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Error fetching transcript", err);
        setError("Failed to load transcript.");
      } finally {
        setLoading(false);
      }
    }

    fetchTranscript();
  }, [id]);

  useEffect(() => {
    async function fetchSentences() {
      const from = Math.max(0, Math.floor(startSec - 30));
      const to = Math.floor(startSec + 90);
      try {
        const res = await axios.get(
          `${API_BASE}/api/video/${id}/segments?from=${from}&to=${to}`
        );
        setSentences(res.data?.sentences || []);
      } catch (e) {
        console.error("Error fetching sentence window", e);
        setError("Failed to load context window.");
      }
    }
    if (id) fetchSentences();
  }, [id, startSec]);

  if (loading)
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <div className="h-6 w-2/3 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
        <div className="aspect-video w-full bg-gray-200 animate-pulse rounded" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-full bg-gray-100 animate-pulse rounded"
            />
          ))}
        </div>
      </div>
    );
  if (!video)
    return (
      <div className="p-6 text-center text-red-600">Transcript not found.</div>
    );

  const onJump = (sec) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("t", String(Math.floor(sec)));
      return p;
    });
  };

  const onCopyLink = useCallback(async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("t", String(Math.floor(startSec)));
      await navigator.clipboard.writeText(url.toString());
    } catch (e) {
      console.error("copy failed", e);
    }
  }, [startSec]);

  const currentIdx = useMemo(() => {
    if (!sentences.length) return -1;
    return sentences.findIndex(
      (s) => startSec >= s.start_time && startSec < s.end_time
    );
  }, [sentences, startSec]);

  const jumpPrev = useCallback(() => {
    if (currentIdx > 0) onJump(sentences[currentIdx - 1].start_time);
  }, [currentIdx, sentences]);
  const jumpNext = useCallback(() => {
    if (currentIdx >= 0 && currentIdx + 1 < sentences.length)
      onJump(sentences[currentIdx + 1].start_time);
  }, [currentIdx, sentences]);

  useEffect(() => {
    // Scroll currently-playing sentence into view
    const el = containerRef.current?.querySelector('[data-current="true"]');
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [sentences, startSec]);
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{video.title}</h1>
      <a
        href={`https://www.youtube.com/watch?v=${video.id}&t=${Math.floor(
          startSec
        )}s`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline text-sm"
      >
        Watch on YouTube
      </a>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="text-sm text-gray-600">
        Published: {new Date(video.published).toLocaleDateString()}
      </div>

      <hr className="my-4" />

      {/* YouTube embed */}
      <div className="aspect-video w-full">
        <iframe
          className="w-full h-full rounded"
          src={`https://www.youtube.com/embed/${video.id}?start=${Math.floor(
            startSec
          )}&autoplay=0&modestbranding=1`}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 text-sm">
        <button
          onClick={jumpPrev}
          className="px-2 py-1 border rounded disabled:opacity-50"
          disabled={currentIdx <= 0}
        >
          ← Prev
        </button>
        <button
          onClick={jumpNext}
          className="px-2 py-1 border rounded disabled:opacity-50"
          disabled={currentIdx < 0 || currentIdx + 1 >= sentences.length}
        >
          Next →
        </button>
        <button onClick={onCopyLink} className="px-2 py-1 border rounded">
          Copy link to time
        </button>
      </div>

      {/* Sentence list */}
      <div ref={containerRef} className="space-y-2">
        {sentences.map((s) => {
          const isCurrent = startSec >= s.start_time && startSec < s.end_time;
          return (
            <div
              key={s.sentence_index}
              data-current={isCurrent ? "true" : "false"}
              className={`p-2 rounded cursor-pointer ${
                isCurrent
                  ? "bg-yellow-50 ring-1 ring-yellow-300"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => onJump(s.start_time)}
            >
              <span className="text-xs text-gray-500 mr-2">
                [{Math.floor(s.start_time)}s]
              </span>
              <span>{s.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranscriptViewer;

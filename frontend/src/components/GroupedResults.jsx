// GroupedResults: groups hits by video and renders multiple snippets, infinite scroll.
import { useEffect, useMemo, useRef, useState } from "react";

import { Link } from "react-router-dom";
import { useInfiniteHits } from "react-instantsearch";

function secondsToTimestamp(s) {
  const sec = Math.floor(Number(s) || 0);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const ss = sec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
    : `${m}:${String(ss).padStart(2, "0")}`;
}

export default function GroupedResults() {
  const { hits, isLastPage, showMore } = useInfiniteHits();
  const [groups, setGroups] = useState([]);
  const sentinelRef = useRef(null);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const h of hits) {
      const vid = h.video_id || h.id || "unknown";
      if (!map.has(vid)) {
        map.set(vid, { video_id: vid, title: h.title, items: [] });
      }
      map.get(vid).items.push(h);
    }
    // Sort each group by start time
    for (const g of map.values()) {
      g.items.sort((a, b) => (a.start || 0) - (b.start || 0));
    }
    return Array.from(map.values());
  }, [hits]);

  useEffect(() => {
    setGroups(grouped);
  }, [grouped]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const ob = new IntersectionObserver((entries) => {
      const [e] = entries;
      if (e.isIntersecting && !isLastPage) showMore();
    });
    ob.observe(sentinelRef.current);
    return () => ob.disconnect();
  }, [isLastPage, showMore]);

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.video_id} className="border rounded p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">{g.title}</h2>
            <Link
              to={`/video/${g.video_id}`}
              className="text-blue-600 underline text-sm"
            >
              Open video
            </Link>
          </div>
          <div className="space-y-2">
            {g.items.map((hit) => {
              const start = hit.start ?? 0;
              const ts = secondsToTimestamp(start);
              const snippet = hit._formatted?.text || hit.text || "";
              return (
                <div key={hit.id} className="p-2 rounded border">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>{ts}</span>
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/video/${g.video_id}?t=${Math.floor(start)}`}
                        className="underline"
                      >
                        Open in viewer
                      </Link>
                      <a
                        href={`https://www.youtube.com/watch?v=${
                          g.video_id
                        }&t=${Math.floor(start)}s`}
                        className="underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        YouTube
                      </a>
                    </div>
                  </div>
                  <div
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: snippet }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div ref={sentinelRef} />
      {isLastPage && (
        <div className="text-center text-sm text-gray-500 py-2">
          End of results
        </div>
      )}
    </div>
  );
}

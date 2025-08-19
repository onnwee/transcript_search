// ResultsList: flat list rendering for hits (legacy alternative to GroupedResults)
import { connectHits } from "react-instantsearch-dom";
import { Link } from "react-router-dom";

function secondsToTimestamp(s) {
  const sec = Math.floor(Number(s) || 0);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const ss = sec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
    : `${m}:${String(ss).padStart(2, "0")}`;
}

const Hits = ({ hits }) => {
  return (
    <div className="space-y-4">
      {hits.map((hit) => {
        const start = hit.start ?? hit.Start ?? 0;
        const timestamp = secondsToTimestamp(start);
        const formattedText = hit._formatted?.text || hit.text || "";
        return (
          <div key={hit.id} className="p-4 border rounded space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{hit.title}</h2>
              <div className="text-xs text-gray-600">{timestamp}</div>
            </div>
            <p
              className="text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formattedText }}
            />
            <div className="flex items-center gap-4 text-sm">
              <Link
                to={`/video/${hit.video_id}?t=${Math.floor(start)}`}
                className="text-blue-600 underline"
              >
                Open in viewer
              </Link>
              <a
                href={`https://www.youtube.com/watch?v=${
                  hit.video_id
                }&t=${Math.floor(start)}s`}
                className="text-blue-600 underline"
                target="_blank"
                rel="noreferrer"
              >
                Open on YouTube
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default connectHits(Hits);

import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import {
  Configure,
  InstantSearch,
  Stats,
  Pagination,
  HitsPerPage,
} from "react-instantsearch-dom";
// Search landing page: InstantSearch UI over sentence index with grouped results.
import ResultsList from "../components/ResultsList";
import GroupedResults from "../components/GroupedResults";
import SearchInput from "../components/SearchBox";

const MEILI_HOST =
  import.meta.env.VITE_MEILISEARCH_HOST ||
  import.meta.env.MEILISEARCH_HOST ||
  "http://localhost:7700";
const MEILI_API_KEY =
  import.meta.env.VITE_MEILISEARCH_API_KEY ||
  import.meta.env.MEILISEARCH_API_KEY ||
  "masterKey";
const INDEX_NAME =
  import.meta.env.VITE_MEILI_SEGMENT_INDEX || "transcript_sentences";

const { searchClient } = instantMeiliSearch(
  MEILI_HOST || "http://localhost:7700",
  MEILI_API_KEY || "masterKey"
);

const Home = () => {
  return (
    <InstantSearch indexName={INDEX_NAME} searchClient={searchClient}>
      <Configure
        hitsPerPage={10}
        attributesToHighlight={["text", "title"]}
        highlightPreTag={"<mark>"}
        highlightPostTag={"</mark>"}
      />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <SearchInput />
        <div className="flex items-center justify-between text-sm text-gray-600">
          <Stats
            translations={{
              stats(nbHits) {
                return `${nbHits.toLocaleString()} results`;
              },
            }}
          />
          <HitsPerPage
            defaultRefinement={10}
            items={[
              { value: 10, label: "10 / page" },
              { value: 20, label: "20 / page" },
              { value: 50, label: "50 / page" },
            ]}
          />
        </div>
        <GroupedResults />
        <div className="pt-2">
          <Pagination showLast={false} />
        </div>
      </div>
    </InstantSearch>
  );
};

export default Home;

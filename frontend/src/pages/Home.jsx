import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import ResultsList from '../components/ResultsList';
import SearchInput from '../components/SearchBox';

const MEILI_HOST = import.meta.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILI_API_KEY = import.meta.env.MEILISEARCH_API_KEY || 'masterKey';

const { searchClient } = instantMeiliSearch(
    MEILI_HOST || 'http://localhost:7700',
    MEILI_API_KEY || 'masterKey'
);

const Home = () => {
    return (
        <InstantSearch
            indexName='transcripts'
            searchClient={searchClient}
        >
            <Configure hitsPerPage={10} />
            <div className='max-w-3xl mx-auto p-6 space-y-6'>
                <SearchInput />
                <ResultsList />
            </div>
        </InstantSearch>
    );
};

export default Home;

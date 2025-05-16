import algoliasearch from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import ResultsList from '../components/ResultsList';
import SearchInput from '../components/SearchBox';

const searchClient = algoliasearch('http://localhost:7700', 'masterKey'); // Customize if using proxy

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

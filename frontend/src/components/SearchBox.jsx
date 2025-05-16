import { SearchBox } from 'react-instantsearch-dom';

const SearchInput = () => {
    return (
        <div className='w-full'>
            <SearchBox
                translations={{ placeholder: 'Search transcripts...' }}
                className='w-full'
            />
        </div>
    );
};

export default SearchInput;

import { connectHits } from 'react-instantsearch-dom';
import { Link } from 'react-router-dom';

const Hits = ({ hits }) => {
    return (
        <div className='space-y-4'>
            {hits.map((hit) => (
                <div
                    key={hit.id}
                    className='p-4 border rounded'
                >
                    <h2 className='text-lg font-bold'>{hit.title}</h2>
                    <p className='text-sm'>{hit.transcript.slice(0, 200)}...</p>
                    <Link
                        to={`/video/${hit.id}`}
                        className='text-blue-600 underline text-sm'
                    >
                        View Full Transcript
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default connectHits(Hits);

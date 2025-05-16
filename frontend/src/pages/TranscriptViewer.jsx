import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const TranscriptViewer = () => {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTranscript() {
            try {
                const res = await axios.get(`/api/video/${id}`);
                setVideo(res.data);
            } catch (err) {
                console.error('Error fetching transcript', err);
            } finally {
                setLoading(false);
            }
        }

        fetchTranscript();
    }, [id]);

    if (loading)
        return <div className='p-6 text-center'>Loading transcript...</div>;
    if (!video)
        return (
            <div className='p-6 text-center text-red-600'>
                Transcript not found.
            </div>
        );

    const renderTranscript = () => {
        const paragraphs = video.transcript.split(/\n{2,}/); // Split on double line breaks
        return paragraphs.map((p, i) => (
            <p
                key={i}
                className='mb-4 leading-relaxed'
            >
                {p}
            </p>
        ));
    };
    return (
        <div className='max-w-3xl mx-auto p-6 space-y-6'>
            <h1 className='text-2xl font-bold'>{video.title}</h1>
            <a
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 underline text-sm'
            >
                Watch on YouTube
            </a>
            <div className='text-sm text-gray-600'>
                Published: {new Date(video.published).toLocaleDateString()}
            </div>

            <hr className='my-4' />

            <div className='prose max-w-none'>{renderTranscript()}</div>
        </div>
    );
};

export default TranscriptViewer;

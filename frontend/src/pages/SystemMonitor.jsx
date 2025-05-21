import axios from 'axios';
import { useEffect, useState } from 'react';
import DockerLogStream from '../components/DockerLogStream'; // ✅ make sure the path is correct
const endpoints = [
    { name: 'Health Check', url: '/api/health' },
    { name: 'Ping', url: '/api/health' },
    { name: 'Sample Video', url: '/api/video/rsJZp2pLVaA' },
];

const SystemMonitor = () => {
    const [apiResults, setApiResults] = useState([]);
    const [containers, setContainers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchStatuses = async () => {
        setLoading(true);

        const responses = await Promise.allSettled(
            endpoints.map(({ url }) =>
                axios.get(url, {
                    baseURL: import.meta.env.VITE_API_URL,
                    timeout: 3000,
                })
            )
        );

        const results = responses.map((res, i) => {
            const { name, url } = endpoints[i];
            if (res.status === 'fulfilled') {
                return {
                    name,
                    url,
                    status: '✅ UP',
                    statusCode: res.value.status,
                    latency: res.value?.headers?.['x-response-time'] || 'OK',
                    data: res.value.data,
                };
            } else {
                return {
                    name,
                    url,
                    status: '❌ DOWN',
                    statusCode: res.reason?.response?.status || 'N/A',
                    error: res.reason?.message,
                };
            }
        });

        setApiResults(results);
        setLoading(false);
    };

    const fetchDocker = async () => {
        try {
            const res = await axios.get('/api/docker', {
                baseURL: import.meta.env.VITE_API_URL,
            });
            setContainers(res.data);
        } catch (err) {
            console.error('Docker status fetch failed', err);
            setContainers([{ name: 'docker', status: 'unreachable' }]);
        }
    };

    useEffect(() => {
        fetchStatuses();
        fetchDocker();
        const interval = setInterval(() => {
            fetchStatuses();
            fetchDocker();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className='p-4 font-mono'>
            <h2 className='text-xl font-bold mb-4'>🚥 System Monitor</h2>
            <h3 className='text-lg font-semibold mb-2'>🧪 API Endpoints</h3>
            <table className='w-full text-left border border-gray-300 mb-6'>
                <thead className='bg-gray-100'>
                    <tr>
                        <th className='p-2'>Endpoint</th>
                        <th className='p-2'>Status</th>
                        <th className='p-2'>HTTP</th>
                        <th className='p-2'>Latency</th>
                        <th className='p-2'>Message</th>
                    </tr>
                </thead>
                <tbody>
                    {apiResults.map((res) => (
                        <tr
                            key={res.url}
                            className='border-t border-gray-300'
                        >
                            <td className='p-2'>{res.name}</td>
                            <td className='p-2'>{res.status}</td>
                            <td className='p-2'>{res.statusCode}</td>
                            <td className='p-2'>{res.latency}</td>
                            <td className='p-2 truncate max-w-[400px]'>
                                {res.status === '✅ UP'
                                    ? JSON.stringify(res.data.title)
                                    : res.error}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h3 className='text-lg font-semibold mt-4 mb-2'>
                🐳 Docker Containers
            </h3>
            <table className='w-full text-left border border-gray-300 mb-6'>
                <thead className='bg-gray-100'>
                    <tr>
                        <th className='p-2'>Name</th>
                        <th className='p-2'>Image</th>
                        <th className='p-2'>State</th>
                        <th className='p-2'>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {containers.map((c) => (
                        <tr
                            key={c.id || c.name}
                            className='border-t border-gray-300'
                        >
                            <td className='p-2'>{c.name}</td>
                            <td className='p-2'>{c.image}</td>
                            <td className='p-2'>{c.state}</td>
                            <td className='p-2'>{c.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h3 className='text-lg font-semibold mt-4 mb-2'>
                📡 Live Docker Logs
            </h3>
            <DockerLogStream />
            {/* <h3 className='text-lg font-semibold mt-4 mb-2'>📡 Live Logs</h3>
            <LogStream /> */}
        </div>
    );
};

export default SystemMonitor;

import { useEffect, useState } from 'react';

const LogStream = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:3000/ws/logs'); // or use VITE_API_URL

        socket.onmessage = (event) => {
            setLogs((prev) => [...prev.slice(-99), event.data]); // keep last 100 lines
        };

        socket.onerror = (err) => {
            console.error('WebSocket error:', err);
        };

        return () => socket.close();
    }, []);

    return (
        <div className='p-4 font-mono bg-black text-green-400 h-96 overflow-y-auto'>
            {logs.map((line, i) => (
                <div key={i}>{line}</div>
            ))}
        </div>
    );
};

export default LogStream;

import AnsiToHtml from 'ansi-to-html';
import { useEffect, useRef, useState } from 'react';

const convert = new AnsiToHtml();

const DockerLogStream = () => {
    const [logs, setLogs] = useState([]);
    const containerRef = useRef();

    useEffect(() => {
        let socket;
        let retryTimeout;

        const connect = () => {
            socket = new WebSocket(
                `${
                    import.meta.env.VITE_WS_URL || 'ws://localhost:3000'
                }/api/docker-logs`
            );

            socket.onmessage = (event) => {
                setLogs((prev) => [...prev.slice(-300), event.data]);
            };

            socket.onclose = () => {
                console.warn('WebSocket closed. Retrying in 3s...');
                retryTimeout = setTimeout(connect, 3000);
            };

            socket.onerror = (err) => {
                console.error('WebSocket error', err);
                socket.close();
            };
        };

        connect();

        return () => {
            socket.close();
            clearTimeout(retryTimeout);
        };
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div
            className='p-4 font-mono bg-black text-sm text-white h-96 overflow-y-auto border border-gray-700 rounded'
            ref={containerRef}
        >
            {logs.map((line, i) => (
                <div
                    key={i}
                    dangerouslySetInnerHTML={{ __html: convert.toHtml(line) }}
                />
            ))}
        </div>
    );
};

export default DockerLogStream;

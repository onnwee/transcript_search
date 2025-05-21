import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import TranscriptViewer from './pages/TranscriptViewer';
import SystemMonitor from './pages/SystemMonitor';

import Home from './pages/Home';

function App() {
    return (
        <Router>
            <Routes>
                <Route
                    path='/'
                    element={<Home />}
                />
                <Route
                    path='/video/:id'
                    element={<TranscriptViewer />}
                />
                <Route
                    path='/system-monitor'
                    element={<SystemMonitor />}
                />
            </Routes>
        </Router>
    );
}

export default App;

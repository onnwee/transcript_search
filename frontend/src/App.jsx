import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import TranscriptViewer from './components/TranscriptViewer';
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
            </Routes>
        </Router>
    );
}

export default App;

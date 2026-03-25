import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Locations from './pages/Locations';
import PlaceDetails from './pages/PlaceDetails';
import Translator from './pages/Translator';
import About from './pages/About';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/place/:id" element={<PlaceDetails />} />
            <Route path="/translator" element={<Translator />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Skills from './components/Skills';
import RNGSection from './components/RNGSection';
import Footer from './components/Footer';
import NotFound from './components/NotFound';
import ConvexClientProvider from './components/ConvexClientProvider';

function App() {
  return (
    <ConvexClientProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-bg">
          <Routes>
            <Route path="/" element={
              <>
                <Navbar />
                <main className="md:flex md:items-center">
                  <Hero />
                  <Skills />
                </main>
                <RNGSection />
                <Footer />
              </>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ConvexClientProvider>
  );
}

export default App;


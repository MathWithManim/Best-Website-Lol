import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Footer from './components/Footer';
import NotFound from './components/NotFound';
import RNGPage from './pages/RNGPage';
import ProfilePage from './pages/ProfilePage';
import ConvexClientProvider from './components/ConvexClientProvider';
import ScrollProgress from './components/ScrollProgress';
import CookieBanner from './components/CookieBanner';
import FloatingContact from './components/FloatingContact';
import ScrollUpButton from './components/ScrollUpButton';

function App() {
  return (
    <ConvexClientProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F5E6CA] dark:bg-[#1a120b] dark:text-[#f4d5ad] relative transition-colors duration-300">
          <ScrollProgress />
          <Routes>
            <Route path="/" element={
              <>
                <Navbar />
                <main className="max-w-7xl mx-auto md:flex md:items-center">
                  <Hero />
                  <Skills />
                </main>
                <Footer />
              </>
            } />
            <Route path="/rng" element={<RNGPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieBanner />
          <FloatingContact />
          <ScrollUpButton />
        </div>
      </BrowserRouter>
    </ConvexClientProvider>
  );
}

export default App;

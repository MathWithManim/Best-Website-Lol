import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Footer from './components/Footer';
import NotFound from './components/NotFound';
import RNGPage from './pages/RNGPage';
import ProfilePage from './pages/ProfilePage';
import Logout from './pages/Logout';
import CookiePolicy from './pages/CookiePolicy';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ConvexClientProvider from './components/ConvexClientProvider';
import ScrollProgress from './components/ScrollProgress';
import CookieBanner from './components/CookieBanner';
import FloatingContact from './components/FloatingContact';
import ScrollUpButton from './components/ScrollUpButton';
import MobileCTA from './components/MobileCTA';
import Navbar from './components/Navbar';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const pageTransition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1] as const,
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        className="min-h-screen"
      >
        <Routes location={location}>
          <Route path="/" element={
            <>
              <Navbar />
              <main id="main-content" className="max-w-7xl mx-auto md:flex md:items-center">
                <Hero />
                <Skills />
              </main>
              <Footer />
            </>
          } />
          <Route path="/rng" element={<RNGPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ConvexClientProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F5E6CA] dark:bg-[#1a120b] dark:text-[#f4d5ad] relative transition-colors duration-300">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-bg focus:rounded-lg focus:font-mono focus:text-sm">
            Skip to main content
          </a>
          <ScrollProgress />
          <AnimatedRoutes />
          <CookieBanner />
          <FloatingContact />
          <ScrollUpButton />
          <MobileCTA />
        </div>
      </BrowserRouter>
    </ConvexClientProvider>
  );
}

export default App;

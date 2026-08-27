import FeaturesBento from "./components/FeaturesBento";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, m, MotionConfig } from 'framer-motion';
import { lazy, Suspense, useEffect } from 'react';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import TerminalSection from './components/TerminalSection';
import ContactSection from './components/ContactSection';
import ArcadeSection from './components/arcade/ArcadeSection';
import NotFound from './components/NotFound';
import ConvexClientProvider from './components/ConvexClientProvider';
import { UserProvider } from './components/UserProvider';
import AchievementToasts from './components/AchievementToasts';
import { CosmeticThemeProvider } from './components/CosmeticThemeProvider';
import { useSettings } from './lib/settings';
import { SettingsProvider } from './components/SettingsProvider';
import ScrollProgress from './components/ScrollProgress';
import CookieBanner from './components/CookieBanner';
import ScrollUpButton from './components/ScrollUpButton';
import Navbar from './components/Navbar';
import MobileCTA from './components/MobileCTA';
import RNGSection from './components/RNGSection';
import ErrorBoundary from './components/ErrorBoundary';
import Spinner from './components/Spinner';
import { useConvexAuth } from 'convex/react';
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const RootAdmin = lazy(() => import('./pages/RootAdmin'));
const Logout = lazy(() => import('./pages/Logout'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const ArcadePage = lazy(() => import('./pages/ArcadePage'));

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
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Only redirect unauth users from profile/settings routes, not from /rng
  useEffect(() => {
    const protectedRoutes = ['/profile', '/settings'];
    if (protectedRoutes.includes(location.pathname) && !isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [location.pathname, isAuthenticated, navigate]);

  return (
    <AnimatePresence mode="wait">
      <m.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        className="min-h-screen"
      >
        <ErrorBoundary>
          <Suspense fallback={<Spinner />}>
            <Routes location={location}>
            <Route path="/" element={
              <>
                <Navbar />
                <main id="main-content">
                  <Hero />
                  <AboutSection />
                  <TerminalSection />
                  <ContactSection />
                </main>
              </>
            } />
            <Route path="/rng" element={<>
              <RNGSection />
              <ArcadeSection />
            </>} />
            <Route path="/game/:gameId" element={<ArcadePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/u/:username" element={<PublicProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/x8f9a2_rootadmin" element={<RootAdmin />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </m.div>
    </AnimatePresence>
  );
}

function AppShell() {
  const { settings } = useSettings();
  return (
    <MotionConfig reducedMotion={settings.reduceMotion ? 'always' : 'user'}>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F5E6CA] dark:bg-[#1a120b] dark:text-[#f4d5ad] relative transition-colors duration-300">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-bg focus:rounded-lg focus:font-mono focus:text-sm">
            Skip to main content
          </a>
          <ScrollProgress />
          <AnimatedRoutes />
          <CookieBanner />
          <ScrollUpButton />
          <MobileCTA />
          <AchievementToasts />
        </div>
      </BrowserRouter>
    </MotionConfig>
  );
}

function App() {
  return (
    <ConvexClientProvider>
      <UserProvider>
        <SettingsProvider>
          <CosmeticThemeProvider>
            <AppShell />
          </CosmeticThemeProvider>
        </SettingsProvider>
      </UserProvider>
    </ConvexClientProvider>
  );
}

export default App;

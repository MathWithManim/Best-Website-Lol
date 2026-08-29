import { useEffect } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';

const CookiePolicy = () => {
  useEffect(() => {
    document.title = 'Cookie Policy — Jasper Sona';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Read the cookie policy for the Jasper Sona website. Learn about cookies and local storage usage.');
    return () => { document.title = 'Jasper Sona'; };
  }, []);

  return (
    <div className="min-h-screen bg-bg dark:bg-[#1a120b] dark:text-[#f4d5ad] transition-colors duration-300">
      <Breadcrumbs />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-sans font-bold mb-8">Cookie Policy</h1>
        <div className="space-y-6 font-mono text-sm leading-relaxed">
          <p><strong>Last Updated:</strong> August 16, 2026</p>

          <section>
            <h2 className="text-xl font-bold mb-3">1. What Are Cookies</h2>
            <p>Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. How We Use Cookies</h2>
            <p>We use cookies and similar technologies for the following purposes:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Authentication:</strong> To keep you logged in and remember your session.</li>
              <li><strong>Preferences:</strong> To remember your dark mode preference and other settings.</li>
              <li><strong>Game State:</strong> To store your RNG game progress, rarity collection, and LuckBucks balance locally on your device.</li>
              <li><strong>Analytics:</strong> To understand how visitors use our website and improve our services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Types of Cookies We Use</h2>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly. These cannot be disabled.</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences such as dark mode and login state.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Local Storage</h2>
            <p>In addition to cookies, we use browser local storage to store your game data, including your rarity collection, LuckBucks balance, and cosmetic items. This data is stored locally on your device and is encrypted to prevent tampering. You can clear this data at any time through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Third-Party Cookies</h2>
            <p>We may use third-party services that set their own cookies, including:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Convex (backend services)</li>
              <li>Google Analytics (analytics)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Managing Cookies</h2>
            <p>You can control and manage cookies through your browser settings. Most browsers allow you to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>View what cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>
            <p className="mt-2">Please note that blocking or deleting cookies may affect the functionality of our website.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Changes to This Policy</h2>
            <p>We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Contact Us</h2>
            <p>If you have any questions about our use of cookies, please contact us through our website.</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CookiePolicy;

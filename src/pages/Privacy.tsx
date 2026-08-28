import { useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import Breadcrumbs from '../components/Breadcrumbs';
const Privacy = () => {
  useEffect(() => {
    document.title = 'Privacy Policy — Jasper Sona';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Read the privacy policy for the Jasper Sona website. Learn how we collect, use, and protect your data.');
    return () => { document.title = 'Jasper Sona'; };
  }, []);

  return (
    <div className="min-h-screen bg-bg dark:bg-[#1a120b] dark:text-[#f4d5ad] transition-colors duration-300">
      <Navbar />
      <Breadcrumbs />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-sans font-bold mb-8">Privacy Policy</h1>
        <div className="space-y-6 font-mono text-sm leading-relaxed">
          <p><strong>Last Updated:</strong> August 16, 2026</p>

          <section>
            <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
            <p>We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use the Jasper Sona website ("the Service").</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Account Information:</strong> Email address, username, display name, bio, and profile picture URL.</li>
              <li><strong>Game Data:</strong> RNG roll results, rarity collections, LuckBucks balance, cosmetic items, and leaderboard rankings.</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on the Service, and interaction patterns.</li>
              <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Provide and maintain the Service</li>
              <li>Process your game transactions and maintain your account</li>
              <li>Display leaderboards and community features</li>
              <li>Improve and optimize the Service</li>
              <li>Communicate with you about updates or changes</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Data Storage and Security</h2>
            <p>Your data is stored on secure servers provided by Convex. We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
            <p className="mt-2">Game progress is also cached locally in your browser using encrypted local storage. This data remains on your device and can be cleared at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share anonymized, aggregated data that cannot be used to identify you individually. We may share your information only:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>With service providers who assist in operating the Service (under strict confidentiality agreements)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Cookies and Local Storage</h2>
            <p>We use cookies and local storage to provide the Service. For more details, please see our <a href="/cookies" className="underline text-accent dark:text-[#c98a6e]">Cookie Policy</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Children's Privacy</h2>
            <p>The Service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal data from a child under 13, we will take steps to delete such information.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy or our data practices, please contact us through the website.</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Privacy;

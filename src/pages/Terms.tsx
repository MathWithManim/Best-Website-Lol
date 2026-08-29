import { useEffect } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
const Terms = () => {
  useEffect(() => {
    document.title = 'Terms & Conditions — Jasper Sona';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Read the terms and conditions for using the Jasper Sona website and RNG game.');
    return () => { document.title = 'Jasper Sona'; };
  }, []);

  return (
    <div className="min-h-screen bg-bg dark:bg-[#1a120b] dark:text-[#f4d5ad] transition-colors duration-300">
      <Breadcrumbs />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-sans font-bold mb-8">Terms and Conditions</h1>
        <div className="space-y-6 font-mono text-sm leading-relaxed">
          <p><strong>Last Updated:</strong> August 16, 2026</p>

          <section>
            <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using the Jasper Sona website ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not access the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Description of Service</h2>
            <p>The Service provides a personal website with an RNG (Random Number Generator) game, user profiles, and community features. Users can roll for random rarities, collect items, earn LuckBucks currency, and compete on leaderboards.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. User Accounts</h2>
            <p>To access certain features, you must create an account. You are responsible for:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
            <p className="mt-2">You must be at least 13 years old to create an account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Virtual Currency and Items</h2>
            <p>LuckBucks and rarity items within the Service are virtual goods with no real-world monetary value. They cannot be transferred, exchanged, or redeemed for real money. We reserve the right to modify, suspend, or discontinue the virtual economy at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Fair Play</h2>
            <p>You agree not to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Use bots, scripts, or automated tools to interact with the Service</li>
              <li>Exploit bugs or glitches for unfair advantage</li>
              <li>Attempt to manipulate or tamper with game data, including client-side storage</li>
              <li>Create multiple accounts to gain unfair advantages</li>
              <li>Engage in any activity that disrupts the Service for other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Intellectual Property</h2>
            <p>All content on the Service, including text, graphics, logos, and software, is the property of Jasper Sona and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. User Content</h2>
            <p>By posting content on the Service (such as profile information), you grant us a non-exclusive, worldwide, royalty-free license to use, modify, and display such content in connection with the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Limitation of Liability</h2>
            <p>The Service is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify users of significant changes through the Service. Your continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">11. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">12. Contact</h2>
            <p>For questions about these Terms, please contact us through the website.</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Terms;

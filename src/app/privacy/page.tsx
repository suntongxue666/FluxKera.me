import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Flux Krea AI",
  description: "Learn how Flux Krea collects, uses, stores, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-10">Last updated: 2025-08-19</p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              This Privacy Policy explains how Flux Krea ("we", "us", "our") collects, uses, and safeguards information in connection with our website and services, including our AI image generation features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account data</strong> (if you sign in): email address, basic profile information.</li>
              <li><strong>Usage data</strong>: device/browser, IP-derived region, timestamps, logs for security and abuse prevention.</li>
              <li><strong>Generated content</strong>: prompts, parameters, and generated images.</li>
              <li><strong>Cookies</strong> and similar technologies to maintain sessions and improve experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. How We Use Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and operate the service (credits, generation, history).</li>
              <li>Improve model quality, reliability, and user experience.</li>
              <li>Detect and prevent fraud, abuse, or security incidents.</li>
              <li>Comply with legal obligations and enforce our Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Legal Bases</h2>
            <p>We process personal data under legitimate interests, performance of a contract, consent (where required), and legal obligations.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Data Retention</h2>
            <p>We retain data only as long as necessary for the purposes above, or as required by law. You may request deletion of your account data where applicable.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Sharing & Processors</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Inference providers (e.g., Replicate or similar) to process prompts and generate images.</li>
              <li>Authentication/Database (e.g., Supabase or similar) to manage accounts and store minimal data.</li>
              <li>Analytics/Logging to understand usage and improve stability.</li>
            </ul>
            <p className="mt-2">We do not sell personal information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. International Transfers</h2>
            <p>Where data is transferred internationally, we use appropriate safeguards (e.g., SCCs) as required by applicable law.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Security</h2>
            <p>We implement reasonable technical and organizational measures; however, no method of transmission or storage is completely secure.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Your Rights</h2>
            <p>Depending on your region, you may have rights to access, correct, delete, or export your data, and to object or restrict processing. Contact us to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Children's Privacy</h2>
            <p>Our services are not directed to children under 13 (or the equivalent age in your jurisdiction). We do not knowingly collect data from children.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. AI-Generated Content</h2>
            <p>Prompts and outputs may be used in aggregated/anonymized form to improve quality and safety. Do not submit confidential or sensitive personal data in prompts.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Cookies</h2>
            <p>You can control cookies through your browser settings. Disabling cookies may affect some features.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">13. Changes</h2>
            <p>We may update this Policy periodically. We will post the updated version with a new "Last updated" date.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">14. Contact</h2>
            <p>For privacy inquiries: tiktreeapp@gmail.com</p>
          </section>
        </div>
      </section>
    </div>
  );
}
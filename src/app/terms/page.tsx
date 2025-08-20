import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Flux Krea AI",
  description: "Read the Terms of Service for Flux Krea: acceptable use, ownership, payments, and legal terms.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-10">Last updated: 2025-08-19</p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Agreement to Terms</h2>
            <p>By accessing or using Flux Krea (the "Service"), you agree to these Terms. If you do not agree, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Eligibility</h2>
            <p>You must be at least 13 years old (or the age of digital consent in your region). If using on behalf of an entity, you represent you have authority to bind that entity.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Accounts & Credits</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for your account and for maintaining the confidentiality of credentials.</li>
              <li>Credits enable image generation and related features; credits are not legal tender and may expire or change as described in the Service.</li>
              <li>We may adjust credits for abuse, refunds, or technical issues.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Acceptable Use</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>No illegal, harmful, or abusive content (including harassment, hate, sexual exploitation, or violent extremism).</li>
              <li>No infringement, reverse engineering, scraping at scale, or circumventing security/limits.</li>
              <li>Comply with applicable laws and third‑party rights when using generated content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Ownership & License</h2>
            <p>You retain rights to your prompts and outputs to the extent permitted by law. By using the Service, you grant us a limited license to host, process, and display content as necessary to operate and improve the Service, including safety and quality purposes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. IP Infringement</h2>
            <p>If you believe content infringes your rights, contact us with sufficient details so we can investigate and respond appropriately.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Payments & Refunds</h2>
            <p>Paid plans and credit purchases are billed as shown at checkout. Unless stated otherwise, payments are non‑refundable except as required by law or our posted refund policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Disclaimers</h2>
            <p>The Service is provided "as is" without warranties of any kind. We do not warrant accuracy, availability, or fitness for a particular purpose. Outputs may be inaccurate or unsuitable.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, we will not be liable for indirect, incidental, or consequential damages. Our total liability for any claim is limited to amounts you paid to us in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Indemnity</h2>
            <p>You agree to indemnify and hold us harmless from claims arising out of your use of the Service or violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Suspension & Termination</h2>
            <p>We may suspend or terminate access for violations, risk, or legal reasons. You may stop using the Service at any time.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Changes to the Service</h2>
            <p>Features may change or be discontinued. We will make reasonable efforts to notify material changes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">13. Governing Law</h2>
            <p>These Terms are governed by applicable laws of your local jurisdiction unless superseded by mandatory law.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">14. Contact</h2>
            <p>Questions about these Terms: tiktreeapp@gmail.com</p>
          </section>
        </div>
      </section>
    </div>
  );
}
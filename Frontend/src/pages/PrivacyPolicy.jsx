import React, { useEffect } from "react";
import Footer from "../components/Footer";

export default function UserDataPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy | Triple Portion";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <div className="flex-grow">
        {/* Header */}
        <header className="bg-white border-b border-rose-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <h1 className="text-4xl font-bold text-gray-900">
              Privacy Policy & <span className="text-rose-600">Data Usage</span>
            </h1>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              Last Updated: April 2026
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
          {/* Intro */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              This User Data & Usage Policy explains what information we collect
              from you, how we use it, and the steps we take to protect it when
              you use our eCommerce website (“we,” “us,” or “our”). By using our
              website or making a purchase, you agree to the practices described
              in this policy.
            </p>
          </section>

          {/* Data We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Information We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
              <li>
                <strong>Personal Information:</strong> Your name, email, phone
                number, shipping and billing addresses provided at checkout or
                account registration.
              </li>
              <li>
                <strong>Payment Information:</strong> Processed securely by our
                trusted partners such as <strong>Stripe</strong> or{" "}
                <strong>PayPal</strong>. We do not store or access your card
                details directly.
              </li>
              <li>
                <strong>Order Details:</strong> Information about the products you
                purchase, order history, and delivery preferences.
              </li>
              <li>
                <strong>Technical Information:</strong> Browser type, IP address,
                device type, and cookies for essential functionality and
                performance optimization.
              </li>
              <li>
                <strong>Marketing & Communication Data:</strong> Your preferences
                if you subscribe to our newsletter or opt in for promotional
                messages.
              </li>
            </ul>
          </section>

          {/* How We Use It */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
              <li>To process and deliver your orders efficiently.</li>
              <li>
                To communicate order confirmations, updates, or customer service
                responses.
              </li>
              <li>
                To personalize your shopping experience and improve our site.
              </li>
              <li>To detect and prevent fraudulent or unauthorized activity.</li>
              <li>
                To send promotional offers or newsletters (only if you have opted
                in).
              </li>
            </ul>
          </section>

          {/* Third Party Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Third-Party Access & Sharing
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We only share necessary information with trusted third parties to
              operate our business:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-700 leading-relaxed">
              <li>
                <strong>Payment Providers</strong> – Stripe, PayPal (to process
                payments securely).
              </li>
              <li>
                <strong>Shipping Partners</strong> – courier services to deliver
                your orders.
              </li>
              <li>
                <strong>Analytics Providers</strong> – Google Analytics or similar
                tools to understand website performance and user experience.
              </li>
            </ul>
            <p className="mt-3 text-gray-700 leading-relaxed">
              We never sell or rent your personal information to third parties.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal data only as long as necessary to fulfill
              your orders, provide customer support, comply with legal
              obligations, and maintain transaction records for accounting
              purposes. Marketing data is retained until you unsubscribe or
              request deletion.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Your Rights & Choices
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
              <li>Access, correct, or delete your personal data.</li>
              <li>Withdraw consent for marketing communications.</li>
              <li>Request a copy of your stored data.</li>
              <li>
                Disable cookies via your browser (note: some site functions may be
                affected).
              </li>
            </ul>
            <p className="mt-3 text-gray-700 leading-relaxed">
              To exercise any of these rights, please contact us at{" "}
              <a
                href="mailto:privacy@tripleportion.com"
                className="text-rose-600 hover:text-rose-700 font-semibold underline decoration-rose-200 underline-offset-4"
              >
                privacy@tripleportion.com
              </a>
              .
            </p>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Security Measures
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We use SSL encryption and secure hosting to protect your data. All
              transactions are processed through PCI-DSS compliant payment
              gateways. We continuously monitor and update our systems to prevent
              unauthorized access, data loss, or misuse.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Cookies and Tracking
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our website uses cookies to enable cart functionality, login
              sessions, and essential features. Optional cookies may be used to
              improve performance and gather analytics. You can manage or disable
              cookies in your browser settings.
            </p>
          </section>

          {/* Policy Updates */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Updates to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this User Data & Usage Policy periodically to reflect
              changes in our practices, technologies, or legal obligations. The
              latest version will always be available on this page with an updated
              “Last Updated” date.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed">
              For any privacy or data-related inquiries, please contact our
              support team at{" "}
              <a
                href="mailto:support@tripleportion.com"
                className="text-rose-600 hover:text-rose-700 font-semibold underline decoration-rose-200 underline-offset-4"
              >
                support@tripleportion.com
              </a>
              .
            </p>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}

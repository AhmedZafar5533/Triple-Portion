import React, { useEffect } from "react";
import Footer from "../components/Footer";

export default function TermsOfService() {
  useEffect(() => {
    document.title = "Terms of Service | Triple Portion";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <div className="flex-grow">
        {/* Header */}
        <header className="bg-white border-b border-rose-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <h1 className="text-4xl font-bold text-gray-900">
              Terms of <span className="text-rose-600">Service</span>
            </h1>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              Last Updated: April 2026
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to our platform (“we,” “our,” or “us”). By using our
              website, software, or services (“Services”), you agree to these
              Terms of Service (“Terms”). Please read them carefully before using
              our Services. If you do not agree, you must not use the platform.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Eligibility
            </h2>
            <p className="text-gray-700 leading-relaxed">
              You must be at least 18 years old to use our Services. By creating
              an account or using the platform, you represent that you have the
              legal capacity to enter into a binding agreement.
            </p>
          </section>

          {/* Account Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Account Responsibilities
            </h2>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities under your account. You
              must notify us immediately of any unauthorized access or security
              breach.
            </p>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Acceptable Use
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
              <li>Do not misuse or attempt to disrupt our Services.</li>
              <li>
                Do not upload or share content that is illegal, infringing, or
                harmful to others.
              </li>
              <li>
                Do not reverse-engineer, copy, or resell any part of our platform
                without explicit permission.
              </li>
            </ul>
          </section>

          {/* Payments & Billing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Payments & Billing
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Payments for subscriptions, credits, or services are processed
                securely through third-party payment providers such as{" "}
                <strong>Stripe</strong>. By completing a transaction, you agree to
                Stripe’s terms and conditions.
              </p>
              <p>
                All prices are listed in USD (or your local currency where
                applicable) and are subject to change at any time. You authorize
                us to charge your selected payment method for any applicable fees,
                taxes, or recurring subscriptions.
              </p>
            </div>
          </section>

          {/* Refund Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Refund Policy
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We aim to ensure customer satisfaction, but since our Services are
                digital and immediately accessible,{" "}
                <strong>all sales are generally final</strong>.
              </p>
              <p>
                Refunds may be granted in exceptional cases (e.g., accidental
                duplicate payments or technical issues preventing use of the
                service). If approved, refunds will be issued to the original
                payment method.
              </p>
              <p>
                Please note that{" "}
                <strong>Stripe retains a 2.9% + $0.30 processing fee</strong> on
                all transactions, including refunds. Therefore, any refunded
                amount will exclude these processing fees.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Intellectual Property
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All content, code, trademarks, and materials on this website are the
              intellectual property of the platform or its licensors. You may not
              copy, distribute, or create derivative works without our prior
              written consent.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Termination
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may suspend or terminate your access to our Services if you
              violate these Terms, misuse the platform, or engage in unlawful
              activity. You may also terminate your account at any time by
              contacting support.
            </p>
          </section>

          {/* Disclaimer of Warranties */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Disclaimer of Warranties
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our Services are provided “as is” and “as available.” We do not
              guarantee that the Services will be uninterrupted, error-free, or
              secure. To the fullest extent permitted by law, we disclaim all
              warranties, whether express or implied.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, we shall not be liable for
              any indirect, incidental, consequential, or punitive damages arising
              from your use or inability to use the Services, even if we were
              advised of such damages.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Changes to These Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update these Terms from time to time to reflect changes in
              our practices, services, or legal obligations. Updates will be
              posted on this page with a new “Last Updated” date. Continued use of
              the Services after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about these Terms or our policies, please
              contact our support team at{" "}
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

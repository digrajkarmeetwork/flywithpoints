import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | FlyWithPoints',
  description: 'Terms of Service for FlyWithPoints award flight search',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 mb-6">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600">
              By accessing and using FlyWithPoints, you accept and agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Description of Service</h2>
            <p className="text-slate-600">
              FlyWithPoints is a tool that helps users find award flight availability across
              various airline loyalty programs. We aggregate publicly available information
              and provide AI-powered recommendations for optimizing point redemptions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Disclaimer</h2>
            <p className="text-slate-600 mb-4">
              Important disclaimers regarding our service:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>We are not affiliated with any airline or loyalty program</li>
              <li>Award availability and pricing are subject to change without notice</li>
              <li>We do not guarantee the accuracy of displayed information</li>
              <li>Always verify availability directly with the airline before booking</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. User Accounts</h2>
            <p className="text-slate-600">
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. You agree to notify us
              immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Acceptable Use</h2>
            <p className="text-slate-600 mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Scrape or collect data from our service without permission</li>
              <li>Interfere with or disrupt the service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Limitation of Liability</h2>
            <p className="text-slate-600">
              FlyWithPoints is provided &quot;as is&quot; without warranties of any kind. We shall not
              be liable for any indirect, incidental, special, or consequential damages arising
              from your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Changes to Terms</h2>
            <p className="text-slate-600">
              We reserve the right to modify these terms at any time. Continued use of the
              service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Contact</h2>
            <p className="text-slate-600">
              For questions about these Terms of Service, please contact us through our
              GitHub repository.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

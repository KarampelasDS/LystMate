import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy · LystMate",
  description: "How LystMate collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/login" className="text-sm text-warm-muted hover:text-espresso transition-colors mb-8 inline-block">
          &larr; Back
        </Link>

        <h1 className="font-serif text-4xl text-espresso mb-2">Privacy Policy</h1>
        <p className="text-sm text-warm-muted mb-10">Last updated: June 2026</p>

        <div className="space-y-8 text-sm text-espresso leading-relaxed">
          <section>
            <h2 className="font-serif text-xl mb-3">Who we are</h2>
            <p>LystMate is a personal project by Dimitrios Spyridon Karampelas. The service is available at <a href="https://www.lystmate.app" className="underline hover:text-warm-brown">www.lystmate.app</a>. If you have questions about this policy, contact us at <a href="mailto:hello@lystmate.app" className="underline hover:text-warm-brown">hello@lystmate.app</a>.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">What data we collect</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account data</strong> — your name, email address, and a hashed (bcrypt) password when you register.</li>
              <li><strong>List and item data</strong> — the lists, items, and invites you create or are invited to.</li>
              <li><strong>Usage data</strong> — standard server logs including IP address, browser type, and pages visited. These are not linked to your account and are retained for a maximum of 30 days.</li>
            </ul>
            <p className="mt-3">We do not collect payment information, location data, or any third-party tracking data. We do not use analytics tools (e.g. Google Analytics).</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Why we collect it</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To provide and maintain the service (account authentication, list management).</li>
              <li>To send transactional emails — email verification, password reset, and security alerts. We use <a href="https://resend.com" className="underline hover:text-warm-brown">Resend</a> to deliver these.</li>
              <li>To protect the service from abuse (rate limiting, fraud prevention).</li>
            </ul>
            <p className="mt-3">We do not send marketing emails. We do not sell your data to anyone.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Legal basis (GDPR)</h2>
            <p>For users in the EU/EEA, we process your personal data on the following bases:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Contract</strong> — processing your name and email is necessary to provide the service you signed up for.</li>
              <li><strong>Legitimate interests</strong> — server logs and rate limiting to keep the service secure and operational.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">How we store your data</h2>
            <p>Your data is stored in a PostgreSQL database hosted on <a href="https://railway.app" className="underline hover:text-warm-brown">Railway</a> in the EU region. Passwords are never stored in plain text — only bcrypt hashes. Access tokens are short-lived (15 minutes). Refresh tokens are stored in httpOnly cookies.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Third-party services</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><a href="https://railway.app" className="underline hover:text-warm-brown">Railway</a> — database and API hosting.</li>
              <li><a href="https://vercel.com" className="underline hover:text-warm-brown">Vercel</a> — frontend hosting and edge network.</li>
              <li><a href="https://resend.com" className="underline hover:text-warm-brown">Resend</a> — transactional email delivery.</li>
            </ul>
            <p className="mt-3">Each of these services has its own privacy policy. We share only the minimum data necessary for each service to function.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Your rights</h2>
            <p>Under GDPR you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
              <li><strong>Rectification</strong> — correct inaccurate data (you can do this directly in Settings).</li>
              <li><strong>Erasure</strong> — delete your account and all associated data at any time from Settings &rarr; Danger zone.</li>
              <li><strong>Portability</strong> — request your data in a machine-readable format.</li>
              <li><strong>Object</strong> — object to processing based on legitimate interests.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, email us at <a href="mailto:hello@lystmate.app" className="underline hover:text-warm-brown">hello@lystmate.app</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Data retention</h2>
            <p>Your account data is retained for as long as your account exists. When you delete your account, all personal data — including your name, email, lists, items, and invites — is permanently deleted immediately. Server logs are retained for 30 days then automatically purged.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Cookies</h2>
            <p>We use one cookie: a <code className="bg-warm-border/50 px-1 py-0.5 rounded text-xs">refreshToken</code> httpOnly cookie used solely for authentication. It is not a tracking cookie and contains no personal data. No consent banner is required for strictly necessary cookies.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Changes to this policy</h2>
            <p>If we make material changes we will update the date at the top of this page. Continued use of LystMate after changes are posted constitutes acceptance of the updated policy.</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-warm-border text-xs text-warm-muted flex gap-4">
          <Link href="/terms" className="hover:text-espresso transition-colors">Terms of Service</Link>
          <Link href="/login" className="hover:text-espresso transition-colors">Back to app</Link>
        </div>
      </div>
    </div>
  );
}

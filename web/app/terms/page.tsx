import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service · LystMate",
  description: "The terms governing your use of LystMate.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/login" className="text-sm text-warm-muted hover:text-espresso transition-colors mb-8 inline-block">
          &larr; Back
        </Link>

        <h1 className="font-serif text-4xl text-espresso mb-2">Terms of Service</h1>
        <p className="text-sm text-warm-muted mb-10">Last updated: June 2026</p>

        <div className="space-y-8 text-sm text-espresso leading-relaxed">
          <section>
            <h2 className="font-serif text-xl mb-3">Acceptance</h2>
            <p>By creating an account or using LystMate you agree to these terms. If you do not agree, do not use the service. LystMate is operated by Dimitrios Spyridon Karampelas as a personal project.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">The service</h2>
            <p>LystMate lets you create collaborative lists, invite other users, and manage items together. The service is provided free of charge and on an as-is basis. We reserve the right to modify, suspend, or discontinue the service at any time without notice.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Your account</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You must be at least 13 years old to use LystMate.</li>
              <li>You are responsible for keeping your password secure.</li>
              <li>You may not share your account with others or create accounts on behalf of others without their consent.</li>
              <li>One account per person. Duplicate accounts may be removed.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Acceptable use</h2>
            <p>You agree not to use LystMate to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Upload, share, or transmit any content that is illegal, harmful, abusive, harassing, defamatory, or otherwise objectionable.</li>
              <li>Spam other users with unsolicited invites or messages.</li>
              <li>Attempt to gain unauthorised access to any account or system.</li>
              <li>Scrape, crawl, or automate requests to the service in a way that places unreasonable load on our infrastructure.</li>
              <li>Impersonate any person or entity.</li>
            </ul>
            <p className="mt-3">We reserve the right to suspend or terminate accounts that violate these rules without prior notice.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Your content</h2>
            <p>You own the content you create on LystMate (list names, items, etc.). By using the service you grant us a limited licence to store and display that content solely for the purpose of providing the service to you and your collaborators. We do not claim ownership of your content and we do not use it for any other purpose.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Shared lists</h2>
            <p>When you invite another user to a list, they can view or edit it according to the role you assign. You are responsible for managing who has access to your lists. Removing a member or deleting a list takes effect immediately.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Account termination</h2>
            <p>You may delete your account at any time from Settings &rarr; Danger zone. Deletion is immediate and permanent — all your lists, items, and invites are removed. We cannot recover deleted accounts.</p>
            <p className="mt-3">We may terminate or suspend your account if you violate these terms or if we discontinue the service.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Disclaimer of warranties</h2>
            <p>LystMate is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the service will be uninterrupted, error-free, or that data will never be lost. You use the service at your own risk.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Limitation of liability</h2>
            <p>To the fullest extent permitted by law, LystMate and its operator shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the service.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Governing law</h2>
            <p>These terms are governed by the laws of Greece. Any disputes shall be subject to the exclusive jurisdiction of the courts of Greece.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Changes to these terms</h2>
            <p>We may update these terms from time to time. The date at the top of this page will reflect the latest version. Continued use of LystMate after changes are posted constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Contact</h2>
            <p>Questions about these terms? Email us at <a href="mailto:hello@lystmate.app" className="underline hover:text-warm-brown">hello@lystmate.app</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-warm-border text-xs text-warm-muted flex gap-4">
          <Link href="/privacy" className="hover:text-espresso transition-colors">Privacy Policy</Link>
          <Link href="/login" className="hover:text-espresso transition-colors">Back to app</Link>
        </div>
      </div>
    </div>
  );
}

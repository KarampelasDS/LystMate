"use client";

import { useState } from "react";
import Link from "next/link";
import { auth } from "@/app/lib/api";
import { Alert } from "@/app/components/alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.forgotPassword(email);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-warm-white rounded-3xl border border-warm-border p-8 shadow-sm text-center">
          <h2 className="font-serif text-2xl mb-3">Check your inbox</h2>
          <p className="text-sm text-warm-brown mb-6">If that address is registered, a reset link has been sent.</p>
          <Link href="/login" className="text-sm text-warm-brown hover:text-espresso transition-colors">Back to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-4xl text-center mb-2 text-espresso">LystMate</h1>
        <p className="text-center text-warm-brown text-sm mb-8">your shared lists, simplified</p>

        <div className="bg-warm-white rounded-3xl border border-warm-border p-8 shadow-sm">
          <h2 className="font-serif text-xl mb-1">Forgot password</h2>
          <p className="text-sm text-warm-brown mb-6">Enter your email and we'll send a reset link.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-warm-brown mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.slice(0, 254))}
                required
                maxLength={254}
                className="w-full border border-warm-border rounded-xl px-4 py-2.5 text-sm bg-cream focus:outline-none focus:border-espresso transition-colors"
              />
            </div>
            {error && <Alert message={error} onDismiss={() => setError("")} />}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-espresso text-warm-white rounded-xl py-2.5 text-sm font-medium hover:bg-espresso-light transition-colors disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
          <div className="mt-5 pt-5 border-t border-warm-border text-sm text-warm-brown">
            <Link href="/login" className="hover:text-espresso transition-colors">Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

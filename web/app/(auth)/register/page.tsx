"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import { auth } from "@/app/lib/api";
import { Alert } from "@/app/components/alert";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.register(name, email, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-warm-white rounded-3xl border border-warm-border p-8 shadow-sm text-center">
          <h2 className="font-serif text-2xl mb-3">Check your inbox</h2>
          <p className="text-sm text-warm-brown mb-6">We sent a verification link to <span className="text-espresso font-medium">{email}</span>. Click it to activate your account.</p>
          <button onClick={() => router.push("/login")} className="text-sm text-warm-brown hover:text-espresso transition-colors">Back to sign in</button>
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
          <h2 className="font-serif text-xl mb-6">Create account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-warm-brown mb-1.5 uppercase tracking-wide">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                className="w-full border border-warm-border rounded-xl px-4 py-2.5 text-sm bg-cream focus:outline-none focus:border-espresso transition-colors"
              />
            </div>
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
            <div>
              <label className="block text-xs font-medium text-warm-brown mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={128}
                  className="w-full border border-warm-border rounded-xl px-4 py-2.5 pr-10 text-sm bg-cream focus:outline-none focus:border-espresso transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-warm-muted hover:text-espresso transition-colors"
                >
                  {showPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <Alert message={error} onDismiss={() => setError("")} />}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-espresso text-warm-white rounded-xl py-2.5 text-sm font-medium hover:bg-espresso-light transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
          <div className="mt-5 pt-5 border-t border-warm-border text-sm text-warm-brown">
            <p>Already have an account? <Link href="/login" className="text-espresso hover:underline">Sign in</Link></p>
          </div>
          <div className="mt-6 flex gap-4 justify-center text-xs text-warm-muted">
            <Link href="/privacy" className="hover:text-espresso transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-espresso transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

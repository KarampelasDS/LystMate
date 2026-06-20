"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import { useAuth } from "@/app/contexts/auth-context";
import { Alert } from "@/app/components/alert";

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [user, authLoading, router]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-4xl text-center mb-2 text-espresso">LystMate</h1>
        <p className="text-center text-warm-brown text-sm mb-8">your shared lists, simplified</p>

        <div className="bg-warm-white rounded-3xl border border-warm-border p-8 shadow-sm">
          <h2 className="font-serif text-xl mb-6">Sign in</h2>
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
            <div>
              <label className="block text-xs font-medium text-warm-brown mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  maxLength={128}
                  className="w-full border border-warm-border rounded-xl px-4 py-2.5 pr-10 text-sm bg-cream focus:outline-none focus:border-espresso transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-warm-muted hover:text-espresso transition-colors cursor-pointer"
                  tabIndex={-1}
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
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <div className="mt-5 pt-5 border-t border-warm-border text-sm text-warm-brown space-y-2">
            <p><Link href="/forgot-password" className="hover:text-espresso transition-colors">Forgot your password?</Link></p>
            <p>No account? <Link href="/register" className="text-espresso hover:underline">Register</Link></p>
            <p>Need to verify? <Link href="/resend-verification" className="text-espresso hover:underline">Resend email</Link></p>
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

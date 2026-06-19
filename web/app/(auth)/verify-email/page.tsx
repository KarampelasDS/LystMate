"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/app/lib/api";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = use(searchParams);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("No token provided."); return; }
    auth.verifyEmail(token)
      .then((data) => { setStatus("success"); setMessage(data.message); })
      .catch((err) => { setStatus("error"); setMessage(err instanceof Error ? err.message : "Verification failed"); });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-warm-white rounded-3xl border border-warm-border p-8 shadow-sm text-center">
        {status === "loading" && (
          <p className="text-sm text-warm-brown">Verifying your email…</p>
        )}
        {status === "success" && (
          <>
            <h2 className="font-serif text-2xl mb-3">Email verified</h2>
            <p className="text-sm text-warm-brown mb-6">{message}</p>
            <Link href="/login" className="bg-espresso text-warm-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-espresso-light transition-colors inline-block">Sign in</Link>
          </>
        )}
        {status === "error" && (
          <>
            <h2 className="font-serif text-2xl mb-3">Verification failed</h2>
            <p className="text-sm text-red-700 mb-6">{message}</p>
            <Link href="/resend-verification" className="text-sm text-espresso hover:underline">Resend verification email</Link>
          </>
        )}
      </div>
    </div>
  );
}

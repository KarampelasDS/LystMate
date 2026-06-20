"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiOutlinePencil, HiOutlineEnvelope, HiOutlineExclamationTriangle,
  HiArrowRightOnRectangle, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash,
} from "react-icons/hi2";
import { FaceAvatar } from "@/app/components/face-avatar";
import { useAuth } from "@/app/contexts/auth-context";
import { users, auth, setToken } from "@/app/lib/api";
import { Alert } from "@/app/components/alert";

const btn = "text-sm px-5 py-2.5 rounded-xl transition-all duration-150 active:scale-[0.97] cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed shrink-0";
const btnPrimary = `${btn} bg-espresso text-warm-white hover:bg-espresso-light`;
const inputClass = "w-full border border-warm-border rounded-xl px-3 py-2.5 text-sm bg-cream focus:outline-none focus:border-espresso transition-colors duration-150";

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex-1">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className={`${inputClass} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-muted hover:text-espresso transition-colors cursor-pointer"
        tabIndex={-1}
      >
        {show ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name ?? "");
  const [nameMsg, setNameMsg] = useState("");
  const [nameLoading, setNameLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [deletePw, setDeletePw] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [logoutAllMsg, setLogoutAllMsg] = useState("");

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim() === user?.name) return;
    setNameMsg(""); setNameLoading(true);
    try {
      await users.update(name);
      const updated = await users.getMe();
      setUser(updated);
      setNameMsg("Name updated.");
    } catch (err) {
      setNameMsg(err instanceof Error ? err.message : "Failed to update name");
    } finally { setNameLoading(false); }
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    setEmailMsg(""); setEmailLoading(true);
    try {
      await users.requestEmailChange(email);
      setEmail("");
      setEmailMsg("Verification email sent to your new address.");
    } catch (err) {
      setEmailMsg(err instanceof Error ? err.message : "Failed to request change");
    } finally { setEmailLoading(false); }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(""); setPwLoading(true);
    try {
      await users.changePassword(currentPw, newPw);
      setCurrentPw(""); setNewPw("");
      setPwMsg("Password changed.");
    } catch (err) {
      setPwMsg(err instanceof Error ? err.message : "Failed to change password");
    } finally { setPwLoading(false); }
  }

  async function handleLogoutAll() {
    if (!confirm("This will sign you out of all devices. Continue?")) return;
    try {
      await auth.logoutAll();
      setToken(null);
      router.replace("/login");
    } catch (err) {
      setLogoutAllMsg(err instanceof Error ? err.message : "Failed");
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("This will permanently delete your account and all your lists. This cannot be undone.")) return;
    setDeleteMsg(""); setDeleteLoading(true);
    try {
      await users.deleteAccount(deletePw);
      setToken(null);
      router.replace("/login");
    } catch (err) {
      setDeleteMsg(err instanceof Error ? err.message : "Failed to delete account");
      setDeleteLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-warm-white border border-warm-border rounded-2xl p-6 mb-5 flex items-center gap-5">
        <FaceAvatar name={user?.name ?? ""} size={72} interactive className="rounded-2xl overflow-hidden" />
        <div className="min-w-0">
          <p className="font-serif text-2xl text-espresso leading-tight truncate">{user?.name}</p>
          <p className="text-sm text-warm-muted mt-0.5 truncate">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Display name */}
        <div className="bg-warm-white border border-warm-border rounded-2xl p-5">
          <h2 className="font-serif text-base mb-3 flex items-center gap-2 text-espresso">
            <HiOutlinePencil className="w-4 h-4 text-warm-brown shrink-0" />
            Display name
          </h2>
          <form onSubmit={handleUpdateName} className="flex flex-col sm:flex-row gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} className={`${inputClass} flex-1`} />
            <button type="submit" disabled={nameLoading || name.trim() === user?.name} className={btnPrimary}>
              {nameLoading ? "Saving…" : "Save"}
            </button>
          </form>
          <p className="text-xs text-warm-muted mt-1">{name.length} / 100</p>
          {nameMsg && <div className="mt-2"><Alert message={nameMsg} onDismiss={() => setNameMsg("")} variant="info" /></div>}
        </div>

        {/* Change email */}
        <div className="bg-warm-white border border-warm-border rounded-2xl p-5">
          <h2 className="font-serif text-base mb-1 flex items-center gap-2 text-espresso">
            <HiOutlineEnvelope className="w-4 h-4 text-warm-brown shrink-0" />
            Change email
          </h2>
          <p className="text-xs text-warm-muted mb-1">Current: <span className="text-espresso">{user?.email}</span></p>
          <p className="text-xs text-warm-muted mb-3">A verification link will be sent before the change takes effect.</p>
          <form onSubmit={handleEmailChange} className="flex flex-col sm:flex-row gap-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value.slice(0, 254))} required maxLength={254} placeholder="new@example.com" className={`${inputClass} flex-1`} />
            <button type="submit" disabled={emailLoading || !emailValid} className={btnPrimary}>
              {emailLoading ? "Sending…" : "Send"}
            </button>
          </form>
          <p className="text-xs text-warm-muted mt-1">{email.length} / 254</p>
          {emailMsg && <div className="mt-2"><Alert message={emailMsg} onDismiss={() => setEmailMsg("")} variant="info" /></div>}
        </div>

        {/* Change password */}
        <div className="bg-warm-white border border-warm-border rounded-2xl p-5">
          <h2 className="font-serif text-base mb-3 flex items-center gap-2 text-espresso">
            <HiOutlineLockClosed className="w-4 h-4 text-warm-brown shrink-0" />
            Change password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <PasswordInput value={currentPw} onChange={setCurrentPw} placeholder="Current password" />
            <PasswordInput value={newPw} onChange={setNewPw} placeholder="New password (min 8 characters)" />
            <button type="submit" disabled={pwLoading || !currentPw || newPw.length < 8} className={`${btnPrimary} w-full`}>
              {pwLoading ? "Saving…" : "Change password"}
            </button>
          </form>
          {pwMsg && <div className="mt-2"><Alert message={pwMsg} onDismiss={() => setPwMsg("")} variant="info" /></div>}
        </div>

        {/* Sign out */}
        <button
          onClick={async () => { await logout(); router.replace("/login"); }}
          className="w-full flex items-center justify-center gap-2 bg-warm-white border border-warm-border rounded-2xl px-5 py-3.5 text-sm text-warm-brown hover:text-espresso hover:bg-cream active:scale-[0.98] transition-all duration-150 cursor-pointer select-none"
        >
          <HiArrowRightOnRectangle className="w-4 h-4" />
          Sign out
        </button>

        {/* Legal links */}
        <div className="flex gap-4 justify-center text-xs text-warm-muted pt-1">
          <Link href="/privacy" className="hover:text-espresso transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-espresso transition-colors">Terms of Service</Link>
        </div>

        {/* Danger zone */}
        <div className="bg-warm-white border border-red-200 rounded-2xl p-5">
          <h2 className="font-serif text-base text-red-700 mb-4 flex items-center gap-2">
            <HiOutlineExclamationTriangle className="w-4 h-4 shrink-0" />
            Danger zone
          </h2>
          <div className="space-y-3">
            <button
              onClick={handleLogoutAll}
              className="w-full flex items-center justify-center text-sm text-red-700 border border-red-200 rounded-xl px-4 py-2.5 hover:bg-red-50 active:scale-95 transition-all duration-150 cursor-pointer select-none"
            >
              Sign out of all devices
            </button>
            {logoutAllMsg && <Alert message={logoutAllMsg} onDismiss={() => setLogoutAllMsg("")} />}

            <form onSubmit={handleDeleteAccount} className="space-y-2 pt-1 border-t border-red-100">
              <p className="text-xs text-red-700/70 pt-2">Enter your password to permanently delete your account.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <PasswordInput value={deletePw} onChange={setDeletePw} placeholder="Your password" />
                <button
                  type="submit"
                  disabled={deleteLoading || !deletePw}
                  className="shrink-0 text-sm text-red-700 border border-red-200 rounded-xl px-4 py-2.5 hover:bg-red-50 active:scale-95 transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? "Deleting…" : "Delete account"}
                </button>
              </div>
              {deleteMsg && <Alert message={deleteMsg} onDismiss={() => setDeleteMsg("")} />}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

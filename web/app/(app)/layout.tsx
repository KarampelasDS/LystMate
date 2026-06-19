"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HiOutlineClipboardDocumentList, HiClipboardDocumentList,
  HiOutlineEnvelope, HiEnvelope,
  HiOutlineCog6Tooth, HiCog6Tooth,
  HiArrowRightOnRectangle,
} from "react-icons/hi2";
import { FaceAvatar } from "@/app/components/face-avatar";
import { useAuth } from "@/app/contexts/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="font-serif text-2xl text-warm-brown italic animate-pulse">Loading…</p>
    </div>
  );
  if (!user) return null;

  const navLinks = [
    { href: "/dashboard", label: "Lists",    Icon: HiOutlineClipboardDocumentList, IconActive: HiClipboardDocumentList },
    { href: "/invites",   label: "Invites",  Icon: HiOutlineEnvelope,              IconActive: HiEnvelope              },
    { href: "/settings",  label: "Settings", Icon: HiOutlineCog6Tooth,             IconActive: HiCog6Tooth             },
  ];

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="flex flex-col">
      {/* desktop header */}
      <header className="bg-warm-white border-b border-warm-border px-5 flex items-center justify-between sticky top-0 z-10 h-14">
        <div className="flex items-center h-full gap-8">
          <Link
            href="/dashboard"
            className="font-serif text-xl text-espresso leading-none hover:text-espresso-light transition-colors select-none"
          >
            LystMate
          </Link>

          <nav className="hidden sm:flex items-center h-full gap-1">
            {navLinks.map(({ href, label, Icon, IconActive }) => {
              const active = pathname.startsWith(href);
              const Ic = active ? IconActive : Icon;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-2 px-3 h-full text-sm select-none transition-colors duration-150 ${
                    active ? "text-espresso font-medium" : "text-warm-brown hover:text-espresso"
                  }`}
                >
                  <Ic className="w-4 h-4 transition-transform duration-150 group-hover:scale-110" />
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-espresso rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* mobile right — avatar + current section label */}
        <Link href="/settings" className="sm:hidden flex items-center gap-2 active:opacity-70 transition-opacity">
          <div className="text-right">
            <p className="text-xs font-medium text-espresso leading-none">
              {navLinks.find((l) => pathname.startsWith(l.href))?.label ?? ""}
            </p>
            <p className="text-[10px] text-warm-muted mt-0.5 leading-none">{user.name}</p>
          </div>
          <FaceAvatar name={user.name} size={32} className="rounded-full overflow-hidden" />
        </Link>

        <div className="hidden sm:flex items-center gap-3">
          <Link href="/settings" className="flex items-center gap-2 group cursor-pointer">
            <span className="transition-transform duration-150 group-hover:scale-105">
              <FaceAvatar name={user.name} size={30} className="rounded-full overflow-hidden" />
            </span>
            <span className="text-xs text-warm-muted group-hover:text-espresso transition-colors duration-150">{user.name}</span>
          </Link>
          <div className="w-px h-4 bg-warm-border" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-warm-brown hover:text-espresso active:scale-95 transition-all duration-150 cursor-pointer select-none"
          >
            <HiArrowRightOnRectangle className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      {/* mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-warm-white border-t border-warm-border z-10">
        <div className="flex">
          {navLinks.map(({ href, label, Icon, IconActive }) => {
            const active = pathname.startsWith(href);
            const Ic = active ? IconActive : Icon;
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-1 pt-2 pb-3 relative select-none active:scale-95 transition-transform duration-150 ${
                  active ? "text-espresso" : "text-warm-muted hover:text-warm-brown"
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-espresso rounded-b-full" />
                )}
                <Ic className="w-6 h-6 transition-transform duration-150" />
                <span className="text-[11px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="px-3 pt-4 pb-24 sm:px-8 sm:pt-7 sm:pb-8 max-w-3xl w-full mx-auto page-enter">
        {children}
      </main>
    </div>
  );
}

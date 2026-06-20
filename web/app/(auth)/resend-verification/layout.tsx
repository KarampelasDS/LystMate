import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resend verification",
  robots: { index: false, follow: false },
};

export default function ResendVerificationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

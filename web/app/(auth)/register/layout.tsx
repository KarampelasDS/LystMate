import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Join LystMate and start creating and sharing lists with friends and family.",
  alternates: { canonical: "https://www.lystmate.app/register" },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Lora } from "next/font/google";
import { AuthProvider } from "@/app/contexts/auth-context";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: {
    default: "LystMate",
    template: "%s · LystMate",
  },
  description: "Create, share and manage lists with friends and family. LystMate makes collaborative list-keeping effortless.",
  keywords: ["shopping list", "collaborative lists", "shared lists", "grocery list", "wishlist", "list app", "to-do list", "task list"],
  authors: [{ name: "LystMate" }],
  creator: "LystMate",
  metadataBase: new URL("https://www.lystmate.app"),
  alternates: {
    canonical: "https://www.lystmate.app",
  },
  openGraph: {
    title: "LystMate",
    description: "Create, share and manage lists with friends and family.",
    url: "https://www.lystmate.app",
    siteName: "LystMate",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LystMate",
    description: "Create, share and manage lists with friends and family.",
    site: "@lystmate",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${lora.variable} h-full`} style={{ colorScheme: "light" }}>
      <body className="min-h-full bg-cream text-espresso font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

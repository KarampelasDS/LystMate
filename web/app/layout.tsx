import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Lora } from "next/font/google";
import { AuthProvider } from "@/app/contexts/auth-context";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "LystMate",
  description: "Collaborative shopping lists",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${lora.variable} h-full`}>
      <body className="min-h-full bg-cream text-espresso font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

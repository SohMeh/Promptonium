import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Providers } from "@/components/providers";

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display-custom",
});

const bodyFont = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-custom",
});

export const metadata: Metadata = {
  title: "Promptonium",
  description: "Create better prompts. Practice prompting. Learn prompt engineering.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto pb-16 md:pb-0 relative z-0 hide-scrollbar scroll-smooth">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

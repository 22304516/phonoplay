import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import UsageTracker from "./components/UsageTracker";

export const metadata: Metadata = {
  title: "PhonoPlay - Phoneme Activity Builder",
  description:
    "A phoneme-based classroom activity builder for Speech Pathology education.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <UsageTracker />
        <Navbar />

        <main className="site-main flex-1">{children}</main>

        <Footer />
      </body>
    </html>
  );
}

import "./globals.css";
import { JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/navbar";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "CyberCrypt - Cryptography Competition Platform",
  description: "Compete in live cryptography challenges on a cyberpunk platform powered by Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${mono.variable} font-mono bg-black text-white min-h-screen antialiased`}
        style={{
          backgroundColor: "#050505",
        }}
      >
        {/* Cyber Grid Background */}
        <div
          className="fixed inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            zIndex: 0,
          }}
        />

        {/* Scanlines Overlay */}
        <div
          className="fixed inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                to bottom,
                rgba(255,255,255,0.1),
                rgba(255,255,255,0.1) 1px,
                transparent 1px,
                transparent 3px
              )
            `,
            zIndex: 1,
          }}
        />

        {/* Navigation */}
        <Navbar />

        {/* Main Content */}
        <main className="relative z-10 pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#0a0a1a",
              color: "#00ffff",
              border: "1px solid rgba(0, 255, 255, 0.3)",
              borderRadius: "12px",
              boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)",
            },
            success: {
              style: {
                borderColor: "rgba(34, 197, 94, 0.3)",
              },
            },
            error: {
              style: {
                borderColor: "rgba(239, 68, 68, 0.3)",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
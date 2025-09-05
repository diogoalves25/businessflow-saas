import type { Metadata } from "next";
import "./globals.css";
import ChatbotWidget from "@/components/ChatbotWidget";
import { Providers } from "./providers-simple";
import { DebugOverlay } from "@/components/DebugOverlay";

export const metadata: Metadata = {
  title: "BusinessFlow - Modern Service Business Management",
  description: "The all-in-one platform for scheduling, managing, and growing your service business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Force render without waiting for auth
  return (
    <html lang="en">
      <body className="antialiased">
        <DebugOverlay />
        <div style={{ minHeight: '100vh' }}>
          {children}
        </div>
      </body>
    </html>
  );
}

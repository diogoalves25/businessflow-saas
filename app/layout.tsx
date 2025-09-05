import type { Metadata } from "next";
import "./globals.css";
import ChatbotWidget from "@/components/ChatbotWidget";
import { Providers } from "./providers-simple";

export const metadata: Metadata = {
  title: "BusinessFlow - Modern Service Business Management",
  description: "The all-in-one platform for scheduling, managing, and growing your service business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
          {/* Temporarily disabled - may be causing loading issues */}
          {/* <ChatbotWidget /> */}
        </Providers>
      </body>
    </html>
  );
}

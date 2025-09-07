import type { Metadata } from "next";
import "./globals.css";
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
        <script dangerouslySetInnerHTML={{ __html: `
          // Remove mystery overlay divs
          if (typeof window !== 'undefined') {
            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                  if (node.nodeType === 1 && node.tagName === 'DIV' && 
                      !node.className && !node.id && 
                      node.parentNode === document.body) {
                    console.log('Removing mystery div:', node);
                    node.remove();
                  }
                });
              });
            });
            observer.observe(document.body, { childList: true });
          }
        `}} />
        <DebugOverlay />
        <div style={{ 
          position: 'fixed', 
          bottom: '20px', 
          left: '20px', 
          background: 'yellow', 
          color: 'black', 
          padding: '20px', 
          zIndex: 99999999,
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          APP IS RENDERING!
        </div>
        <div style={{ minHeight: '100vh' }}>
          {children}
        </div>
      </body>
    </html>
  );
}

// roguelearn-web/src/app/layout.tsx
import type { Metadata } from "next";
import { Lora, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";
import { TransitionProvider } from "@/components/layout/TransitionProvider";

const fontHeading = Lora({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-heading',
});

const fontBody = Nunito_Sans({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: "RogueLearn",
  description: "Learn Programming Through Adventure",
  // This configuration ensures browsers prioritize your logo.png
  // over the default favicon.ico, fixing the issue of the Vercel logo appearing.
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    // The "dark" className here activates our new default theme.
    <html lang="en" className="dark">
      <body 
        className={cn("antialiased", fontHeading.variable, fontBody.variable)} 
        suppressHydrationWarning={true}
      >
        {/* Google Identity Services for OAuth 2.0 (Meet API) */}
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <TransitionProvider>
          {children}
        </TransitionProvider>
        {/* Global toast notifications */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
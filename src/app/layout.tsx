// roguelearn-web/src/app/layout.tsx
import type { Metadata } from "next";
import { Lora, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

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
  // Adds the new logo as the website's favicon.
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body 
        className={cn("antialiased", fontHeading.variable, fontBody.variable)} 
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
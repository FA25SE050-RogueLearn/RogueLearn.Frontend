// roguelearn-web/src/app/not-found.tsx
import Link from "next/link";
import { Skull, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0c0308] via-[#1a0b10] to-[#0c0308] px-4">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.15),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(240,177,90,0.1),transparent_60%)]" />
      
      <div className="relative z-10 text-center max-w-lg">
        {/* Icon */}
        <div className="mx-auto mb-8 relative">
          <div className="absolute inset-0 rounded-full bg-accent/20 blur-3xl animate-pulse" />
          <div className="relative flex items-center justify-center w-32 h-32 mx-auto rounded-full border-2 border-accent/50 bg-gradient-to-br from-[#1a0b10] to-[#0c0308]">
            <Skull className="w-16 h-16 text-accent drop-shadow-[0_0_20px_rgba(210,49,135,0.8)]" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-8xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-accent via-[#f5c16c] to-accent mb-4">
          404
        </h1>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-white mb-4">
          Lost in the Dungeon
        </h2>

        {/* Description */}
        <p className="text-foreground/70 mb-8 leading-relaxed">
          The path you seek has vanished into the shadows. Perhaps it was moved, 
          deleted, or never existed in this realm.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild className="h-12 rounded-full bg-accent px-8 text-sm uppercase tracking-widest text-accent-foreground hover:bg-accent/90">
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Return to Sanctum
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-full px-8 text-sm uppercase tracking-widest border-white/20 hover:bg-white/5">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 flex items-center justify-center gap-2 text-foreground/30">
          <span className="text-2xl">◈</span>
          <span className="text-xs uppercase tracking-[0.4em]">RogueLearn</span>
          <span className="text-2xl">◈</span>
        </div>
      </div>
    </div>
  );
}

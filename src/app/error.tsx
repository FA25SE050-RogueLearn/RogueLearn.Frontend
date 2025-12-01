// roguelearn-web/src/app/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0c0308] via-[#1a0b10] to-[#0c0308] px-4">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.15),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(240,177,90,0.1),transparent_60%)]" />
      
      <div className="relative z-10 text-center max-w-lg">
        {/* Icon */}
        <div className="mx-auto mb-8 relative">
          <div className="absolute inset-0 rounded-full bg-red-500/20 blur-3xl animate-pulse" />
          <div className="relative flex items-center justify-center w-32 h-32 mx-auto rounded-full border-2 border-red-500/50 bg-gradient-to-br from-[#1a0b10] to-[#0c0308]">
            <AlertTriangle className="w-16 h-16 text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-8xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-red-400 mb-4">
          500
        </h1>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-white mb-4">
          A Dark Force Struck
        </h2>

        {/* Description */}
        <p className="text-foreground/70 mb-4 leading-relaxed">
          An unexpected error has corrupted this realm. Our scholars are 
          investigating the disturbance.
        </p>

        {/* Error Details (in dev) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mb-8 p-4 rounded-2xl border border-red-500/30 bg-red-950/30 text-left">
            <p className="text-xs uppercase tracking-widest text-red-400/70 mb-2">Error Details</p>
            <p className="text-sm text-red-300 font-mono break-all">{error.message}</p>
            {error.digest && (
              <p className="text-xs text-red-400/50 mt-2">Digest: {error.digest}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            onClick={reset}
            className="h-12 rounded-full bg-red-500 px-8 text-sm uppercase tracking-widest text-white hover:bg-red-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-full px-8 text-sm uppercase tracking-widest border-white/20 hover:bg-white/5">
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Return to Sanctum
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

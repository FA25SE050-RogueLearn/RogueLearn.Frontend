// roguelearn-web/src/app/global-error.tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased bg-[#0c0308]">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0c0308] via-[#1a0b10] to-[#0c0308] px-4">
          {/* Background effects */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.15),transparent_60%)]" />
          
          <div className="relative z-10 text-center max-w-lg">
            {/* Icon */}
            <div className="mx-auto mb-8 relative">
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-3xl" style={{ animation: "pulse 2s infinite" }} />
              <div className="relative flex items-center justify-center w-32 h-32 mx-auto rounded-full border-2 border-red-500/50 bg-gradient-to-br from-[#1a0b10] to-[#0c0308]">
                <AlertTriangle className="w-16 h-16 text-red-400" style={{ filter: "drop-shadow(0 0 20px rgba(239,68,68,0.8))" }} />
              </div>
            </div>

            {/* Error Code */}
            <h1 className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-orange-400 to-red-400 mb-4">
              Error
            </h1>

            {/* Title */}
            <h2 className="text-2xl font-semibold text-white mb-4">
              Critical System Failure
            </h2>

            {/* Description */}
            <p className="text-gray-400 mb-8 leading-relaxed">
              A catastrophic error has occurred. The entire application has been affected. 
              Please try refreshing the page.
            </p>

            {/* Action */}
            <button 
              onClick={reset}
              className="inline-flex items-center justify-center h-12 rounded-full bg-red-500 px-8 text-sm uppercase tracking-widest text-white hover:bg-red-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reload Application
            </button>

            {/* Decorative elements */}
            <div className="mt-12 flex items-center justify-center gap-2 text-gray-600">
              <span className="text-2xl">◈</span>
              <span className="text-xs uppercase tracking-[0.4em]">RogueLearn</span>
              <span className="text-2xl">◈</span>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </body>
    </html>
  );
}

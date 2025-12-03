"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-[#0a0506]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2d1810]/80 via-[#1a0a08]/90 to-black" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('/images/asfalt-dark.png')",
            backgroundSize: "100px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,193,108,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(210,49,135,0.1),transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 py-16">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <Image
                src="/RougeLearn-Clear.png"
                alt="RogueLearn"
                width={56}
                height={56}
                className="rounded-xl"
              />
              <span className="text-3xl font-bold text-[#f5c16c]">RogueLearn</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-5">
              whoa there, adventurer.<br />
              <span className="text-[#f5c16c]">this area is off-limits.</span>
            </h1>
            <p className="text-base text-white/50 max-w-sm">
              looks like you wandered into the admin dungeon without the right key. only guild masters can enter here.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Access Denied Content */}
      <div className="flex flex-1 items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <Image
              src="/RougeLearn-Clear.png"
              alt="RogueLearn"
              width={48}
              height={48}
              className="rounded-xl"
            />
            <span className="text-2xl font-bold text-[#f5c16c]">RogueLearn</span>
          </div>

          <div className="text-center space-y-6">
            <div className="mx-auto h-24 w-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <ShieldX className="h-12 w-12 text-red-400" />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">Access Denied</h2>
              <p className="text-white/50">
                You don&apos;t have permission to access the admin area. 
                This section is restricted to administrators only.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>

            <Link href="/dashboard" className="block">
              <Button className="w-full h-12 bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c] shadow-lg shadow-[#f5c16c]/20 flex items-center justify-center gap-2">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-center text-sm text-white/40">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

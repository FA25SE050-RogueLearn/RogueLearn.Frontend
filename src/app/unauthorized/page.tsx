"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/40" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="RogueLearn Logo"
              width={48}
              height={48}
              className="rounded-xl"
            />
            <span className="text-2xl font-bold text-white">RogueLearn</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <ShieldX className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Access Restricted</h2>
              <p className="text-slate-400">Admin privileges required</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © {new Date().getFullYear()} RogueLearn. All rights reserved.
        </div>
      </div>

      {/* Right side - Content */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 bg-white">
        <div className="mx-auto w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="RogueLearn Logo"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <span className="text-xl font-bold text-slate-900">RogueLearn</span>
            </Link>
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldX className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Access Denied</h1>
            <p className="text-slate-600">
              You don&apos;t have permission to access the admin area. 
              This section is restricted to administrators only.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full h-12 text-base flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>

            <Link href="/dashboard" className="block">
              <Button className="w-full h-12 text-base flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          </div>

          <p className="text-center text-sm text-slate-500">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

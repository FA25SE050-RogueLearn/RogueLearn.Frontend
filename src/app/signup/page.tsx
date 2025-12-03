'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from '@/utils/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setMessage('Registration successful! Please check your email to verify your account.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const supabase = await createClient();
      const origin = window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=/`,
          scopes: [
            'https://www.googleapis.com/auth/meetings.space.created',
            'https://www.googleapis.com/auth/meetings.space.readonly',
            'https://www.googleapis.com/auth/drive.readonly',
          ].join(' '),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to initiate Google sign-in');
      setIsLoading(false);
    }
  };

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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(210,49,135,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,193,108,0.1),transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col justify-center px-8 py-16">
          <div>
            <div className="flex items-center mb-12">
              <Image
                src="/RougeLearn-Clear.png"
                alt="RogueLearn"
                width={56}
                height={56}
                className="rounded-xl"
              />
              <span className="text-3xl font-bold text-[#f5c16c] -ml-3">ogueLearn</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-5">
              Elevate Your<br />
              <span className="text-[#d23187]">Academic Journey</span>
            </h1>
            <p className="text-base text-white/50 max-w-sm">
              Join a platform that transforms your curriculum into an engaging learning experience with skill-based progression and collaborative study features.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex flex-1 items-center justify-center p-8 lg:p-16 overflow-y-auto">
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

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
            <p className="text-white/50">Register to begin your personalized learning experience</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white/70">First Name</Label>
                <Input 
                  id="firstName" 
                  placeholder="John"
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  required 
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#d23187]/50 focus:ring-[#d23187]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-white/70">Last Name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe"
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  required 
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#d23187]/50 focus:ring-[#d23187]/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white/70">Username</Label>
              <Input 
                id="username" 
                placeholder="epic_learner"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#d23187]/50 focus:ring-[#d23187]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/70">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="hero@roguelearn.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#d23187]/50 focus:ring-[#d23187]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/70">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Create a strong password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#d23187]/50 focus:ring-[#d23187]/20"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input 
                  type="checkbox" 
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required 
                  className="sr-only peer"
                />
                <div className="h-5 w-5 rounded border border-white/20 bg-white/5 peer-checked:bg-[#d23187] peer-checked:border-[#d23187] transition-colors flex items-center justify-center">
                  {acceptTerms && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                </div>
              </div>
              <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
                I accept the <Link href="#" className="text-[#d23187] hover:underline">User Agreement</Link> and <Link href="#" className="text-[#d23187] hover:underline">Privacy Policy</Link>
              </span>
            </label>

            {message && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading || !acceptTerms}
              className="w-full h-12 bg-gradient-to-r from-[#d23187] to-[#a82870] text-white font-semibold hover:from-[#a82870] hover:to-[#d23187] shadow-lg shadow-[#d23187]/20 disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0a0506] px-4 text-white/40">or continue with</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              disabled={isLoading}
              onClick={handleGoogleSignUp}
              className="w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-white/50">
            Already have an account?{" "}
            <Link href="/login" className="text-[#f5c16c] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

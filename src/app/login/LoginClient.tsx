// src/app/login/LoginClient.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookText, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from '@/utils/supabase/client';

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(searchParams.get('error'));

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      const supabase = createClient();
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
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to initiate Google sign-in');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="text-center">
          <BookText className="mx-auto h-12 w-12 text-accent" />
          <h1 className="mt-4 text-4xl font-bold font-heading">Welcome Back, Scribe</h1>
          <p className="mt-2 text-foreground/70 font-body">Enter the mystical realm of knowledge</p>
        </div>
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Unlock The Archives</CardTitle>
            <CardDescription className="text-sm text-foreground/60 font-body mt-1">
              Your journey through the realms of wisdom awaits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-body">Email Address</Label>
                <Input id="email" type="email" placeholder="scribe@roguelearn.com" className="font-body" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your mystical pass-phrase" className="font-body" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              {error && <div className="text-red-400 text-sm font-body p-3 bg-red-900/50 rounded-md flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}

              <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Unlock The Archives
              </Button>
              <Button type="button" variant="outline" size="lg" className="w-full mt-2" onClick={handleGoogleSignIn}>
                Continue with Google
              </Button>
              <div className="mt-4 text-center text-sm">
                New to the Order?{" "}
                <Link href="/signup" className="underline text-accent">
                  Join the Scribes
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
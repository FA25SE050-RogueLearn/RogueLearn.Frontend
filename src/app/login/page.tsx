// roguelearn-web/src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookText, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from '@/utils/supabase/client';

// Renders the themed login page.
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

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
      router.push('/'); // Redirect to dashboard on successful login
      router.refresh(); // Ensure the layout re-renders to get the new session
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
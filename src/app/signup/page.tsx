// roguelearn-web/src/app/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookText, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Renders the themed signup page for new users.
export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // We pass user metadata here, which the database trigger will use
        // to populate the public.user_profiles table.
        data: {
          username,
          first_name: firstName,
          last_name: lastName,
        },
        // ADD THIS LINE to specify the confirmation redirect URL
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Registration successful! Please check your email to verify your account.');
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError(null);
      const supabase = createClient();
      const origin = window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=/`,
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
          <h1 className="mt-4 text-4xl font-bold font-heading">Begin Your Journey</h1>
          <p className="mt-2 text-foreground/70 font-body">Create your Scribe account to enter the realms of knowledge.</p>
        </div>
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Enroll in the Order</CardTitle>
            <CardDescription className="text-sm text-foreground/60 font-body mt-1">Your adventure is about to begin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {/* Simple placeholder for legal acceptance */}
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="terms" required />
                <Label htmlFor="terms" className="text-sm font-body text-foreground/70">
                  I accept the User Agreement and Privacy Policy.
                </Label>
              </div>

              {message && <div className="text-green-400 text-sm font-body p-3 bg-green-900/50 rounded-md">{message}</div>}
              {error && <div className="text-red-400 text-sm font-body p-3 bg-red-900/50 rounded-md flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}

              <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Begin Journey
              </Button>
              <Button type="button" variant="outline" size="lg" className="w-full mt-2" onClick={handleGoogleSignUp}>
                Continue with Google
              </Button>
            </form>
            <div className="mt-6 text-center text-sm font-body text-foreground/70">
              <p>Already a Scribe?</p>
              <Button asChild variant="link" className="text-accent">
                <Link href="/login">Unlock The Archives</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
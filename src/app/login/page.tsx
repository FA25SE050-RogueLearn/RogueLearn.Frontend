// roguelearn-web/src/app/login/page.tsx
import { Suspense } from 'react';
import LoginClient from './LoginClient';

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
  const [error, setError] = useState<string | null>(
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('error') : null
  );

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
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-8"><div className="text-center">Loading...</div></div>}>
      <LoginClient />
    </Suspense>
  );
}
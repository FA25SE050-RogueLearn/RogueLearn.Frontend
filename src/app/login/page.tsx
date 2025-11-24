// roguelearn-web/src/app/login/page.tsx
import { Suspense } from 'react';
import LoginClient from './LoginClient';

// Server component wrapper that renders the client-side login UI
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-8"><div className="text-center">Loading...</div></div>}>
      <LoginClient />
    </Suspense>
  );
}
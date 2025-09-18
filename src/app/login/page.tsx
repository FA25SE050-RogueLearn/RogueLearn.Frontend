// roguelearn-web/src/app/login/page.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookText } from "lucide-react";

// Renders the themed login page.
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="text-center">
          <BookText className="mx-auto h-12 w-12 text-accent" />
          <h1 className="mt-4 text-4xl font-bold font-heading">Welcome Back, Scribe</h1>
          <p className="mt-2 text-foreground/70 font-body">Enter the mystical realm of knowledge</p>
        </div>
        <div className="rounded-lg bg-card p-8 shadow-lg border border-border">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold font-heading">Unlock The Archives</h2>
              <p className="text-sm text-foreground/60 font-body mt-1">Your journey through the realms of wisdom awaits</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="font-body">Email Address</Label>
                <Input id="email" type="email" placeholder="scribe@roguelearn.com" className="mt-1 font-body" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your mystical pass-phrase" className="mt-1 font-body" />
              </div>
            </div>
            <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              Unlock The Archives
            </Button>
          </div>
          <div className="mt-6 text-center text-sm font-body text-foreground/70">
            <p>New to the Order?</p>
            <Button variant="link" className="text-accent">Join the Scribes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
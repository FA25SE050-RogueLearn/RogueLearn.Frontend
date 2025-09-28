// roguelearn-web/src/app/login/page.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookText } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle className="font-heading text-2xl">Unlock The Archives</CardTitle>
                <CardDescription className="text-sm text-foreground/60 font-body mt-1">
                    Your journey through the realms of wisdom awaits
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="font-body">Email Address</Label>
                    <Input id="email" type="email" placeholder="scribe@roguelearn.com" className="font-body" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Enter your mystical pass-phrase" className="font-body" />
                </div>
                <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Unlock The Archives
                </Button>
                <div className="mt-4 text-center text-sm">
                    New to the Order?{" "}
                    <Link href="/signup" className="underline text-accent">
                        Join the Scribes
                    </Link>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
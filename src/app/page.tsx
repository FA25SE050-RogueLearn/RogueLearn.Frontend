import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import HeroSection from "@/components/hero-section";

// This is now the root landing page for the application.
export default async function LandingPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // If the user is already logged in, redirect them directly to their dashboard.
  if (user) {
    redirect('/character');
  }

  // If no user is logged in, show the public hero section.
  return <HeroSection />;
}

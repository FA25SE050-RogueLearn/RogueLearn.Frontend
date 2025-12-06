import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      redirect('/login');
    }
  } catch {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <DashboardClient />
    </DashboardLayout>
  );
}

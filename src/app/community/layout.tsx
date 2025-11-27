import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

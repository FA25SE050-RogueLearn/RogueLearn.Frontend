import PracticePage from '@/components/practice/PracticePage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default async function Practice() {
  return (
    <DashboardLayout>
      <PracticePage />
    </DashboardLayout>
  );
}

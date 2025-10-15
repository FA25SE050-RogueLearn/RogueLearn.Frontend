import CodeBattlePage from '@/components/code-battle/CodeBattlePage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default async function CodeBattle() {
  return (
    <DashboardLayout>
      <CodeBattlePage />
    </DashboardLayout>
  );
}

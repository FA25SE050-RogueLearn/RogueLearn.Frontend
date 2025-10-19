import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CharacterCreationWizard } from "@/components/character/CharacterCreationWizard";

export default function CharacterCreationPage() {
  return (
    <DashboardLayout>
      <div className="pb-20">
        <CharacterCreationWizard />
      </div>
    </DashboardLayout>
  );
}

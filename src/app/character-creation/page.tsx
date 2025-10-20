// roguelearn-web/src/app/character-creation/page.tsx
import { CharacterCreationWizard } from "@/components/features/character-creation/CharacterCreationWizard";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

/**
 * The main page for the character creation/onboarding process.
 * It ensures the user is authenticated before rendering the wizard.
 */
export default async function CharacterCreationPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
            <div className="w-full max-w-4xl">
                <CharacterCreationWizard />
            </div>
        </div>
    );
}
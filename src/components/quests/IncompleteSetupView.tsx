"use client";

import { useState } from "react";
import { Compass, UserCog, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CharacterCreationWizard } from "@/components/features/character-creation/CharacterCreationWizard";
import { usePageTransition } from "@/components/layout/PageTransition";

interface IncompleteSetupViewProps {
  pathName?: string;
  pathDescription?: string;
}

export function IncompleteSetupView({ pathName, pathDescription }: IncompleteSetupViewProps) {
  const { navigateTo } = usePageTransition();
  const [showCharacterWizard, setShowCharacterWizard] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleOnboardingComplete = () => {
    setShowCharacterWizard(false);
    // Force a hard refresh to re-fetch the learning path from server
    window.location.reload();
  };

  if (dismissed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-[#f5c16c]/20 blur-3xl rounded-full" />
          <div className="relative p-6 rounded-full bg-gradient-to-br from-[#2d1810] to-[#1a0a08] border border-[#f5c16c]/30">
            <MapPin className="w-16 h-16 text-[#f5c16c]/50" />
          </div>
        </div>
        
        <div className="text-center space-y-3 max-w-lg">
          <h2 className="text-2xl font-bold text-white">No Questline Available</h2>
          <p className="text-white/60">
            Your learning path hasn&apos;t been forged yet because your academic profile is incomplete. 
            Set up your program and class to unlock personalized quests tailored to your curriculum.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
            onClick={() => setShowCharacterWizard(true)}
            className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:shadow-lg hover:shadow-[#f5c16c]/30"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Complete Setup Now
          </Button>
          <Button
            variant="outline"
            onClick={() => navigateTo('/profile')}
            className="border-white/20 text-white/70 hover:text-white hover:bg-white/5"
          >
            <UserCog className="w-4 h-4 mr-2" />
            Go to Profile
          </Button>
        </div>

        {/* Character Creation Dialog */}
        <Dialog open={showCharacterWizard} onOpenChange={setShowCharacterWizard}>
          <DialogContent 
            className="max-w-[1100px] w-[95vw] h-[85vh] overflow-hidden rounded-[40px] border border-white/12 bg-gradient-to-br from-[#12060a] via-[#1d0a11] to-[#060205] p-0 shadow-[0_32px_140px_rgba(20,2,16,0.85)] backdrop-blur-2xl"
          >
            <DialogHeader>
              <DialogTitle className="sr-only">Character Creation</DialogTitle>
            </DialogHeader>
            <div className="h-full overflow-hidden bg-gradient-to-br from-[#1d0a10] via-[#240d14] to-[#090307]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.32),transparent_70%)] opacity-45" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(240,177,90,0.26),transparent_72%)] opacity-50" />
              <div className="relative z-10 h-full">
                <CharacterCreationWizard onOnboardingComplete={handleOnboardingComplete} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      {/* Hero Icon */}
      <div className="relative">
        <div className="absolute inset-0 bg-[#f5c16c]/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative p-6 rounded-full bg-gradient-to-br from-[#2d1810] to-[#1a0a08] border border-[#f5c16c]/30 shadow-lg">
          <Compass className="w-16 h-16 text-[#f5c16c]" />
        </div>
      </div>

      {/* Message */}
      <div className="text-center space-y-3 max-w-lg">
        <h2 className="text-2xl font-bold text-white">
          {pathName === "Unassigned Path" ? "Complete Your Setup" : "Almost There!"}
        </h2>
        <p className="text-white/60">
          {pathDescription || "Your academic program or class hasn't been selected yet. Complete your profile setup to unlock your personalized learning journey with quests tailored to your curriculum."}
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-[#1a1410]/80 border border-[#f5c16c]/20 rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-sm font-semibold text-[#f5c16c] uppercase tracking-wider mb-3">What you&apos;ll get:</h3>
        <ul className="space-y-2 text-sm text-white/70">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5c16c]" />
            Personalized quests based on your curriculum
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5c16c]" />
            Skill tracking aligned to your program
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5c16c]" />
            Progress synced with your academic journey
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Button
          onClick={() => setShowCharacterWizard(true)}
          size="lg"
          className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:shadow-lg hover:shadow-[#f5c16c]/30 px-8"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Complete Setup
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setDismissed(true)}
          className="border-white/20 text-white/50 hover:text-white/70 hover:bg-white/5"
        >
          Maybe Later
        </Button>
      </div>

      {/* Character Creation Dialog */}
      <Dialog open={showCharacterWizard} onOpenChange={setShowCharacterWizard}>
        <DialogContent 
          className="max-w-[1100px] w-[95vw] h-[85vh] overflow-hidden rounded-[40px] border border-white/12 bg-gradient-to-br from-[#12060a] via-[#1d0a11] to-[#060205] p-0 shadow-[0_32px_140px_rgba(20,2,16,0.85)] backdrop-blur-2xl"
        >
          <DialogHeader>
            <DialogTitle className="sr-only">Character Creation</DialogTitle>
          </DialogHeader>
          <div className="h-full overflow-hidden bg-gradient-to-br from-[#1d0a10] via-[#240d14] to-[#090307]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.32),transparent_70%)] opacity-45" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(240,177,90,0.26),transparent_72%)] opacity-50" />
            <div className="relative z-10 h-full">
              <CharacterCreationWizard onOnboardingComplete={handleOnboardingComplete} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { specializations, routes, classes } from "@/lib/mock-data/creation";

interface Step4Props {
  selectedRoute: string | null;
  selectedClass: string | null;
  selectedSpecialization: string | null;
  setStep: (step: number) => void;
}

export function Step4_Confirmation({ selectedRoute, selectedClass, selectedSpecialization, setStep }: Step4Props) {
  const router = useRouter();

  const handleComplete = () => {
    // Here you would save to your backend
    console.log({
      route: selectedRoute,
      class: selectedClass,
      specialization: selectedSpecialization,
    });
    router.push('/character');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-accent/20 p-6 border-accent">
        <p className="text-center text-lg font-heading">
          🎉 Your Character is Ready!
        </p>
      </Card>

      <Card className="bg-background/50 p-6">
        <h4 className="font-heading text-center mb-4">[Avatar Preview]</h4>
        <div className="text-center space-y-2">
          <p className="font-heading text-xl">Alex Chen</p>
          <p className="text-sm text-foreground/70">Level 1 Full-Stack Developer</p>
          <p className="text-sm text-foreground/70">Software Engineering Student</p>
        </div>
      </Card>

      <Card className="bg-background/50 p-6">
        <h4 className="font-heading mb-4">Character Summary</h4>
        <div className="space-y-3 text-sm font-body">
          <div className="flex items-start gap-2">
            <span>🎓</span>
            <span>Academic Route: {routes.find(r => r.id === selectedRoute)?.title}</span>
          </div>
          <div className="flex items-start gap-2">
            <span>💼</span>
            <span>Career Class: {classes.find(c => c.id === selectedClass)?.title}</span>
          </div>
          <div className="flex items-start gap-2">
            <span>🎯</span>
            <span>Learning Path: 4-year Integrated Program</span>
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="font-heading text-sm mb-2">🔓 STARTING MODULES UNLOCKED</p>
            <ul className="list-disc list-inside space-y-1 text-foreground/70">
              <li>Programming Fundamentals (Java)</li>
              <li>Web Development Basics (HTML/CSS)</li>
              <li>Version Control with Git</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="font-heading text-sm mb-2">🏆 INITIAL ACHIEVEMENTS</p>
            <ul className="list-disc list-inside space-y-1 text-foreground/70">
              <li>Character Created</li>
              <li>Learning Path Established</li>
              <li>Ready for Adventure</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex gap-4 pt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setStep(1)}
        >
          [← Customize]<br />
          <span className="text-xs">More changes</span>
        </Button>
        <Button
          className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={handleComplete}
        >
          [Begin Journey]<br />
          <span className="text-xs">Start Journey</span>
        </Button>
      </div>

      <p className="text-center text-xs text-foreground/60 font-body pt-4">
        💡 You can always adjust your path in Settings
      </p>
    </div>
  );
}
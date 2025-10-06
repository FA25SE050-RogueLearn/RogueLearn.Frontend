'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { classes } from "@/lib/mock-data/creation";

interface Step2Props {
  selectedClass: string | null;
  setSelectedClass: (id: string) => void;
}

export function Step2_ClassSelection({ selectedClass, setSelectedClass }: Step2Props) {
  return (
    <div className="space-y-6">
      <Card className="bg-background/50 p-6">
        <h3 className="text-xl font-heading mb-2">
          Choose your career Class
        </h3>
        <p className="text-sm text-foreground/70 font-body">
          (roadmap.sh role-based roadmap)
        </p>
      </Card>

      <div className="space-y-4">
        {classes.map((cls) => (
          <Card
            key={cls.id}
            className={`cursor-pointer transition-all ${
              selectedClass === cls.id
                ? 'border-accent border-2 bg-accent/10'
                : 'border-border hover:border-accent/50'
            }`}
            onClick={() => setSelectedClass(cls.id)}
          >
            <CardContent className="p-6">
              <h4 className="text-lg font-heading mb-1">{cls.title}</h4>
              <p className="text-sm text-foreground/70 font-body mb-2">
                {cls.focus}
              </p>
              <p className="text-xs text-foreground/60 font-body">
                Skills: {cls.skills}
              </p>
              <div className="flex justify-between items-center mt-4">
                <Button variant="ghost" size="sm">
                  [Description]
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-accent"
                >
                  [Select] <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
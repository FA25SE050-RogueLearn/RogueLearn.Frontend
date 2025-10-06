'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { specializations, routes, classes } from "@/lib/mock-data/creation";

interface Step3Props {
  selectedSpecialization: string | null;
  setSelectedSpecialization: (id: string) => void;
  selectedRoute: string | null;
  selectedClass: string | null;
}

export function Step3_SpecializationSelection({ selectedSpecialization, setSelectedSpecialization, selectedRoute, selectedClass }: Step3Props) {
  return (
    <div className="space-y-6">
      <Card className="bg-background/50 p-6">
        <h3 className="text-xl font-heading mb-2">
          Choose your FPTU Specialization (Semester 5+)
        </h3>
        <p className="text-sm text-foreground/70 font-body">
          Route: {routes.find(r => r.id === selectedRoute)?.title}
        </p>
        <p className="text-sm text-foreground/70 font-body">
          Class: {classes.find(c => c.id === selectedClass)?.title}
        </p>
      </Card>

      <p className="font-heading text-sm">FPTU Specialization Tracks</p>

      <div className="space-y-4">
        {specializations.map((spec) => (
          <Card
            key={spec.id}
            className={`cursor-pointer transition-all ${
              selectedSpecialization === spec.id
                ? 'border-accent border-2 bg-accent/10'
                : 'border-border hover:border-accent/50'
            }`}
            onClick={() => setSelectedSpecialization(spec.id)}
          >
            <CardContent className="p-6">
              <h4 className="text-lg font-heading mb-1">{spec.title}</h4>
              <p className="text-sm text-foreground/70 font-body mb-2">
                {spec.description}
              </p>
              <p className="text-xs text-foreground/60 font-body">
                Roadmap: {spec.roadmap}
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
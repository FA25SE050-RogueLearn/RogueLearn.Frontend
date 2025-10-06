'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { routes } from "@/lib/mock-data/creation";

interface Step1Props {
  selectedRoute: string | null;
  setSelectedRoute: (id: string) => void;
}

export function Step1_RouteSelection({ selectedRoute, setSelectedRoute }: Step1Props) {
  return (
    <div className="space-y-6">
      <Card className="bg-background/50 p-6">
        <h3 className="text-xl font-heading mb-2">
          Choose your academic Route
        </h3>
        <p className="text-sm text-foreground/70 font-body">
          (University Curriculum)
        </p>
      </Card>

      <div className="space-y-4">
        {routes.map((route) => (
          <Card
            key={route.id}
            className={`cursor-pointer transition-all ${
              selectedRoute === route.id
                ? 'border-accent border-2 bg-accent/10'
                : 'border-border hover:border-accent/50'
            }`}
            onClick={() => setSelectedRoute(route.id)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-lg font-heading mb-1">{route.title}</h4>
                  <p className="text-sm text-foreground/70 font-body mb-2">
                    {route.focus}
                  </p>
                  <p className="text-xs text-foreground/60 font-body">
                    Core: {route.core}
                  </p>
                </div>
              </div>
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
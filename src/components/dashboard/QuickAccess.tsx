import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Swords, Package, Users } from "lucide-react";

// This new component renders the "Quick Access" section from the wireframe.
export function QuickAccess() {
  const quickAccessButtons = [
    { label: "Learn", icon: BookOpen, href: "/quests" },
    { label: "Skills", icon: Swords, href: "/skills" },
    { label: "Arsenal", icon: Package, href: "/arsenal" },
    { label: "Party", icon: Users, href: "/community" }
  ];

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="font-heading">Quick Access</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickAccessButtons.map((btn) => (
            <Button
              key={btn.label}
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent/10"
              asChild
            >
              <Link href={btn.href}>
                <btn.icon className="w-8 h-8" />
                <span className="font-body">{btn.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
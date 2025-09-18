// roguelearn-web/src/app/arsenal/page.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { mockArsenal } from "@/lib/mockData";

// Renders The Arsenal page, displaying the user's notes as cards.
export default function ArsenalPage() {
  return (
    <DashboardLayout>
      <main className="col-span-12 lg:col-span-10 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold font-heading">The Arsenal</h1>
            <p className="mt-2 text-foreground/70 font-body">Your personal collection of transcribed knowledge and ancient scrolls.</p>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Note
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockArsenal.map((note) => (
            <Card key={note.id} className="bg-card/50 flex flex-col">
              <CardHeader>
                <CardTitle className="font-heading">{note.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="font-body text-foreground/80">{note.description}</p>
              </CardContent>
              <CardFooter className="flex gap-2">
                {note.tags.map(tag => (
                   <span key={tag} className="text-xs font-semibold bg-primary/20 text-accent px-2 py-1 rounded-full">{tag}</span>
                ))}
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </DashboardLayout>
  );
}
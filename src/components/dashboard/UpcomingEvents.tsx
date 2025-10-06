import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockQuests } from "@/lib/mock-data";

// Renders the card for upcoming events on the right side of the dashboard.
export function UpcomingEvents() {
  return (
    <Card className="bg-card/50 p-6 h-full">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="font-heading text-2xl">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        {mockQuests.upcomingEvents.map((event) => (
          <div key={event.id} className="p-4 rounded-lg bg-secondary">
            <h4 className="font-semibold font-heading text-md">{event.title}</h4>
            <p className="text-sm text-foreground/70 font-body">{event.dueDate}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

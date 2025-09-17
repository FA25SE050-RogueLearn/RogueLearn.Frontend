// roguelearn-web/src/components/dashboard/UpcomingEvents.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for upcoming events.
const events = [
  {
    title: 'Exam: Data Structures',
    dueDate: 'in 3 days',
  },
  {
    title: 'Assignment: Algorithm Analysis',
    dueDate: 'due in 5 days',
  },
];

// Renders the card for upcoming events on the right side of the dashboard.
export function UpcomingEvents() {
  return (
    <Card className="bg-card/50 p-6 h-full">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="font-heading text-2xl">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        {events.map((event) => (
          <div key={event.title} className="p-4 rounded-lg bg-secondary">
            <h4 className="font-semibold font-heading text-md">{event.title}</h4>
            <p className="text-sm text-foreground/70 font-body">{event.dueDate}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
// roguelearn-web/src/components/dashboard/UpcomingEvents.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockQuests } from "@/lib/mockData";

// Renders the card for upcoming events on the right side of the dashboard.
export function UpcomingEvents() {
  return (
    <Card className="relative h-full overflow-hidden rounded-[24px] border border-[#f5c16c]/22 bg-[#28130d]/88 p-6 text-[#f5c16c] shadow-[0_20px_60px_rgba(38,12,6,0.6)]">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1545239351-ef35f43d514b?auto=format&fit=crop&w=1000&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#30150f]/95 via-[#1c0c08]/88 to-[#0d0504]/92" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.28),_transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(210,49,135,0.24),_transparent_65%)]" />
      </div>

      <div className="relative z-10">
        <CardHeader className="mb-6 border-b border-[#f5c16c]/35 pb-4">
          <CardTitle className="text-lg uppercase tracking-[0.35em] text-[#f5c16c]">
            Forthcoming Omens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockQuests.upcomingEvents.map((event, index) => (
            <div
              key={event.id}
              className="relative overflow-hidden rounded-2xl border border-[#f5c16c]/30 bg-[#d23187]/12 p-4 text-white"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#f5c16c] via-[#d23187] to-transparent" />
              <div className="ml-4">
                <p className="text-[11px] uppercase tracking-[0.4em] text-[#f5c16c]/80">
                  Event {index + 1}
                </p>
                <h4 className="mt-2 text-base font-semibold text-white">{event.title}</h4>
                <p className="mt-1 text-sm text-[#f5c16c]/75">{event.dueDate}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </div>
    </Card>
  );
}
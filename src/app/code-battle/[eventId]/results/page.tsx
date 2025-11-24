import { use } from "react";
import EventResultsContent from '@/components/code-battle/EventResultsContent';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default function EventResultsPage({ params }: PageProps) {
  const { eventId } = use(params);

  return (
    <DashboardLayout>
      <EventResultsContent eventId={eventId} />
    </DashboardLayout>
  );
}

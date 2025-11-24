import { use } from "react";
import EventDetailsContent from '@/components/code-battle/EventDetailsContent';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default function EventDetailsPage({ params }: PageProps) {
  const { eventId } = use(params);

  return (
    <DashboardLayout>
      <EventDetailsContent eventId={eventId} />
    </DashboardLayout>
  );
}

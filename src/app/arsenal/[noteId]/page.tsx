import { DashboardLayout } from "@/components/layout/DashboardLayout";
import NoteEditorClient from "./NoteEditorClient";

interface PageProps {
  params: Promise<{ noteId: string }>;
}

export default async function NoteEditorPage({ params }: PageProps) {
  const { noteId } = await params;

  return (
    <DashboardLayout>
      <NoteEditorClient noteId={noteId} />
    </DashboardLayout>
  );
}

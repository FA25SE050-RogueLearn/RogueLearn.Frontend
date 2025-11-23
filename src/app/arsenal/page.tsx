import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BookOpen } from "lucide-react";
import NotesTab from "@/components/arsenal/NotesTab";

export default function ArsenalPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 pb-24">
        <section className="relative overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-linear-to-br from-[#2d1810]/60 via-[#1a0a08]/80 to-black/90 p-8 shadow-2xl">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
              backgroundSize: "100px",
              backgroundBlendMode: "overlay",
            }}
          />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-[#f5c16c]/10 p-4">
                <BookOpen className="h-8 w-8 text-[#f5c16c]" />
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.35em] text-[#f5c16c]/60">Knowledge is your power</p>
                <h1 className="text-3xl font-semibold text-[#f5c16c]">The Arsenal</h1>
                <p className="max-w-2xl text-sm leading-relaxed text-white/70">
                  Capture rich notes, organize with tags, and leverage AI for suggestions and in-editor actions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <NotesTab />
      </div>
    </DashboardLayout>
  );
}

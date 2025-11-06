import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import NotesTab from "@/components/arsenal/NotesTab";
import TagsTab from "@/components/arsenal/TagsTab";

export default function ArsenalPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 pb-24">
        <section className="relative overflow-hidden rounded-[24px] border border-white/12 bg-gradient-to-br from-[#321810]/88 via-[#200c12]/92 to-[#0d0509]/96 p-6 shadow-[0_28px_80px_rgba(26,6,10,0.35)]">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.28),_transparent_68%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(240,177,90,0.18),_transparent_70%)]" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-foreground/60">Knowledge is your power</p>
              <h1 className="text-3xl font-semibold text-white">The Arsenal</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-foreground/70">
                Capture rich notes, organize with tags, and leverage AI for suggestions and in-editor actions.
              </p>
            </div>
          </div>
        </section>

        <Tabs defaultValue="notes" className="relative z-10">
          <TabsList className="grid w-full max-w-[340px] grid-cols-2">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>
          <TabsContent value="notes">
            <NotesTab />
          </TabsContent>
          <TabsContent value="tags">
            <TagsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

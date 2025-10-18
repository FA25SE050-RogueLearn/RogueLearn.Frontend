// roguelearn-web/src/components/dashboard/CharacterStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Updated type to make stats optional
type UserProfile = {
  stats?: {
    class?: string;
    curriculum?: string;
    intellect?: number;
    wisdom?: number;
  }
} | null;

export function CharacterStats({ userProfile }: { userProfile: UserProfile }) {
  if (!userProfile) {
    return (
      <Card className="col-span-1 bg-black/30 p-6 backdrop-blur">
        <CardHeader className="mb-6 border-b border-white/10 pb-4">
          <CardTitle className="h-6 w-48 animate-pulse rounded bg-white/10" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-5 w-full animate-pulse rounded bg-white/10" />
          <div className="h-5 w-full animate-pulse rounded bg-white/10" />
          <div className="h-5 w-full animate-pulse rounded bg-white/10" />
        </CardContent>
      </Card>
    );
  }

  const stats = {
    class: userProfile.stats?.class || "Novice Delver",
    curriculum: userProfile.stats?.curriculum || "Uncharted Path",
    intellect: userProfile.stats?.intellect || 10,
    wisdom: userProfile.stats?.wisdom || 10,
  };

  return (
    <Card className="relative col-span-1 overflow-hidden rounded-[24px] border border-[#f5c16c]/18 bg-[#1d0d0b]/80 p-6 shadow-[0_18px_55px_rgba(32,10,6,0.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.28),_transparent_70%)]" />
      <div className="relative z-10">
        <CardHeader className="mb-6 border-b border-[#f5c16c]/25 pb-4">
          <CardTitle className="text-lg uppercase tracking-[0.35em] text-[#f5c16c]/80">Character Codex</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 text-sm uppercase tracking-[0.3em] text-[#f5c16c]/60">
          <div className="flex items-center justify-between">
            <span>Class</span>
            <span className="text-white">{stats.class}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Curriculum</span>
            <span className="text-white">{stats.curriculum}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="rounded-2xl border border-[#f5c16c]/30 bg-[#f5c16c]/10 p-4 text-[#2b130f]">
              <p className="text-[11px] tracking-[0.45em] text-[#2b130f]/80">Intellect</p>
              <p className="mt-3 text-3xl font-semibold">{stats.intellect}</p>
              <p className="text-[10px] uppercase tracking-[0.45em] text-[#2b130f]/70">Rune mastery</p>
            </div>
            <div className="rounded-2xl border border-[#d23187]/40 bg-[#d23187]/15 p-4 text-white">
              <p className="text-[11px] tracking-[0.45em] text-[#f9d9eb]">Wisdom</p>
              <p className="mt-3 text-3xl font-semibold">{stats.wisdom}</p>
              <p className="text-[10px] uppercase tracking-[0.45em] text-[#f9d9eb]/80">Lore recall</p>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
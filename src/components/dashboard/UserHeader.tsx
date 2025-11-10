
// Define a type for the user profile data to ensure type safety.
// NOTE: This should eventually be moved to a shared types library.
type UserProfile = {
  username: string;
  level: number;
  title: string;
  experience_points: number;
  xpMax?: number; // Assuming xpMax comes from a calculation or another field
} | null;


// The component now accepts userProfile as a prop.
export function UserHeader({ userProfile }: { userProfile: UserProfile }) {
  if (!userProfile) {
    return (
      <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 animate-pulse">
        <div className="h-16 w-16 rounded-full bg-white/10" />
        <div className="grow space-y-2">
          <div className="h-6 w-1/2 rounded bg-white/10" />
          <div className="h-4 w-1/4 rounded bg-white/10" />
        </div>
      </div>
    );
  }

  const xpPercentage = (userProfile.experience_points / (userProfile.xpMax || 1000)) * 100;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-[#1f0e0b]/80 p-6 shadow-[0_18px_65px_rgba(36,12,6,0.55)]">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-55"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee?auto=format&fit=crop&w=1400&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#2d140f]/92 via-[#180a07]/92 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_20%_30%,rgba(245,193,108,0.4),transparent)]" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[#f5c16c]/55 bg-[#140806]/80">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80')] bg-cover bg-center" />
            <div className="absolute inset-0 rounded-full border border-white/20" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#f5c16c]/70">Welcome back</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{userProfile.username}</h2>
            <p className="text-sm uppercase tracking-[0.35em] text-[#d23187]">
              Level {userProfile.level} {userProfile.title}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
          <div className="rounded-2xl border border-[#f5c16c]/20 bg-[#130806]/85 px-5 py-4 text-sm text-[#f5c16c]/80">
            <p className="text-[11px] uppercase tracking-[0.45em] text-[#f5c16c]/70">Current Buff</p>
            <p className="mt-2 text-base font-semibold text-white">Arcane Focus</p>
            <p className="text-xs text-foreground/70">+10% XP from dungeon clears</p>
          </div>
          <div className="w-full max-w-[320px]">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-[#f5c16c]/70">
              <span className="text-white/70">Experience</span>
              <span className="text-[#f5c16c]">{userProfile.experience_points} / {userProfile.xpMax || 1000} XP</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-[#2d140f]/70">
              <div
                className="h-full rounded-full bg-linear-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] shadow-[0_0_16px_rgba(245,193,108,0.55)]"
                style={{ width: `${Math.min(100, xpPercentage)}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-[#f5c16c]/50">
              <span>0</span>
              <span>Ascension</span>
              <span>{userProfile.xpMax || 1000}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

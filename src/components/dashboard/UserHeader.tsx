// roguelearn-web/src/components/dashboard/UserHeader.tsx
import { mockUser } from "@/lib/mockData";

// Renders the header section of the dashboard with user info and XP bar.
export function UserHeader() {
  const xpPercentage = (mockUser.xp / mockUser.xpMax) * 100;

  return (
    <div className="flex items-center gap-4 p-4 bg-card/50 rounded-lg">
      <div className="w-16 h-16 bg-secondary rounded-full border-2 border-accent flex-shrink-0"></div>
      <div className="flex-grow">
        <h2 className="text-2xl font-bold font-heading">Welcome back, {mockUser.username}</h2>
        <p className="text-sm font-body text-foreground/70">Level {mockUser.level} {mockUser.title}</p>
      </div>
      <div className="w-1/3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-body">Experience Progress</span>
          <span className="text-sm font-semibold font-body text-accent">{mockUser.xp} / {mockUser.xpMax} XP</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2.5">
          <div 
            className="bg-accent h-2.5 rounded-full" 
            style={{ width: `${xpPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
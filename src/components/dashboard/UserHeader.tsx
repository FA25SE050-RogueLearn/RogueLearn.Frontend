// roguelearn-web/src/components/dashboard/UserHeader.tsx
// Renders the header section of the dashboard with user info and XP bar.
export function UserHeader() {
  const xpPercentage = (750 / 1000) * 100;

  return (
    <div className="flex items-center gap-4 p-4 bg-card/50 rounded-lg">
      {/* 
        The <Image> component was replaced with a styled <div> to act as a placeholder.
        This resolves the build error caused by the missing '/user-avatar.png' image file,
        which the Next.js build process requires for optimization.
      */}
      <div className="w-16 h-16 bg-secondary rounded-full border-2 border-accent flex-shrink-0"></div>
      <div className="flex-grow">
        <h2 className="text-2xl font-bold font-heading">Welcome back, Aetherius</h2>
        <p className="text-sm font-body text-foreground/70">Level 5 Scribe</p>
      </div>
      <div className="w-1/3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-body">Experience Progress</span>
          <span className="text-sm font-semibold font-body text-accent">750 / 1000 XP</span>
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
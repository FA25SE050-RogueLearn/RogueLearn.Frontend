
// Define a type for the user profile data to ensure type safety.
// NOTE: This should eventually be moved to a shared types library.
type UserProfile = {
  username: string;
  level: number;
  title: string;
  experience_points: number;
  xpMax: number; // Assuming xpMax comes from a calculation or another field
} | null;


// The component now accepts userProfile as a prop.
export function UserHeader({ userProfile }: { userProfile: UserProfile }) {
  // If the profile is not loaded, show a loading state or nothing.
  if (!userProfile) {
    return (
      // Simple loading state
      <div className="flex items-center gap-4 p-4 bg-card/50 rounded-lg animate-pulse">
        <div className="w-16 h-16 bg-secondary rounded-full"></div>
        <div className="flex-grow space-y-2">
          <div className="h-6 bg-secondary rounded w-1/2"></div>
          <div className="h-4 bg-secondary rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  // Calculate the XP percentage from the dynamic user data.
  const xpPercentage = (userProfile.experience_points / (userProfile.xpMax || 1000)) * 100;

  return (
    <div className="flex items-center gap-4 p-4 bg-card/50 rounded-lg">
      <div className="w-16 h-16 bg-secondary rounded-full border-2 border-accent flex-shrink-0"></div>
      <div className="flex-grow">
        {/* Display the real username from props */}
        <h2 className="text-2xl font-bold font-heading">Welcome back, {userProfile.username}</h2>
        {/* Display the real level and title from props */}
        <p className="text-sm font-body text-foreground/70">Level {userProfile.level} {userProfile.title}</p>
      </div>
      <div className="w-1/3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-body">Experience Progress</span>
          {/* Display real XP values from props */}
          <span className="text-sm font-semibold font-body text-accent">{userProfile.experience_points} / {userProfile.xpMax || 1000} XP</span>
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

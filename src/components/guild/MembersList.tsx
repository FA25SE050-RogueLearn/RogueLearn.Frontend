// roguelearn-web/src/components/guild/MembersList.tsx
import { Member } from "@/lib/mockData";

// The local 'Member' interface has been removed and is now imported from a central location.
interface MembersListProps {
  members: Member[];
}

const statusColors = {
  online: 'bg-green-500',
  idle: 'bg-yellow-500',
  offline: 'bg-gray-500',
};

// Renders the list of guild members on the right sidebar.
export function MembersList({ members }: MembersListProps) {
  return (
    <div className="h-full rounded-2xl border border-white/12 bg-linear-to-b from-white/12 via-white/5 to-transparent p-5 backdrop-blur-xl">
      <h3 className="mb-4 font-heading text-lg font-semibold text-white">Members ({members.length})</h3>
      <ul className="space-y-3 text-foreground/80">
        {members.map(member => (
          <li key={member.id} className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 font-bold text-white">
                {member.name.charAt(0)}
              </div>
              <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${statusColors[member.status]} ring-2 ring-background/50`}></span>
            </div>
            <span className="font-body">{member.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
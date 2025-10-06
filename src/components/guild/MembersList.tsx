import type { Member } from "@/lib/types";

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
    <div className="h-full bg-background/50 rounded-lg p-4">
      <h3 className="font-heading text-lg font-semibold mb-4">Members ({members.length})</h3>
      <ul className="space-y-3">
        {members.map(member => (
          <li key={member.id} className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold">
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

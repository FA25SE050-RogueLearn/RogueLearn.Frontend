"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Users,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Shield,
  Flame,
  Swords,
  Target
} from "lucide-react";
import { toast } from "sonner";
import eventServiceApi from "@/api/eventServiceApi";
import guildsApi from "@/api/guildsApi";
import type { Event, RegisteredMember } from "@/types/event-service";
import { createClient } from "@/utils/supabase/client";
import type { CSSProperties } from "react";
import CountdownTimer from "@/components/CountdownTimer";

interface EventDetailsContentProps {
  eventId: string;
}

interface GuildMember {
  user_id: string;
  username: string;
  role: string;
}

const HERO_CARD_CLASS = 'relative overflow-hidden rounded-[32px] border border-[#d23187]/35 bg-linear-to-br from-[#1c0906]/95 via-[#120605]/98 to-[#040101]';
const PANEL_SURFACE_CLASS = 'relative overflow-hidden rounded-3xl border border-[#f5c16c]/20 bg-[#120806]/70';
const SECTION_CARD_CLASS = 'relative overflow-hidden rounded-3xl border border-[#f5c16c]/25 bg-[#120806]/80';
const CTA_CLASS = 'rounded-full bg-linear-to-r from-[#d23187] via-[#f5c16c] to-[#f5c16c] text-[#2b130f] shadow-[0_15px_40px_rgba(210,49,135,0.4)] hover:shadow-[0_20px_50px_rgba(210,49,135,0.6)]';

const TEXTURE_OVERLAY: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  mixBlendMode: 'lighten',
  opacity: 0.35,
};

const CARD_TEXTURE: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  opacity: 0.25,
};

export default function EventDetailsContent({ eventId }: EventDetailsContentProps) {
  const router = useRouter();
  const supabase = createClient();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User & guild state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userGuildId, setUserGuildId] = useState<string | null>(null);
  const [isGuildMaster, setIsGuildMaster] = useState(false);

  // Registration state
  const [registeredMembers, setRegisteredMembers] = useState<RegisteredMember[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  // Member selection state
  const [guildMembers, setGuildMembers] = useState<GuildMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showMemberSelection, setShowMemberSelection] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Fetch user data
  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch event details
  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  // Fetch registered members if user is in a guild
  useEffect(() => {
    if (eventId && userGuildId) {
      fetchRegisteredMembers();
    }
  }, [eventId, userGuildId]);

  // Check for registration deadline and redirect if passed
  useEffect(() => {
    if (!event || !event.assignment_date || event.status !== 'pending') return;

    const checkDeadline = () => {
      const now = new Date();
      const deadline = new Date(event.assignment_date!);

      if (now >= deadline) {
        toast.error('Registration deadline has passed', {
          description: 'Redirecting to events page...'
        });
        setTimeout(() => {
          router.push('/code-battle');
        }, 2000);
      }
    };

    // Check immediately
    checkDeadline();

    // Check every 10 seconds
    const interval = setInterval(checkDeadline, 10000);

    return () => clearInterval(interval);
  }, [event, router]);

  // Auto-redirect to arena if event is active and user is registered
  useEffect(() => {
    if (!event || !isRegistered || !eventId) return;

    const now = new Date();
    const startDate = new Date(event.started_date);
    const endDate = new Date(event.end_date);

    // Check if event is currently active (between start and end date)
    const isEventActive = now >= startDate && now <= endDate;

    // Redirect to code battle room selection if event is active and user is registered
    if (isEventActive && isRegistered) {
      console.log('🚀 Event is active and user is registered, redirecting to code battle room selection...');
      // Use replace to prevent back button from bringing user back to event details
      router.replace(`/code-battle?eventId=${eventId}`);
    }
  }, [event, isRegistered, eventId, router]);

  const fetchUserData = async () => {
    try {
      // Get authenticated user from Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setCurrentUserId(user.id);

      // Fetch user's guild from Guilds API
      const guildResponse = await guildsApi.getMyGuild();
      if (guildResponse.isSuccess && guildResponse.data) {
        setUserGuildId(guildResponse.data.id);

        // Get the user's role in the guild
        const memberRolesResponse = await guildsApi.getMemberRoles(
          guildResponse.data.id,
          user.id
        );

        if (memberRolesResponse.isSuccess && memberRolesResponse.data) {
          setIsGuildMaster(memberRolesResponse.data.includes('GuildMaster'));
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchEventDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventServiceApi.getEventById(eventId);
      if (response.success && response.data) {
        setEvent(response.data);
      } else {
        setError(response.error?.message || 'Failed to load event');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredMembers = async () => {
    if (!userGuildId) return;

    try {
      // Check if this guild is the requester (automatically registered when event is created)
      // Handle both snake_case and PascalCase field names
      const requesterGuildId = event?.requester_guild_id || (event as any)?.RequesterGuildID || (event as any)?.requester_guild_id;
      const isRequesterGuild = requesterGuildId === userGuildId;

      console.log('🔍 Fetching registered members:', {
        eventId,
        userGuildId,
        requesterGuildId,
        isRequesterGuild,
        eventObject: event
      });

      // Step 1: Get registered member IDs from event service
      const eventResponse = await eventServiceApi.getRegisteredGuildMembers(eventId);
      if (!eventResponse.success || !eventResponse.data) {
        // If this is the requester guild, they're registered even without members yet
        console.log('⚠️ No registered members found, setting isRegistered to:', isRequesterGuild);
        setIsRegistered(isRequesterGuild);
        return;
      }

      const registeredUserIds = eventResponse.data.map(m => m.user_id);
      console.log('📋 Found registered user IDs:', registeredUserIds);

      // Step 2: Get full member details from user service (guilds API)
      const guildResponse = await guildsApi.getMembers(userGuildId);
      if (!guildResponse.isSuccess || !guildResponse.data) {
        // If this is the requester guild, they're registered even without members yet
        console.log('⚠️ Failed to fetch guild members, setting isRegistered to:', isRequesterGuild);
        setIsRegistered(isRequesterGuild);
        return;
      }

      // Step 3: Match and enrich the data
      const enrichedMembers = registeredUserIds.map(userId => {
        const guildMember = guildResponse.data.find(m => m.authUserId === userId);
        const eventMember = eventResponse.data?.find(m => m.user_id === userId);
        return {
          user_id: userId,
          username: guildMember?.username || userId,
          email: guildMember?.email,
          selected_at: eventMember?.selected_at,
          registered_at: eventMember?.registered_at
        };
      });

      setRegisteredMembers(enrichedMembers);
      // Guild is registered if they have members OR if they're the requester guild
      const finalIsRegistered = enrichedMembers.length > 0 || isRequesterGuild;
      console.log('✅ Setting isRegistered to:', finalIsRegistered, {
        enrichedMembersCount: enrichedMembers.length,
        isRequesterGuild
      });
      setIsRegistered(finalIsRegistered);
    } catch (err) {
      console.error('Error fetching registered members:', err);
    }
  };

  const fetchGuildMembers = async () => {
    if (!userGuildId) return;

    setLoadingMembers(true);
    try {
      // Fetch guild members from Guilds API
      const response = await guildsApi.getMembers(userGuildId);

      if (response.isSuccess && response.data) {
        setGuildMembers(response.data.map(m => ({
          user_id: m.authUserId,
          username: m.username || 'Unknown',
          role: m.role || 'Member'
        })));
      } else {
        throw new Error('Failed to fetch guild members');
      }
    } catch (err) {
      console.error('Error fetching guild members:', err);
      toast.error('Failed to load guild members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleShowMemberSelection = async () => {
    setShowMemberSelection(true);
    await fetchGuildMembers();
  };

  const handleMemberToggle = (userId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      // Check if adding this member would exceed the total limit
      const totalMembers = registeredMembers.length + newSelected.size;
      if (totalMembers >= (event?.max_players_per_guild || 0)) {
        const remainingSlots = (event?.max_players_per_guild || 0) - registeredMembers.length;
        toast.error(`Only ${remainingSlots} slot${remainingSlots !== 1 ? 's' : ''} remaining`);
        return;
      }
      newSelected.add(userId);
    }
    setSelectedMembers(newSelected);
  };

  const handleRegister = async () => {
    if (!userGuildId || !event) return;

    if (selectedMembers.size === 0) {
      toast.error('You must select at least one member');
      return;
    }

    if (event.max_players_per_guild && selectedMembers.size > event.max_players_per_guild) {
      toast.error(`You can only select up to ${event.max_players_per_guild} members`);
      return;
    }

    setRegistering(true);
    try {
      // Check if this guild is the one that requested the event
      // Handle both snake_case and PascalCase field names
      const requesterGuildId = event.requester_guild_id || (event as any).RequesterGuildID || (event as any).requester_guild_id;
      const isRequesterGuild = requesterGuildId === userGuildId;

      console.log('🔍 Registration check:', {
        isRegistered,
        isRequesterGuild,
        userGuildId,
        requesterGuildId,
        eventObject: event,
        willSkipGuildRegistration: isRegistered || isRequesterGuild
      });

      // Only register guild if not already registered and not the requester guild
      // Requester guilds are automatically registered when the event is approved
      if (!isRegistered && !isRequesterGuild) {
        console.log('📝 Calling registerGuildToEvent API...');
        // Step 1: Register guild to event (for guilds that didn't request the event)
        const registerResponse = await eventServiceApi.registerGuildToEvent(eventId);

        if (!registerResponse.success) {
          toast.error('Failed to register guild', {
            description: registerResponse.error?.message
          });
          setRegistering(false);
          return;
        }
        console.log('✅ Guild registered successfully');
      } else {
        console.log('⏭️ Skipping guild registration (already registered or requester guild)');
      }

      // Step 2: Add members to the registered guild
      // (Requester guilds are already registered when they created the event request)

      const membersResponse = await eventServiceApi.addGuildMembersToEvent(
        eventId,
        {
            members: Array.from(selectedMembers).map(user_id => ({ user_id }))
        }
      );

      if (membersResponse.success) {
        const successMessage = isRegistered
          ? 'Members added successfully!'
          : isRequesterGuild
            ? 'Members registered successfully!'
            : 'Guild registered successfully!';

        toast.success(successMessage, {
          description: `${selectedMembers.size} members ${isRegistered ? 'added to' : 'selected for'} the event`
        });
        setShowMemberSelection(false);
        setSelectedMembers(new Set());
        await fetchRegisteredMembers();
      } else {
        // Don't show toast for member limit error (UI already prevents this)
        const errorMessage = membersResponse.error?.message || '';
        if (!errorMessage.includes('member registered reached limit')) {
          toast.error('Failed to add guild members', {
            description: errorMessage
          });
        }
        // Still refresh the member list to sync with backend state
        await fetchRegisteredMembers();
      }
    } catch (err) {
      console.error('Error registering guild:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setRegistering(false);
    }
  };

  const handleRemoveMember = async (userId: string, username?: string) => {
    if (!event) return;

    try {
      const response = await eventServiceApi.removeGuildMembersFromEvent(
        eventId,
        {
          members: [{ user_id: userId }]
        }
      );

      if (response.success) {
        toast.success('Member removed', {
          description: `${username || userId} has been removed from the event`
        });
        await fetchRegisteredMembers();
      } else {
        toast.error('Failed to remove member', {
          description: response.error?.message
        });
      }
    } catch (err) {
      console.error('Error removing member:', err);
      toast.error('An unexpected error occurred');
    }
  };

  const getEventStatus = () => {
    if (!event) return null;

    const now = new Date();
    const assignmentDate = event.assignment_date ? new Date(event.assignment_date) : null;
    const startDate = new Date(event.started_date);

    if (event.status === 'pending') {
      if (assignmentDate && now < assignmentDate) {
        return {
          label: 'Registration Open',
          color: 'text-emerald-300',
          bg: 'from-emerald-600/20 to-emerald-950/10',
          icon: CheckCircle
        };
      } else {
        return {
          label: 'Registration Closed',
          color: 'text-gray-300',
          bg: 'from-gray-600/20 to-gray-950/10',
          icon: XCircle
        };
      }
    } else if (event.status === 'active') {
      return {
        label: 'Live Now',
        color: 'text-red-300',
        bg: 'from-red-600/20 to-red-950/10',
        icon: Flame
      };
    } else if (event.status === 'completed') {
      return {
        label: 'Completed',
        color: 'text-gray-300',
        bg: 'from-gray-600/20 to-gray-950/10',
        icon: Trophy
      };
    }
    return {
      label: event.status,
      color: 'text-[#f5c16c]',
      bg: 'from-[#f5c16c]/20 to-[#f5c16c]/5',
      icon: Target
    };
  };

  const getTimeUntil = (targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) return 'Started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
        <span className="ml-3 text-[#f9d9eb]/70">Loading event details...</span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <XCircle className="h-12 w-12 text-[#d23187]" />
        <p className="text-[#f9d9eb]/70">{error || 'Event not found'}</p>
        <Button
          onClick={() => router.push('/code-battle')}
          variant="outline"
          className="border-[#d23187]/40 bg-white/5 text-[#f5c16c] hover:bg-[#d23187]/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
    );
  }

  const status = getEventStatus();
  const StatusIcon = status?.icon || Trophy;

  return (
    <div className="space-y-8 px-32 mt-12 pb-24">
      {/* Hero Header */}
      <Card className={HERO_CARD_CLASS}>
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(210,49,135,0.2),transparent_60%)]" />
        <div aria-hidden="true" className="absolute inset-0" style={TEXTURE_OVERLAY} />

        <CardContent className="relative z-10 p-8">
          <div className="mb-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/code-battle')}
              className="inline-flex items-center text-xs uppercase tracking-[0.35em] text-[#f5c16c] hover:text-[#f9d9eb] transition-colors"
            >
              <ArrowLeft className="mr-2 h-3 w-3" />
              Events
            </button>
            <span className="text-white/40">/</span>
            <span className="text-white/80">{event.title}</span>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
                {event.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-foreground/75">
                {event.description || 'Compete in this epic roguelike code battle.'}
              </p>

              {status && (
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#d23187]/50 bg-gradient-to-br ${status.bg} px-5 py-2 shadow-lg">
                  <StatusIcon className={`h-4 w-4 ${status.color}`} />
                  <span className={`text-sm font-bold uppercase tracking-wider ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              )}
            </div>

            {/* Event Stats */}
            <div className="grid w-full max-w-xl gap-4 text-left text-white lg:max-w-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Max Guilds', value: event.max_guilds || 'Unlimited', icon: Shield },
                  { label: 'Per Guild', value: event.max_players_per_guild, icon: Users },
                ].map(({ label, value, icon: Icon }) => (
                  <Card key={label} className={`${PANEL_SURFACE_CLASS} text-center`}>
                    <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
                    <CardContent className="relative flex flex-col items-center gap-2 p-4">
                      <Icon className="h-5 w-5 text-[#f5c16c]" />
                      <span className="text-2xl font-bold">{value}</span>
                      <span className="text-xs uppercase tracking-wide text-foreground/60">{label}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Timeline */}
      <Card className={SECTION_CARD_CLASS}>
        <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
        <CardHeader className="relative border-b border-white/5">
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-[#f5c16c]" />
            Event Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="relative grid gap-4 pt-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#d23187]/30 bg-gradient-to-br from-[#d23187]/15 via-[#f5c16c]/5 to-transparent p-5">
            <div className="flex items-center gap-2 text-[#f5c16c]/80">
              <Calendar className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Start Date</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {new Date(event.started_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            <p className="mt-1 text-sm text-[#f9d9eb]/80">
              {new Date(event.started_date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p className="mt-1 text-xs text-[#f9d9eb]/60">
              {getTimeUntil(event.started_date)} until battle
            </p>
          </div>

          <div className="rounded-2xl border border-[#d23187]/30 bg-gradient-to-br from-[#d23187]/15 via-[#f5c16c]/5 to-transparent p-5">
            <div className="flex items-center gap-2 text-[#f5c16c]/80">
              <Clock className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">End Date</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {new Date(event.end_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            <p className="mt-1 text-sm text-[#f9d9eb]/80">
              {new Date(event.end_date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {event.assignment_date && event.status === 'pending' && (
            <div className="sm:col-span-2 rounded-2xl border border-[#f5c16c]/40 bg-gradient-to-r from-[#f5c16c]/20 via-[#d23187]/10 to-transparent p-5 shadow-[0_0_30px_rgba(245,193,108,0.15)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#f5c16c]/20 p-2">
                    <Trophy className="h-6 w-6 text-[#f5c16c]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-[#f5c16c]">
                      Registration Deadline
                    </p>
                    <p className="text-xs text-[#f9d9eb]/60">
                      {new Date(event.assignment_date!).toLocaleString('en-US')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CountdownTimer
                    endDate={event.assignment_date!}
                    fontSize={32}
                    gap={3}
                    borderRadius={8}
                    horizontalPadding={8}
                    textColor="#f5c16c"
                    fontWeight="bold"
                    gradientHeight={12}
                    gradientFrom="rgba(18, 8, 6, 0.8)"
                    gradientTo="transparent"
                    showLabels={false}
                    counterStyle={{
                      background: 'linear-gradient(135deg, rgba(210, 49, 135, 0.2), rgba(245, 193, 108, 0.1))',
                      border: '1px solid rgba(245, 193, 108, 0.3)',
                      boxShadow: '0 0 20px rgba(245, 193, 108, 0.2)',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Non-Guild Master Message */}
      {userGuildId && !isGuildMaster && event.status === 'pending' && (
        <Card className={SECTION_CARD_CLASS}>
          <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
          <CardHeader className="relative border-b border-white/5">
            <CardTitle className="flex items-center gap-2 text-white">
              <Swords className="h-5 w-5 text-[#f5c16c]" />
              Guild Registration
            </CardTitle>
          </CardHeader>

          <CardContent className="relative space-y-4 pt-6">
            <div className="rounded-2xl border border-white/10 bg-[#0f0504]/80 p-5">
              <p className="text-sm text-[#f9d9eb]/60">
                Only guild masters can register for events. Contact your guild master to participate in this battle.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registration Section - Only show for guild masters */}
      {userGuildId && isGuildMaster && (
        <Card className={SECTION_CARD_CLASS}>
          <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
          <CardHeader className="relative border-b border-white/5">
            <CardTitle className="flex items-center gap-2 text-white">
              <Swords className="h-5 w-5 text-[#f5c16c]" />
              Guild Registration
            </CardTitle>
          </CardHeader>

          <CardContent className="relative space-y-4 pt-6">
            {isRegistered ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-600/40 bg-gradient-to-r from-emerald-600/20 to-emerald-950/10 p-5 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  <div className="rounded-full bg-emerald-600/30 p-2">
                    <CheckCircle className="h-6 w-6 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-300">Guild Registered!</p>
                    <p className="text-xs text-emerald-400/70">
                      Your squad is locked and loaded for battle
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0f0504]/80 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold uppercase tracking-wider text-[#f5c16c]">
                        Registered Warriors ({registeredMembers.length}/{event.max_players_per_guild})
                      </p>
                      {registeredMembers.length >= (event.max_players_per_guild || 0) && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/40 bg-emerald-600/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                          <CheckCircle className="h-3 w-3" />
                          Full
                        </span>
                      )}
                    </div>
                    {event.status === 'pending' && (!event.assignment_date || new Date() < new Date(event.assignment_date)) && (
                      <Button
                        onClick={handleShowMemberSelection}
                        size="sm"
                        variant="outline"
                        disabled={registeredMembers.length >= (event.max_players_per_guild || 0)}
                        className="border-[#f5c16c]/40 bg-white/5 text-[#f5c16c] hover:bg-[#f5c16c]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5"
                      >
                        <Users className="mr-2 h-3 w-3" />
                        Add More
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {registeredMembers.map((member, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3"
                      >
                        <div className="flex items-center gap-2 text-sm text-white/80">
                          <Target className="h-3 w-3 text-[#d23187]" />
                          {member.username || member.user_id}
                        </div>
                        {event.status === 'pending' && (!event.assignment_date || new Date() < new Date(event.assignment_date)) && (
                          <Button
                            onClick={() => handleRemoveMember(member.user_id, member.username)}
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {event.status === 'pending' && event.started_date && (
                  <p className="text-center text-xs text-[#f9d9eb]/50">
                    Battle begins {getTimeUntil(event.started_date)}
                  </p>
                )}
                {/* Member Selection Modal when adding more */}
                {showMemberSelection && (
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between rounded-2xl border border-[#f5c16c]/30 bg-[#f5c16c]/10 p-4">
                      <p className="text-sm font-bold uppercase tracking-wider text-[#f5c16c]">
                        Add More Warriors
                      </p>
                      <span className="text-xs font-bold text-white">
                        {registeredMembers.length + selectedMembers.size} / {event.max_players_per_guild}
                      </span>
                    </div>

                    {loadingMembers ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
                      </div>
                    ) : (
                      <div className="space-y-2 rounded-2xl border border-white/10 bg-[#0f0504]/60 p-4 max-h-[400px] overflow-y-auto">
                        {guildMembers.length === 0 ? (
                          <p className="py-8 text-center text-sm text-[#f9d9eb]/60">No guild members found</p>
                        ) : (
                          guildMembers.map((member) => {
                            const isAlreadyRegistered = registeredMembers.some(rm => rm.user_id === member.user_id);
                            return (
                              <div
                                key={member.user_id}
                                className={`flex items-center justify-between rounded-lg p-3 transition ${
                                  isAlreadyRegistered
                                    ? 'border border-emerald-600/30 bg-emerald-600/10 opacity-50 cursor-not-allowed'
                                    : 'border border-white/5 bg-white/5 hover:bg-white/10'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    checked={selectedMembers.has(member.user_id) || isAlreadyRegistered}
                                    disabled={isAlreadyRegistered}
                                    onCheckedChange={() => !isAlreadyRegistered && handleMemberToggle(member.user_id)}
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-white">{member.username}</p>
                                    {isAlreadyRegistered && (
                                      <p className="text-xs text-emerald-400">Already registered</p>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs text-[#f9d9eb]/50">{member.role}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          setShowMemberSelection(false);
                          setSelectedMembers(new Set());
                        }}
                        variant="outline"
                        className="flex-1 border-[#d23187]/40 bg-white/5 text-[#f5c16c] hover:bg-[#d23187]/20"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleRegister}
                        disabled={selectedMembers.size === 0 || registering}
                        className={`flex-1 ${CTA_CLASS} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {registering ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding Members...
                          </>
                        ) : (
                          <>
                            <Users className="mr-2 h-4 w-4" />
                            Add {selectedMembers.size} Member{selectedMembers.size !== 1 ? 's' : ''}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : event.status === 'pending' && (!event.assignment_date || new Date() < new Date(event.assignment_date)) ? (
              <div className="space-y-4">
                {!showMemberSelection ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-[#d23187]/30 bg-gradient-to-br from-[#d23187]/10 to-transparent p-5">
                      <p className="text-sm text-[#f9d9eb]/80">
                        Assemble your party! Select <span className="font-bold text-[#f5c16c]">up to {event.max_players_per_guild} warriors</span> from your guild to enter this legendary code battle.
                      </p>
                    </div>
                    <Button
                      onClick={handleShowMemberSelection}
                      className={`w-full px-6 py-6 text-sm font-bold uppercase tracking-wider ${CTA_CLASS}`}
                    >
                      <Users className="mr-2 h-5 w-5" />
                      Select Squad & Register
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-2xl border border-[#f5c16c]/30 bg-[#f5c16c]/10 p-4">
                      <p className="text-sm font-bold uppercase tracking-wider text-[#f5c16c]">
                        Choose Your Warriors
                      </p>
                      <span className="text-xs font-bold text-white">
                        {selectedMembers.size} / {event.max_players_per_guild}
                      </span>
                    </div>

                    {loadingMembers ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
                      </div>
                    ) : (
                      <div className="max-h-80 space-y-2 overflow-y-auto">
                        {guildMembers.map((member) => (
                          <div
                            key={member.user_id}
                            className={`group flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                              selectedMembers.has(member.user_id)
                                ? 'border-[#d23187]/60 bg-[#d23187]/15 shadow-[0_0_15px_rgba(210,49,135,0.2)]'
                                : 'border-white/10 bg-[#0f0504]/80 hover:border-[#d23187]/40 hover:bg-[#1d0b09]'
                            }`}
                          >
                            <Checkbox
                              checked={selectedMembers.has(member.user_id)}
                              onCheckedChange={() => handleMemberToggle(member.user_id)}
                              disabled={
                                !selectedMembers.has(member.user_id) &&
                                (registeredMembers.length + selectedMembers.size) >= (event.max_players_per_guild || 0)
                              }
                              className="border-[#f5c16c] data-[state=checked]:bg-[#d23187] data-[state=checked]:border-[#d23187]"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-white">{member.username}</p>
                              <p className="text-xs capitalize text-[#f9d9eb]/50">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          setShowMemberSelection(false);
                          setSelectedMembers(new Set());
                        }}
                        variant="outline"
                        className="flex-1 border-[#d23187]/40 bg-white/5 text-[#f5c16c] hover:bg-[#d23187]/20"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleRegister}
                        disabled={selectedMembers.size === 0 || registering}
                        className={`flex-1 ${CTA_CLASS} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {registering ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Lock In Squad
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 rounded-2xl border border-white/10 bg-[#0f0504]/80 p-5">
                {event.status !== 'pending' ? (
                  <p className="text-sm text-[#f9d9eb]/60">
                    Registration is closed for this event.
                  </p>
                ) : event.assignment_date && new Date() >= new Date(event.assignment_date) ? (
                  <p className="text-sm text-[#f9d9eb]/60">
                    Registration deadline has passed.
                  </p>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {event.status === 'active' && isRegistered && (
        <Button
          onClick={() => router.push(`/code-battle`)}
          className={`w-full px-8 py-6 text-base font-bold uppercase tracking-wider ${CTA_CLASS}`}
          size="lg"
        >
          <Flame className="mr-2 h-6 w-6" />
          Enter The Arena
        </Button>
      )}

      {event.status === 'completed' && (
        <Button
          onClick={() => router.push(`/code-battle/${eventId}/results`)}
          className={`w-full px-8 py-6 text-base font-bold uppercase tracking-wider ${CTA_CLASS}`}
          size="lg"
        >
          <Trophy className="mr-2 h-6 w-6" />
          View Final Results
        </Button>
      )}
    </div>
  );
}

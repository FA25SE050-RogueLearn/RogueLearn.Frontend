// roguelearn-web/src/components/code-battle/CodeBattlePage.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import eventServiceApi from '@/api/eventServiceApi';
import { createClient } from '@/utils/supabase/client';
import type { Event, Room, Problem } from '@/types/event-service';
import EventsSelectionView from './views/EventsSelectionView';
import RoomSelectionView from './views/RoomSelectionView';
import CodeArenaView from './views/CodeArenaView';
import { toast } from 'sonner';

type ViewState = 'events' | 'rooms' | 'arena';
type EventViewMode = 'dashboard' | 'filtered';
type StatusFilter = 'all' | 'live' | 'scheduled' | 'completed' | 'cancelled' | 'preparing';

// Map frontend status keys to backend status values
const statusToApiParam = (status: StatusFilter): string | undefined => {
  switch (status) {
    case 'live':
      return 'active';
    case 'scheduled':
      return 'pending';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    case 'all':
    case 'preparing':
      return undefined; // No status filter for 'all', 'preparing' is client-side
    default:
      return undefined;
  }
};

export default function CodeBattlePage() {
  const router = useRouter();
  
  // Navigation state
  const [currentView, setCurrentView] = useState<ViewState>('events');

  // Event view mode state
  const [eventViewMode, setEventViewMode] = useState<EventViewMode>('dashboard');
  const [currentStatusFilter, setCurrentStatusFilter] = useState<StatusFilter>('all');

  // Data state
  const [events, setEvents] = useState<Event[]>([]); // Used in filtered mode
  const [activeEvents, setActiveEvents] = useState<Event[]>([]); // Dashboard mode: active events
  const [scheduledEvents, setScheduledEvents] = useState<Event[]>([]); // Dashboard mode: scheduled events
  const [completedEvents, setCompletedEvents] = useState<Event[]>([]); // Dashboard mode: completed events

  // Total counts for dashboard sections
  const [activeTotalCount, setActiveTotalCount] = useState(0);
  const [scheduledTotalCount, setScheduledTotalCount] = useState(0);
  const [completedTotalCount, setCompletedTotalCount] = useState(0);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);

  // Pagination state
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotalPages, setEventsTotalPages] = useState(1);
  const [eventsPageSize] = useState(6);

  const [roomsPage, setRoomsPage] = useState(1);
  const [roomsTotalPages, setRoomsTotalPages] = useState(1);
  const [roomsPageSize] = useState(6);

  // Selection state
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [selectedProblemTitle, setSelectedProblemTitle] = useState<string>('');
  const [selectedProblemStatement, setSelectedProblemStatement] = useState<string>('');

  // Loading states
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingProblems, setLoadingProblems] = useState(false);

  // Coding state
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [submissionResult, setSubmissionResult] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [spaceConstraintMb, setSpaceConstraintMb] = useState<number | null>(null);

  // User and connection state
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Array<{ message: string; type: string; time: string }>>([]);
  const [leaderboardData, setLeaderboardData] = useState<Array<{ place: number; player_name: string; score: number }>>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Event timer state
  const [eventSecondsLeft, setEventSecondsLeft] = useState<number | null>(null);
  const [eventEndDate, setEventEndDate] = useState<string | null>(null);

  // Get current user ID from Supabase
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setPlayerId(user.id);
      }
    };
    getUser();
  }, []);

  const addNotification = (message: string, type: string = 'info') => {
    const time = new Date().toLocaleTimeString();
    setNotifications(prev => [...prev, { message, type, time }]);
  };

  // Fetch events on mount and when page or status filter changes
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        if (eventViewMode === 'dashboard') {
          // Dashboard mode: Fetch 3 separate lists for each status
          const [activeResponse, scheduledResponse, completedResponse] = await Promise.all([
            eventServiceApi.getAllEvents(1, 4, 'code_battle', 'active'), // First 4 active events
            eventServiceApi.getAllEvents(1, 4, 'code_battle', 'pending'), // First 4 scheduled events
            eventServiceApi.getAllEvents(1, 4, 'code_battle', 'completed'), // First 4 completed events
          ]);

          if (activeResponse.success && activeResponse.data) {
            setActiveEvents(activeResponse.data);
            setActiveTotalCount(activeResponse.pagination?.total_count || 0);
          }
          if (scheduledResponse.success && scheduledResponse.data) {
            setScheduledEvents(scheduledResponse.data);
            setScheduledTotalCount(scheduledResponse.pagination?.total_count || 0);
          }
          if (completedResponse.success && completedResponse.data) {
            setCompletedEvents(completedResponse.data);
            setCompletedTotalCount(completedResponse.pagination?.total_count || 0);
          }
        } else {
          // Filtered mode: Fetch events with specific status filter
          const apiStatus = statusToApiParam(currentStatusFilter);
          const response = await eventServiceApi.getAllEvents(eventsPage, eventsPageSize, 'code_battle', apiStatus);
          if (response.success && response.data && Array.isArray(response.data)) {
            setEvents(response.data);

            // Update pagination metadata
            if (response.pagination) {
              setEventsTotalPages(response.pagination.total_pages);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        addNotification('Failed to load events', 'error');
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [eventsPage, eventsPageSize, currentStatusFilter, eventViewMode]);

  // Reset rooms page when event changes
  useEffect(() => {
    if (selectedEventId) {
      setRoomsPage(1);
    }
  }, [selectedEventId]);

  // Fetch rooms when event is selected or page changes
  useEffect(() => {
    if (!selectedEventId) {
      setRooms([]);
      return;
    }

    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const response = await eventServiceApi.getEventRooms(selectedEventId, roomsPage, roomsPageSize);
        if (response.success && response.data && Array.isArray(response.data)) {
          setRooms(response.data);

          // Update pagination metadata
          if (response.pagination) {
            setRoomsTotalPages(response.pagination.total_pages);
          }
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        addNotification('Failed to load rooms', 'error');
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [selectedEventId, roomsPage, roomsPageSize]);

  // Fetch problems when room is selected
  useEffect(() => {
    if (!selectedEventId || !selectedRoomId) {
      setProblems([]);
      return;
    }

    const fetchProblems = async () => {
      setLoadingProblems(true);
      try {
        const response = await eventServiceApi.getEventProblems(selectedEventId);
        if (response.success && response.data && Array.isArray(response.data)) {
          setProblems(response.data);
        }
      } catch (error) {
        console.error('Error fetching problems:', error);
        addNotification('Failed to load problems', 'error');
      } finally {
        setLoadingProblems(false);
      }
    };

    fetchProblems();
  }, [selectedEventId, selectedRoomId]);

  const loadProblemDetails = useCallback(async (problemId: string, lang: string) => {
    try {
      const normalizedLang = lang === 'go' ? 'Golang' :
                            lang === 'python' ? 'Python' : 'Javascript';

      const response = await eventServiceApi.getProblemDetails(problemId, normalizedLang);

      if (response.success && response.data) {
        const solutionStub = response.data.solution_stub || '// Start coding here';
        setCode(solutionStub);
        setSpaceConstraintMb(response.data.space_constraint_mb || null);
        addNotification(`Loaded problem - ${normalizedLang}`);
      } else {
        setCode('// Start coding here\n// Solution stub not available');
        setSpaceConstraintMb(null);
        addNotification(`Failed to load ${normalizedLang} template`, 'error');
      }
    } catch (error) {
      console.error('Error loading problem template:', error);
      setCode('// Start coding here');
      setSpaceConstraintMb(null);
      addNotification('Error loading problem template', 'error');
    }
  }, []);

  // Reload problem details when language changes
  useEffect(() => {
    if (selectedProblemId && currentView === 'arena') {
      loadProblemDetails(selectedProblemId, language);
    }
  }, [language, selectedProblemId, loadProblemDetails, currentView]);

  // Handle problem selection from dropdown
  const handleProblemChange = useCallback((problemId: string) => {
    setSelectedProblemId(problemId);
    const problem = problems.find(p => p.id === problemId);
    if (problem) {
      setSelectedProblemTitle(problem.title);
      setSelectedProblemStatement(problem.problem_statement);
      loadProblemDetails(problemId, language);
    }
  }, [problems, language, loadProblemDetails]);

  const joinRoom = async (eventId: string, roomId: string): Promise<boolean> => {
    if (!playerId) {
      addNotification('Unable to join room: Player not authenticated', 'error');
      return false;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        addNotification('Unable to join room: No auth token', 'error');
        return false;
      }

      const eventSource = eventServiceApi.createRoomSSE(eventId, roomId, playerId, session.access_token);
      eventSourceRef.current = eventSource;

      // Track if we successfully connected
      let connectionSuccessful = false;
      let connectionError = false;

      eventSource.onopen = () => {
        connectionSuccessful = true;
        addNotification(`Connected to room`, 'success');
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        connectionError = true;

        // Check if it's a "cannot rejoin" error by trying to parse the error
        // EventSource doesn't provide detailed error info, but we can detect connection failures
        if (!connectionSuccessful) {
          addNotification('Cannot join room. You may have left this room previously.', 'error');
          eventSource.close();
          eventSourceRef.current = null;
        } else {
          addNotification('Connection error - retrying...', 'error');
        }
      };

      eventSource.addEventListener('CORRECT_SOLUTION_SUBMITTED', (e) => {
        try {
          const eventData = JSON.parse((e as MessageEvent).data);
          const data = eventData.Data;
          const playerIdFromEvent = data?.SolutionSubmitted?.PlayerID;
          
          addNotification('A correct solution was submitted!', 'success');
          
          if (playerIdFromEvent === playerId) {
            setIsSubmitting(false);
            const executionTime = data?.ExecutionTimeMs || 'N/A';
            const score = data?.Score || 0;
            const message = data?.Message || 'Solution is correct!';

            setSubmissionResult(
              `SUCCESS|✅ ${message}|Execution Time: ${executionTime}|Score: ${score} points|Status: ${data?.Status || 'Accepted'}`
            );
            addNotification(`Your solution scored ${score} points! (${executionTime})`, 'success');
          }
        } catch (error) {
          console.error('Error parsing CORRECT_SOLUTION_SUBMITTED:', error);
        }
      });

      eventSource.addEventListener('WRONG_SOLUTION_SUBMITTED', (e) => {
        try {
          const eventData = JSON.parse((e as MessageEvent).data);
          const data = eventData.Data;
          const playerIdFromEvent = data?.SolutionSubmitted?.PlayerID;
          
          if (playerIdFromEvent === playerId) {
            setIsSubmitting(false);
            const errorMessage = data?.Message || data?.error_message || 'Your solution failed.';
            const executionTime = data?.ExecutionTimeMs || 'N/A';
            const status = data?.Status || 'Failed';
            
            addNotification(`Solution failed: ${errorMessage}`, 'error');
            setSubmissionResult(
              `ERROR|❌ ${errorMessage}|Execution Time: ${executionTime}|Status: ${status}`
            );
          }
        } catch (error) {
          console.error('Error parsing WRONG_SOLUTION_SUBMITTED:', error);
        }
      });

      eventSource.addEventListener('LEADERBOARD_UPDATED', (e) => {
        try {
          const eventData = JSON.parse((e as MessageEvent).data);
          console.log('Leaderboard update received:', eventData);
          
          // Store leaderboard data in parent state
          if (Array.isArray(eventData.Data)) {
            setLeaderboardData(eventData.Data);
          }
          
          addNotification('Leaderboard updated', 'info');
          // The CodeArenaView component will receive this data via props
        } catch (error) {
          console.error('Error parsing LEADERBOARD_UPDATED:', error);
        }
      });

      eventSource.addEventListener('PLAYER_JOINED', (e) => {
        const eventData = JSON.parse((e as MessageEvent).data);
        addNotification(`${eventData.player_name || 'A player'} joined the room`);
      });

      eventSource.addEventListener('PLAYER_LEFT', (e) => {
        const eventData = JSON.parse((e as MessageEvent).data);
        addNotification(`${eventData.player_name || 'A player'} left the room`);
      });

      eventSource.addEventListener('EVENT_STARTED', () => {
        addNotification('Event has started!', 'success');
      });

      eventSource.addEventListener('EVENT_ENDED', () => {
        addNotification('Event has ended! Redirecting to results...', 'success');

        // Close SSE connection
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        // Show toast notification
        toast.success('Battle Complete!', {
          description: 'The event has ended. Redirecting to the leaderboard...',
          duration: 3000,
        });

        // Redirect to results page after a brief delay
        const eventIdForRedirect = selectedEventId;
        setTimeout(() => {
          if (eventIdForRedirect) {
            router.push(`/code-battle/${eventIdForRedirect}/results`);
          } else {
            // Fallback to events if no event ID
            setCurrentView('events');
          }
          // Clean up state
          setSelectedEventId(null);
          setSelectedRoomId(null);
          setSelectedProblemId(null);
          setSelectedProblemTitle('');
          setSelectedProblemStatement('');
          setSubmissionResult('');
          setLeaderboardData([]);
        }, 2000);
      });

      eventSource.addEventListener('initial_time', (e) => {
        try {
          const eventData = JSON.parse((e as MessageEvent).data);
          if (eventData.Data) {
            setEventSecondsLeft(eventData.Data.seconds_left);
            setEventEndDate(eventData.Data.end_date);
          }
        } catch (error) {
          console.error('Error parsing initial_time data:', error);
        }
      });

      // Wait a bit to see if connection succeeds or fails immediately
      await new Promise(resolve => setTimeout(resolve, 500));

      if (connectionError && !connectionSuccessful) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      addNotification('Failed to connect to room', 'error');
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!selectedEventId || !selectedRoomId || !selectedProblemId) {
      addNotification('Please select an event, room, and problem first', 'error');
      return;
    }
    if (!code.trim()) {
      addNotification('Code editor cannot be empty', 'error');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult('SUBMITTING|⏳ Evaluating your solution...|Please wait while we run test cases');
    addNotification('Submitting solution...', 'info');

    const languageMap: Record<string, string> = {
      'javascript': 'Javascript',
      'python': 'Python',
      'go': 'Golang',
      'java': 'Java',
      'cpp': 'Cpp',
      'c': 'C',
    };

    const languageName = languageMap[language] || 'Javascript';

    try {
      const response = await eventServiceApi.submitRoomSolution(
        selectedEventId,
        selectedRoomId,
        {
          problem_id: selectedProblemId,
          language: languageName,
          code: code,
        }
      );

      if (response.success && response.data) {
        addNotification(`Submission received - evaluating...`, 'info');
      } else {
        setIsSubmitting(false);
        
        // Check for 409 Conflict - Problem already solved
        const errorStatus = (response.error as any)?.status;
        const errorMessage = response.error?.message || 'Unknown error';
        
        console.log('API Error:', { errorStatus, errorMessage, fullError: response.error });

        if (errorStatus === 409) {
          setSubmissionResult(`INFO|✅ Problem Already Solved|${errorMessage}`);
          addNotification('You have already solved this problem', 'info');
        } else {
          setSubmissionResult(`ERROR|❌ Submission failed|${errorMessage}`);
          addNotification(`Submission failed: ${errorMessage}`, 'error');
        }
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      setIsSubmitting(false);
      setSubmissionResult(`ERROR|❌ Submission error|${error.message || 'Unknown error'}`);
      addNotification(`Submission error: ${error.message}`, 'error');
    }
  };

  // Navigation handlers
  const handleSelectEvent = async (eventId: string) => {
    // Validate that user is registered for this event
    if (!playerId) {
      toast.error('Please log in to enter this event');
      return;
    }

    try {
      // Get event details to check status
      const eventResponse = await eventServiceApi.getEventById(eventId);
      if (!eventResponse.success || !eventResponse.data) {
        toast.error('Failed to load event details. Please try again.');
        return;
      }

      const event = eventResponse.data;

      // Get user's guild ID
      const supabase = createClient();
      const { data: guilds } = await supabase
        .from('guilds')
        .select('id')
        .eq('created_by', playerId)
        .limit(1);

      const guildId = guilds?.[0]?.id;

      if (!guildId) {
        // Check if user is a member of any guild
        const { data: memberships } = await supabase
          .from('guild_members')
          .select('guild_id')
          .eq('user_id', playerId)
          .limit(1);

        const memberGuildId = memberships?.[0]?.guild_id;

        if (!memberGuildId) {
          toast.error('You must be in a guild to enter events');
          return;
        }
      }

      const userGuildId = guildId || (await supabase
        .from('guild_members')
        .select('guild_id')
        .eq('user_id', playerId)
        .limit(1)
        .then(res => res.data?.[0]?.guild_id));

      if (!userGuildId) {
        toast.error('You must be in a guild to enter events');
        return;
      }

      // Check if user's guild is registered for this event
      const registrationResponse = await eventServiceApi.getRegisteredGuildMembers(eventId);

      if (!registrationResponse.success) {
        toast.error('Failed to check event registration. Please try again.');
        return;
      }

      // Check if current user is in the registered members list
      const registeredMembers = registrationResponse.data || [];

      if (registeredMembers.length === 0) {
        // If event is active or completed, registration window has closed
        if (event.status === 'active') {
          toast.error('Registration closed. This event is already live - you missed the registration window.');
          return;
        } else if (event.status === 'completed') {
          toast.error('This event has ended. Registration is no longer available.');
          return;
        } else {
          toast.error('Your guild has not registered any members for this event yet. Contact your guild master to register.');
          return;
        }
      }

      const isUserRegistered = registeredMembers.some((member: any) => member.user_id === playerId);

      if (!isUserRegistered) {
        // If event is active or completed, it's too late to register
        if (event.status === 'active') {
          toast.error('Registration closed. This event is already live - only registered members can participate.');
          return;
        } else if (event.status === 'completed') {
          toast.error('This event has ended. You were not registered for this event.');
          return;
        } else {
          toast.error('You are not registered for this event. Contact your guild master to add you to the roster.');
          return;
        }
      }

      // Check if event has actually started
      const now = new Date();
      const startDate = new Date(event.started_date);

      if (now < startDate) {
        const timeUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / 1000 / 60); // minutes

        if (timeUntilStart > 60) {
          const hoursUntilStart = Math.ceil(timeUntilStart / 60);
          toast.error(`Event hasn't started yet. The arena opens in ${hoursUntilStart} hour${hoursUntilStart > 1 ? 's' : ''}.`);
        } else {
          toast.error(`Event hasn't started yet. The arena opens in ${timeUntilStart} minute${timeUntilStart > 1 ? 's' : ''}.`);
        }
        return;
      }

      // User is validated, proceed to rooms
      setSelectedEventId(eventId);
      setSelectedRoomId(null);
      setSelectedProblemId(null);
      setSelectedProblemTitle('');
      setCurrentView('rooms');
      toast.success('Welcome to the event!');
    } catch (error) {
      console.error('Error validating registration:', error);
      toast.error('Failed to validate registration. Please try again.');
    }
  };

  const handleSelectRoom = async (roomId: string) => {
    setSelectedRoomId(roomId);
    setSelectedProblemId(null);
    setSelectedProblemTitle('');
    setSelectedProblemStatement('');
    setLeaderboardData([]); // Clear leaderboard when changing rooms
    if (selectedEventId) {
      const canJoin = await joinRoom(selectedEventId, roomId);
      if (!canJoin) {
        // If cannot join any room, kick them out of the entire event
        setCurrentView('events');
        setSelectedEventId(null);
        setSelectedRoomId(null);
        setSelectedProblemId(null);
        setSelectedProblemTitle('');
        setSelectedProblemStatement('');
        setSubmissionResult('');
        setLeaderboardData([]);
        toast.error('Cannot join event', {
          description: 'You have previously left this event and cannot rejoin. Please choose a different event.'
        });
      }
    }
  };

  const handleSelectProblem = async (problemId: string, title: string, statement: string) => {
    setSelectedProblemId(problemId);
    setSelectedProblemTitle(title);
    setSelectedProblemStatement(statement);
    setSubmissionResult('');
  };

  const handleStartCoding = async () => {
    if (selectedProblemId) {
      await loadProblemDetails(selectedProblemId, language);
      setCurrentView('arena');
    }
  };

  const handleBackToEvents = async () => {
    // Close SSE connection when leaving the room
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Call leave room API if we have the IDs
    if (selectedEventId && selectedRoomId) {
      try {
        const response = await eventServiceApi.leaveRoom(selectedEventId, selectedRoomId);
        if (response.success) {
          addNotification('Left room successfully', 'info');
        } else {
          console.error('Failed to leave room:', response.error);
          // Don't block navigation on API error - SSE disconnect is what matters
        }
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    }

    // Navigate back to events
    setCurrentView('events');
    setSelectedEventId(null);
    setSelectedRoomId(null);
    setSelectedProblemId(null);
    setSelectedProblemTitle('');
    setSelectedProblemStatement('');
    setSubmissionResult('');
    setLeaderboardData([]);
  };

  const handleBackToRooms = () => {
    // Just navigate back to room selection view, don't leave the room
    setCurrentView('rooms');
    setSelectedProblemId(null);
    setSelectedProblemTitle('');
    setSelectedProblemStatement('');
    setCode('');
    setSubmissionResult('');
  };

  const handleViewModeChange = (mode: EventViewMode, status?: StatusFilter) => {
    setEventViewMode(mode);

    if (mode === 'filtered' && status) {
      // When switching to filtered mode with a specific status
      setCurrentStatusFilter(status);
      setEventsPage(1); // Reset to first page
    } else if (mode === 'dashboard') {
      // When returning to dashboard, reset to show all events
      setCurrentStatusFilter('all');
      setEventsPage(1);
    }
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const selectedEvent = events.find(e => (e.id ?? e.ID) === selectedEventId) || null;
  const selectedRoom = rooms.find(r => r.ID === selectedRoomId) || null;

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto px-4 py-8">
        {currentView === 'events' && (
          <EventsSelectionView
            events={eventViewMode === 'dashboard' ? [...activeEvents, ...scheduledEvents, ...completedEvents] : events}
            loading={loadingEvents}
            onSelectEvent={handleSelectEvent}
            eventSecondsLeft={eventSecondsLeft}
            eventEndDate={eventEndDate}
            currentPage={eventsPage}
            totalPages={eventsTotalPages}
            onPageChange={setEventsPage}
            viewMode={eventViewMode}
            onViewModeChange={handleViewModeChange}
            currentStatusFilter={currentStatusFilter}
            activeTotalCount={activeTotalCount}
            scheduledTotalCount={scheduledTotalCount}
            completedTotalCount={completedTotalCount}
          />
        )}

        {currentView === 'rooms' && (
          <RoomSelectionView
            event={selectedEvent}
            rooms={rooms}
            problems={problems}
            loadingRooms={loadingRooms}
            loadingProblems={loadingProblems}
            selectedRoomId={selectedRoomId}
            selectedProblemId={selectedProblemId}
            onBack={handleBackToEvents}
            onSelectRoom={handleSelectRoom}
            onSelectProblem={handleSelectProblem}
            onStartCoding={handleStartCoding}
            eventSecondsLeft={eventSecondsLeft}
            eventEndDate={eventEndDate}
            currentPage={roomsPage}
            totalPages={roomsTotalPages}
            onPageChange={setRoomsPage}
          />
        )}

        {currentView === 'arena' && (
          <CodeArenaView
            event={selectedEvent}
            room={selectedRoom}
            problemTitle={selectedProblemTitle}
            problemStatement={selectedProblemStatement}
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            onSubmit={handleSubmit}
            submissionResult={submissionResult}
            isSubmitting={isSubmitting}
            spaceConstraintMb={spaceConstraintMb}
            onBack={handleBackToRooms}
            eventId={selectedEventId}
            roomId={selectedRoomId}
            eventSourceRef={eventSourceRef}
            notifications={notifications}
            leaderboardData={leaderboardData}
            eventSecondsLeft={eventSecondsLeft}
            eventEndDate={eventEndDate}
            problems={problems}
            selectedProblemId={selectedProblemId}
            onProblemChange={handleProblemChange}
          />
        )}
      </div>
    </div>
  );
}

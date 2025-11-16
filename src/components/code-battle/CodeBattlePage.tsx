// roguelearn-web/src/components/code-battle/CodeBattlePage.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import eventServiceApi from '@/api/eventServiceApi';
import { createClient } from '@/utils/supabase/client';
import type { Event, Room, Problem } from '@/types/event-service';
import EventsSelectionView from './views/EventsSelectionView';
import RoomSelectionView from './views/RoomSelectionView';
import CodeArenaView from './views/CodeArenaView';

type ViewState = 'events' | 'rooms' | 'arena';

export default function CodeBattlePage() {
  // Navigation state
  const [currentView, setCurrentView] = useState<ViewState>('events');

  // Data state
  const [events, setEvents] = useState<Event[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);

  // Selection state
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [selectedProblemTitle, setSelectedProblemTitle] = useState<string>('');

  // Loading states
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingProblems, setLoadingProblems] = useState(false);

  // Coding state
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [submissionResult, setSubmissionResult] = useState<string>('');
  const [spaceConstraintMb, setSpaceConstraintMb] = useState<number | null>(null);

  // User and connection state
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Array<{ message: string; type: string; time: string }>>([]);
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

  // Fetch events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const response = await eventServiceApi.getAllEvents();
        if (response.success && response.data && Array.isArray(response.data)) {
          const codeBattleEvents = response.data.filter(
            (event) => event.Type === 'code_battle'
          );
          setEvents(codeBattleEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        addNotification('Failed to load events', 'error');
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  // Fetch rooms when event is selected
  useEffect(() => {
    if (!selectedEventId) {
      setRooms([]);
      return;
    }

    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const response = await eventServiceApi.getEventRooms(selectedEventId);
        if (response.success && response.data && Array.isArray(response.data)) {
          setRooms(response.data);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        addNotification('Failed to load rooms', 'error');
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [selectedEventId]);

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

  const joinRoom = async (eventId: string, roomId: string) => {
    if (!playerId) {
      addNotification('Unable to join room: Player not authenticated', 'error');
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        addNotification('Unable to join room: No auth token', 'error');
        return;
      }

      const eventSource = eventServiceApi.createRoomSSE(eventId, roomId, playerId, session.access_token);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        addNotification(`Connected to room`, 'success');
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        addNotification('Connection error - retrying...', 'error');
      };

      eventSource.addEventListener('CORRECT_SOLUTION_SUBMITTED', (e) => {
        const eventData = JSON.parse((e as MessageEvent).data);
        addNotification('A correct solution was submitted!', 'success');
        if (eventData.player_id === playerId) {
          setSubmissionResult('✅ Success! All test cases passed. Your solution has been accepted.');
        }
      });

      eventSource.addEventListener('WRONG_SOLUTION_SUBMITTED', (e) => {
        const eventData = JSON.parse((e as MessageEvent).data);
        const errorMessage = eventData.error_message || 'Your solution failed.';
        if (eventData.player_id === playerId) {
          addNotification(`Solution failed: ${errorMessage}`, 'error');
          setSubmissionResult(`❌ ${errorMessage}`);
        }
      });

      eventSource.addEventListener('LEADERBOARD_UPDATED', (e) => {
        addNotification('Leaderboard updated');
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
        addNotification('Event has ended', 'info');
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
    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      addNotification('Failed to connect to room', 'error');
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

    setSubmissionResult('Submitting...');
    addNotification('Submitting solution...', 'info');

    const languageIdMap: Record<string, string> = {
      'javascript': '63',
      'python': '71',
      'go': '60',
      'java': '62',
      'cpp': '54',
      'c': '50',
    };

    const languageId = languageIdMap[language] || '63';

    try {
      const response = await eventServiceApi.submitRoomSolution(
        selectedEventId,
        selectedRoomId,
        {
          problem_id: selectedProblemId,
          language_id: languageId,
          source_code: code,
        }
      );

      if (response.success && response.data) {
        addNotification(`Submission received - evaluating...`, 'info');
      } else {
        setSubmissionResult(`❌ Submission failed: ${response.error?.message || 'Unknown error'}`);
        addNotification(`Submission failed: ${response.error?.message}`, 'error');
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      setSubmissionResult(`❌ Submission error: ${error.message || 'Unknown error'}`);
      addNotification(`Submission error: ${error.message}`, 'error');
    }
  };

  // Navigation handlers
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setSelectedRoomId(null);
    setSelectedProblemId(null);
    setSelectedProblemTitle('');
    setCurrentView('rooms');
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setSelectedProblemId(null);
    setSelectedProblemTitle('');
    if (selectedEventId) {
      joinRoom(selectedEventId, roomId);
    }
  };

  const handleSelectProblem = async (problemId: string, title: string) => {
    setSelectedProblemId(problemId);
    setSelectedProblemTitle(title);
  };

  const handleStartCoding = async () => {
    if (selectedProblemId) {
      await loadProblemDetails(selectedProblemId, language);
      setCurrentView('arena');
    }
  };

  const handleBackToEvents = () => {
    setCurrentView('events');
    setSelectedEventId(null);
    setSelectedRoomId(null);
    setSelectedProblemId(null);
    setSelectedProblemTitle('');
  };

  const handleBackToRooms = () => {
    setCurrentView('rooms');
    setSelectedProblemId(null);
    setSelectedProblemTitle('');
    setCode('');
    setSubmissionResult('');
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const selectedEvent = events.find(e => e.ID === selectedEventId) || null;
  const selectedRoom = rooms.find(r => r.ID === selectedRoomId) || null;

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto px-4 py-8">
        {currentView === 'events' && (
          <EventsSelectionView
            events={events}
            loading={loadingEvents}
            onSelectEvent={handleSelectEvent}
            eventSecondsLeft={eventSecondsLeft}
            eventEndDate={eventEndDate}
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
          />
        )}

        {currentView === 'arena' && (
          <CodeArenaView
            event={selectedEvent}
            room={selectedRoom}
            problemTitle={selectedProblemTitle}
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            onSubmit={handleSubmit}
            submissionResult={submissionResult}
            spaceConstraintMb={spaceConstraintMb}
            onBack={handleBackToRooms}
            eventId={selectedEventId}
            roomId={selectedRoomId}
            eventSourceRef={eventSourceRef}
            notifications={notifications}
            eventSecondsLeft={eventSecondsLeft}
            eventEndDate={eventEndDate}
          />
        )}
      </div>
    </div>
  );
}

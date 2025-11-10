// roguelearn-web/src/components/code-battle/CodeBattlePage.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EventsList from './EventsList';
import RoomsList from './RoomsList';
import Leaderboard from './Leaderboard';
import ProblemsList from './ProblemsList';
import CodeEditor from './CodeEditor';
import ExercisesList from './ExercisesList';
import Notifications from './Notifications';

// This component will now correctly use the dedicated environment variable for the Code Battle service.
const API_BASE_URL = process.env.NEXT_PUBLIC_CODE_BATTLE_API_URL;
const PLAYER_ID = "11111111-1111-1111-1111-111111111111"; // TODO: Get from auth

export default function CodeBattlePage() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [selectedProblemTitle, setSelectedProblemTitle] = useState<string>('');
  const [notifications, setNotifications] = useState<Array<{ message: string; type: string; time: string }>>([]);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [submissionResult, setSubmissionResult] = useState<string>('');
  const eventSourceRef = useRef<EventSource | null>(null);

  const addNotification = (message: string, type: string = 'info') => {
    const time = new Date().toLocaleTimeString();
    setNotifications(prev => [...prev, { message, type, time }]);
  };

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    setSelectedRoomId(null);
    setSelectedProblemId(null);
    setSelectedProblemTitle('');
    setSubmissionResult('');
  };

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    setSelectedProblemId(null);
    setSelectedProblemTitle('');
    setSubmissionResult('');
    
    if (selectedEventId) {
      joinRoom(selectedEventId, roomId);
    }
  };

  const handleProblemSelect = async (problemId: string, title: string) => {
    setSelectedProblemId(problemId);
    setSelectedProblemTitle(title);
    setSubmissionResult('');
    
    // Immediately load the code stub
    try {
      const { mockProblemLanguageDetails } = await import('@/lib/mockCodeBattleData');
      const normalizedLang = language === 'go' ? 'Golang' : 
                            language === 'python' ? 'Python' : 'Javascript';
      const problemDetails = mockProblemLanguageDetails[problemId]?.[normalizedLang];
      
      if (problemDetails) {
        setCode(problemDetails.SolutionStub);
        addNotification(`Loaded ${title} - ${normalizedLang}`);
      } else {
        setCode('// Start coding here\n// Solution stub not available for this problem/language combination');
        addNotification(`No ${normalizedLang} template for ${title}`, 'error');
      }
    } catch (error) {
      console.error('Error loading problem template:', error);
      setCode('// Start coding here');
      addNotification('Error loading problem template', 'error');
    }
  };

  const joinRoom = (eventId: string, roomId: string) => {
    // Skip SSE connection when using mock data
    const USE_MOCK_DATA = true;
    if (USE_MOCK_DATA) {
      addNotification(`Joined room (mock mode)`);
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `${API_BASE_URL}/events/${eventId}/rooms/${roomId}/leaderboard?connected_player_id=${PLAYER_ID}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      addNotification(`Connected to room ${roomId}`);
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      addNotification('Connection error', 'error');
      eventSource.close();
    };

    eventSource.addEventListener('CORRECT_SOLUTION_SUBMITTED', (e) => {
      addNotification('A correct solution was submitted!', 'success');
      setSubmissionResult('Success! Solution Accepted.');
    });

    eventSource.addEventListener('WRONG_SOLUTION_SUBMITTED', (e) => {
      const eventData = JSON.parse(e.data);
      const errorMessage = eventData.Data || 'Your solution failed.';
      addNotification(`Solution failed: ${errorMessage}`, 'error');
      setSubmissionResult(`Failed: ${errorMessage}`);
    });

    eventSource.addEventListener('LEADERBOARD_UPDATED', (e) => {
      addNotification('Leaderboard updated');
    });

    eventSource.addEventListener('PLAYER_JOINED', () => {
      addNotification('A player has joined the room');
    });

    eventSource.addEventListener('PLAYER_LEFT', () => {
      addNotification('A player has left the room');
    });
  };

  const handleSubmit = async () => {
    if (!selectedEventId || !selectedRoomId || !selectedProblemId) {
      alert('Please select an event, room, and problem first.');
      return;
    }
    if (!code.trim()) {
      alert('Code editor cannot be empty.');
      return;
    }

    setSubmissionResult('Submitting...');
    addNotification('Submitting solution...', 'info');

    // Simulate submission with mock data
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% success rate for demo
      
      if (isSuccess) {
        setSubmissionResult('✅ Success! All test cases passed. Your solution has been accepted.');
        addNotification(`Solution accepted for ${selectedProblemTitle}!`, 'success');
      } else {
        const errors = [
          'Test case 1 failed: Expected 5, got 3',
          'Runtime error: Index out of bounds',
          'Time limit exceeded on test case 3',
          'Wrong answer: Expected [1,2], got [2,1]'
        ];
        const randomError = errors[Math.floor(Math.random() * errors.length)];
        setSubmissionResult(`❌ ${randomError}`);
        addNotification(`Submission failed: ${randomError}`, 'error');
      }
    }, 1500); // Simulate processing time
  };

  const handleExerciseSubmit = async (exerciseProblemId: string, exerciseCode: string, exerciseLanguage: string) => {
    // Simulate exercise submission with mock data
    return new Promise((resolve) => {
      addNotification('Submitting exercise...', 'info');
      
      setTimeout(() => {
        const isSuccess = Math.random() > 0.4; // 60% success rate for demo
        
        if (isSuccess) {
          addNotification('Exercise solution passed!', 'success');
          resolve({ 
            success: true, 
            data: { 
              success: true,
              execution_time_ms: Math.floor(Math.random() * 500 + 50),
              stdout: 'All test cases passed!',
              stderr: ''
            } 
          });
        } else {
          const errors = [
            'Wrong Answer: Test case 2 failed\nExpected: [1,2]\nGot: [2,1]',
            'Runtime Error: Line 5: Cannot read property of undefined',
            'Compilation Error: Syntax error at line 8',
            'Wrong Answer: Expected output "5", got "3"'
          ];
          const randomError = errors[Math.floor(Math.random() * errors.length)];
          addNotification(`Exercise failed`, 'error');
          resolve({ 
            success: true,
            data: {
              success: false, 
              message: randomError,
              stdout: '',
              stderr: 'Test execution failed'
            }
          });
        }
      }, 1500); // Simulate processing time
    });
  };

  // Reload code stub when language or problem changes
  useEffect(() => {
    const loadCodeForLanguage = async () => {
      if (!selectedProblemId || !selectedProblemTitle) return;
      
      try {
        const { mockProblemLanguageDetails } = await import('@/lib/mockCodeBattleData');
        const normalizedLang = language === 'go' ? 'Golang' : 
                              language === 'python' ? 'Python' : 'Javascript';
        const problemDetails = mockProblemLanguageDetails[selectedProblemId]?.[normalizedLang];
        
        if (problemDetails) {
          setCode(problemDetails.SolutionStub);
          addNotification(`Loaded ${selectedProblemTitle} - ${normalizedLang}`);
        } else {
          setCode('// Start coding here\n// Solution stub not available for this problem/language combination');
          addNotification(`No ${normalizedLang} template for ${selectedProblemTitle}`, 'error');
        }
      } catch (error) {
        console.error('Error loading code for language:', error);
        setCode('// Start coding here');
        addNotification('Error loading problem template', 'error');
      }
    };

    loadCodeForLanguage();
  }, [language, selectedProblemId, selectedProblemTitle]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-10 pb-24">
      <section className="relative overflow-hidden rounded-4xl border border-[#f5c16c]/20 bg-linear-to-br from-[#2c1712]/88 via-[#1a0d0a]/94 to-[#0b0504]/98 p-8 shadow-[0_30px_85px_rgba(52,18,9,0.65)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.4),transparent_68%)]" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d23187]/40 bg-[#d23187]/15 px-4 py-2 text-xs uppercase tracking-[0.35em] text-[#f9d9eb]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#f5c16c]" />
              Arena Link Stable
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-white">CodeBattle Arena</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/70">
                Queue into procedurally generated challenges, duel other rogues in real-time brackets, and
                refine your spellcraft with focused drills in the practice sanctum.
              </p>
            </div>
          </div>
          <div className="grid gap-3 text-xs uppercase tracking-[0.35em] text-foreground/60 sm:grid-cols-2">
            {[{
              label: 'Battle Rating',
              value: '1,482',
            }, {
              label: 'Active Rooms',
              value: selectedEventId ? 'Live' : 'Awaiting',
            }, {
              label: 'Preferred Language',
              value: language.toUpperCase(),
            }, {
              label: 'Notifications',
              value: notifications.length,
            }].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-[#f5c16c]/25 bg-[#d23187]/10 px-5 py-4">
                <p className="text-[11px] text-foreground/50">{stat.label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Tabs defaultValue="battle" className="w-full">
        <TabsList className="relative mx-auto grid w-full max-w-xl grid-cols-2 rounded-full border border-[#f5c16c]/25 bg-[#140807]/80 p-1">
          <TabsTrigger
            value="battle"
            className="rounded-full text-xs uppercase tracking-[0.35em] text-foreground/60 data-[state=active]:bg-linear-to-r data-[state=active]:from-[#d23187] data-[state=active]:via-[#f5c16c] data-[state=active]:to-[#f5c16c] data-[state=active]:text-[#2b130f]"
          >
            Battle Arena
          </TabsTrigger>
          <TabsTrigger
            value="practice"
            className="rounded-full text-xs uppercase tracking-[0.35em] text-foreground/60 data-[state=active]:bg-linear-to-r data-[state=active]:from-[#f5c16c] data-[state=active]:via-[#d23187] data-[state=active]:to-[#f38f5e] data-[state=active]:text-[#2b130f]"
          >
            Practice Sanctum
          </TabsTrigger>
        </TabsList>

        <TabsContent value="battle" className="mt-8 space-y-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <EventsList
              apiBaseUrl={API_BASE_URL!}
              onEventSelect={handleEventSelect}
              selectedEventId={selectedEventId}
            />
            <RoomsList
              apiBaseUrl={API_BASE_URL!}
              eventId={selectedEventId}
              onRoomSelect={handleRoomSelect}
              selectedRoomId={selectedRoomId}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Leaderboard
              apiBaseUrl={API_BASE_URL!}
              eventId={selectedEventId}
              roomId={selectedRoomId}
              eventSourceRef={eventSourceRef}
            />
            <ProblemsList
              apiBaseUrl={API_BASE_URL!}
              eventId={selectedEventId}
              roomId={selectedRoomId}
              onProblemSelect={handleProblemSelect}
              selectedProblemId={selectedProblemId}
            />
          </div>

          {selectedProblemId && (
            <div className="rounded-[28px] border border-[#f5c16c]/22 bg-linear-to-br from-[#21110d]/88 via-[#140908]/94 to-[#070304]/98 p-6 shadow-[0_24px_70px_rgba(45,15,9,0.5)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">Current Duel</p>
                  <h2 className="text-2xl font-semibold text-white">{selectedProblemTitle}</h2>
                </div>
                <div className="rounded-full border border-[#d23187]/35 bg-[#d23187]/15 px-4 py-2 text-xs uppercase tracking-[0.35em] text-[#f9d9eb]">
                  {language.toUpperCase()}
                </div>
              </div>
              <CodeEditor
                code={code}
                setCode={setCode}
                language={language}
                setLanguage={setLanguage}
                onSubmit={handleSubmit}
                submissionResult={submissionResult}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="practice" className="mt-8 space-y-8">
          <ExercisesList apiBaseUrl={API_BASE_URL!} onSubmit={handleExerciseSubmit} />
        </TabsContent>
      </Tabs>

      <Notifications notifications={notifications} />
    </div>
  );
}
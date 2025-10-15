"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EventsList from './EventsList';
import RoomsList from './RoomsList';
import Leaderboard from './Leaderboard';
import ProblemsList from './ProblemsList';
import CodeEditor from './CodeEditor';
import ExercisesList from './ExercisesList';
import Notifications from './Notifications';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
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
    console.log('handleProblemSelect called:', { problemId, title, language });
    setSelectedProblemId(problemId);
    setSelectedProblemTitle(title);
    setSubmissionResult('');
    
    // Immediately load the code stub
    try {
      const { mockProblemLanguageDetails } = await import('@/lib/mockCodeBattleData');
      const normalizedLang = language === 'go' ? 'Golang' : 
                            language === 'python' ? 'Python' : 'Javascript';
      const problemDetails = mockProblemLanguageDetails[problemId]?.[normalizedLang];
      
      console.log('Problem details found:', { problemDetails: !!problemDetails, normalizedLang });
      
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
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold font-heading text-accent">RogueLearn CodeBattle</h1>
      </div>

        <Tabs defaultValue="battle" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="battle">Battle Arena</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
          </TabsList>

          <TabsContent value="battle" className="space-y-6 mt-6">
            {/* Events and Rooms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EventsList 
                apiBaseUrl={API_BASE_URL}
                onEventSelect={handleEventSelect}
                selectedEventId={selectedEventId}
              />
              <RoomsList 
                apiBaseUrl={API_BASE_URL}
                eventId={selectedEventId}
                onRoomSelect={handleRoomSelect}
                selectedRoomId={selectedRoomId}
              />
            </div>

            {/* Leaderboard and Problems */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Leaderboard 
                apiBaseUrl={API_BASE_URL}
                eventId={selectedEventId}
                roomId={selectedRoomId}
                eventSourceRef={eventSourceRef}
              />
              <ProblemsList 
                apiBaseUrl={API_BASE_URL}
                eventId={selectedEventId}
                roomId={selectedRoomId}
                onProblemSelect={handleProblemSelect}
                selectedProblemId={selectedProblemId}
              />
            </div>

            {/* Code Editor */}
            {selectedProblemId && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-accent">Solving: {selectedProblemTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CodeEditor 
                    code={code}
                    setCode={setCode}
                    language={language}
                    setLanguage={setLanguage}
                    onSubmit={handleSubmit}
                    submissionResult={submissionResult}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="practice" className="space-y-6 mt-6">
            <ExercisesList 
              apiBaseUrl={API_BASE_URL}
              onSubmit={handleExerciseSubmit}
            />
          </TabsContent>
        </Tabs>

      {/* Notifications */}
      <Notifications notifications={notifications} />
    </div>
  );
}

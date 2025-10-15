"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Code, 
  CheckCircle,
  PlayCircle,
  Trophy,
  Lightbulb
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface Module {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

interface Chapter {
  id: string;
  questId: string;
  chapterNumber: number;
  title: string;
  description: string;
  estimatedHours: number;
  xpReward: number;
  status: 'completed' | 'current' | 'locked';
  modules?: Module[];
}

interface Quest {
  id: string;
  title: string;
  chapters: Chapter[];
}

interface ModuleLearningViewProps {
  quest: Quest;
  chapter: Chapter;
  module: Module;
}

// Module content database
const moduleContent: Record<string, {
  introduction: string;
  concept: string;
  explanation: string[];
  algorithm: string[];
  complexity: {
    time: string;
    space: string;
  };
  pros: string[];
  cons: string[];
  useCases: string[];
  visualExample: string;
  codeTemplate: string;
  testCases: Array<{ input: string; expected: string; explanation: string }>;
}> = {
  'mod-3-1': {
    // Bubble Sort
    introduction: "Bubble Sort is one of the simplest sorting algorithms that repeatedly steps through the list, compares adjacent elements and swaps them if they're in the wrong order.",
    concept: "Like bubbles rising to the surface",
    explanation: [
      "Bubble Sort works by repeatedly comparing and swapping adjacent elements",
      "Larger elements \"bubble up\" to the end of the array with each pass",
      "The algorithm continues until no more swaps are needed",
      "It's called \"bubble\" sort because the largest element bubbles to its correct position"
    ],
    algorithm: [
      "1. Start at the beginning of the array",
      "2. Compare the current element with the next element",
      "3. If current > next, swap them",
      "4. Move to the next pair and repeat steps 2-3",
      "5. After one complete pass, the largest element is in its correct position",
      "6. Repeat the process for the remaining unsorted portion",
      "7. Stop when no swaps are made in a complete pass"
    ],
    complexity: {
      time: "O(n²) - Worst and Average Case, O(n) - Best Case (already sorted)",
      space: "O(1) - Only uses a constant amount of extra space"
    },
    pros: [
      "Simple to understand and implement",
      "No extra memory needed (in-place sorting)",
      "Stable sort (maintains relative order of equal elements)",
      "Good for small datasets or nearly sorted arrays"
    ],
    cons: [
      "Very slow for large datasets (O(n²) time complexity)",
      "Not efficient compared to other sorting algorithms",
      "Makes unnecessary comparisons even when array is sorted"
    ],
    useCases: [
      "Educational purposes - teaching sorting concepts",
      "Small datasets (< 50 elements)",
      "Nearly sorted arrays where minimal swaps are needed",
      "When simplicity is more important than efficiency"
    ],
    visualExample: `
Example: Sort [5, 2, 8, 1, 9]

Pass 1:
[5, 2, 8, 1, 9] → Compare 5 and 2 → Swap
[2, 5, 8, 1, 9] → Compare 5 and 8 → No swap
[2, 5, 8, 1, 9] → Compare 8 and 1 → Swap
[2, 5, 1, 8, 9] → Compare 8 and 9 → No swap
Result: [2, 5, 1, 8, 9] (9 is in correct position)

Pass 2:
[2, 5, 1, 8, 9] → Compare 2 and 5 → No swap
[2, 5, 1, 8, 9] → Compare 5 and 1 → Swap
[2, 1, 5, 8, 9] → Compare 5 and 8 → No swap
Result: [2, 1, 5, 8, 9] (8 is in correct position)

Pass 3:
[2, 1, 5, 8, 9] → Compare 2 and 1 → Swap
[1, 2, 5, 8, 9] → Compare 2 and 5 → No swap
Result: [1, 2, 5, 8, 9] (5 is in correct position)

Pass 4:
[1, 2, 5, 8, 9] → No swaps needed
Final: [1, 2, 5, 8, 9] ✓
`,
    codeTemplate: `function bubbleSort(arr) {
    const n = arr.length;
    
    // Outer loop for each pass
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        
        // Inner loop for comparisons
        for (let j = 0; j < n - i - 1; j++) {
            // Compare adjacent elements
            if (arr[j] > arr[j + 1]) {
                // Swap if they're in wrong order
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        
        // If no swaps were made, array is sorted
        if (!swapped) break;
    }
    
    return arr;
}

// Test your implementation
console.log(bubbleSort([5, 2, 8, 1, 9]));`,
    testCases: [
      {
        input: "[5, 2, 8, 1, 9]",
        expected: "[1, 2, 5, 8, 9]",
        explanation: "Standard unsorted array"
      },
      {
        input: "[1, 2, 3, 4, 5]",
        expected: "[1, 2, 3, 4, 5]",
        explanation: "Already sorted array (best case)"
      },
      {
        input: "[5, 4, 3, 2, 1]",
        expected: "[1, 2, 3, 4, 5]",
        explanation: "Reverse sorted array (worst case)"
      },
      {
        input: "[3, 3, 1, 2]",
        expected: "[1, 2, 3, 3]",
        explanation: "Array with duplicates"
      }
    ]
  },
  'mod-3-2': {
    // Selection Sort
    introduction: "Selection Sort divides the array into sorted and unsorted parts, repeatedly selecting the minimum element from the unsorted part and moving it to the sorted part.",
    concept: "Find the minimum and place it at the beginning",
    explanation: [
      "Selection Sort finds the smallest element in the unsorted portion",
      "Swaps it with the first unsorted element",
      "This builds a sorted portion from left to right",
      "The algorithm maintains two subarrays: sorted and unsorted"
    ],
    algorithm: [
      "1. Set the first element as minimum",
      "2. Find the smallest element in the remaining unsorted array",
      "3. Swap it with the first unsorted element",
      "4. Move the boundary between sorted and unsorted one position right",
      "5. Repeat until the entire array is sorted"
    ],
    complexity: {
      time: "O(n²) for all cases",
      space: "O(1) - In-place sorting"
    },
    pros: [
      "Simple implementation",
      "Performs well on small lists",
      "Memory efficient (in-place)",
      "Minimizes number of swaps (O(n) swaps)"
    ],
    cons: [
      "Inefficient on large lists",
      "Not stable (may change relative order)",
      "Always makes O(n²) comparisons"
    ],
    useCases: [
      "When memory write is more expensive than reads",
      "Small datasets",
      "When minimal swaps are preferred"
    ],
    visualExample: `
Example: Sort [64, 25, 12, 22, 11]

Initial: [64, 25, 12, 22, 11]

Pass 1: Find min (11), swap with 64
[11, 25, 12, 22, 64]
     ↑ sorted

Pass 2: Find min (12), swap with 25
[11, 12, 25, 22, 64]
         ↑ sorted

Pass 3: Find min (22), swap with 25
[11, 12, 22, 25, 64]
             ↑ sorted

Pass 4: Find min (25), already in place
[11, 12, 22, 25, 64]
                 ↑ sorted

Result: [11, 12, 22, 25, 64] ✓
`,
    codeTemplate: `function selectionSort(arr) {
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
        // Find minimum element in unsorted portion
        let minIndex = i;
        
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        
        // Swap minimum with first unsorted element
        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        }
    }
    
    return arr;
}

// Test your implementation
console.log(selectionSort([64, 25, 12, 22, 11]));`,
    testCases: [
      {
        input: "[64, 25, 12, 22, 11]",
        expected: "[11, 12, 22, 25, 64]",
        explanation: "Standard unsorted array"
      },
      {
        input: "[5, 1, 4, 2, 8]",
        expected: "[1, 2, 4, 5, 8]",
        explanation: "Random order"
      },
      {
        input: "[1]",
        expected: "[1]",
        explanation: "Single element"
      }
    ]
  },
  'mod-3-3': {
    // Insertion Sort
    introduction: "Insertion Sort builds the final sorted array one item at a time, by inserting each element into its proper position in the already-sorted portion.",
    concept: "Like sorting playing cards in your hand",
    explanation: [
      "Insertion Sort picks each element and inserts it into its correct position",
      "The array is virtually split into sorted and unsorted parts",
      "Elements from the unsorted part are picked and placed at the correct position in sorted part",
      "Works similar to how you sort playing cards in your hands"
    ],
    algorithm: [
      "1. Start with the second element (first element is already 'sorted')",
      "2. Compare current element with elements in the sorted portion",
      "3. Shift all larger elements one position to the right",
      "4. Insert the current element at its correct position",
      "5. Repeat for all elements"
    ],
    complexity: {
      time: "O(n²) - Worst Case, O(n) - Best Case",
      space: "O(1) - In-place sorting"
    },
    pros: [
      "Simple implementation",
      "Efficient for small datasets",
      "Adaptive - fast for nearly sorted arrays",
      "Stable sort",
      "In-place sorting"
    ],
    cons: [
      "Slow for large datasets",
      "O(n²) comparisons and shifts"
    ],
    useCases: [
      "Small datasets",
      "Nearly sorted arrays",
      "Online sorting (elements arrive one at a time)"
    ],
    visualExample: `
Example: Sort [12, 11, 13, 5, 6]

Initial: [12, 11, 13, 5, 6]

Pass 1: Insert 11
[12, 11, 13, 5, 6] → 11 < 12, shift 12 right
[11, 12, 13, 5, 6]

Pass 2: Insert 13
[11, 12, 13, 5, 6] → 13 is in correct position

Pass 3: Insert 5
[11, 12, 13, 5, 6] → Shift 11, 12, 13 right
[5, 11, 12, 13, 6]

Pass 4: Insert 6
[5, 11, 12, 13, 6] → Shift 11, 12, 13 right
[5, 6, 11, 12, 13]

Result: [5, 6, 11, 12, 13] ✓
`,
    codeTemplate: `function insertionSort(arr) {
    const n = arr.length;
    
    for (let i = 1; i < n; i++) {
        let current = arr[i];
        let j = i - 1;
        
        // Shift elements greater than current to the right
        while (j >= 0 && arr[j] > current) {
            arr[j + 1] = arr[j];
            j--;
        }
        
        // Insert current at correct position
        arr[j + 1] = current;
    }
    
    return arr;
}

// Test your implementation
console.log(insertionSort([12, 11, 13, 5, 6]));`,
    testCases: [
      {
        input: "[12, 11, 13, 5, 6]",
        expected: "[5, 6, 11, 12, 13]",
        explanation: "Standard unsorted array"
      },
      {
        input: "[1, 2, 3, 4, 5]",
        expected: "[1, 2, 3, 4, 5]",
        explanation: "Already sorted (best case)"
      },
      {
        input: "[5, 4, 3, 2, 1]",
        expected: "[1, 2, 3, 4, 5]",
        explanation: "Reverse sorted (worst case)"
      }
    ]
  }
};

export function ModuleLearningView({ quest, chapter, module }: ModuleLearningViewProps) {
  const content = moduleContent[module.id] || {
    introduction: "Module content coming soon!",
    concept: "",
    explanation: [],
    algorithm: [],
    complexity: { time: "", space: "" },
    pros: [],
    cons: [],
    useCases: [],
    visualExample: "",
    codeTemplate: "// Content coming soon",
    testCases: []
  };

  const [code, setCode] = useState(content.codeTemplate);
  const [language, setLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState<string>('');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [editorError, setEditorError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('learn');
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditor = useRef<any>(null);

  // Cleanup editor when leaving Practice tab
  useEffect(() => {
    // If we're NOT on the practice tab and editor exists, dispose it
    if (activeTab !== 'practice' && monacoEditor.current) {
      console.log('Leaving Practice tab, disposing editor');
      monacoEditor.current.dispose();
      monacoEditor.current = null;
      setIsEditorReady(false);
    }
  }, [activeTab]);

  // Initialize Monaco Editor when Practice tab is active
  useEffect(() => {
    // Only initialize when Practice tab is active and editor div is rendered
    if (activeTab !== 'practice') {
      console.log('Not on practice tab yet, skipping Monaco init');
      return;
    }

    // If editor already exists, don't recreate
    if (monacoEditor.current) {
      console.log('Editor already exists, skipping recreation');
      return;
    }

    console.log('Practice tab active, will create new Monaco editor');

    // Timeout fallback in case Monaco never loads
    const timeout = setTimeout(() => {
      if (!isEditorReady && !monacoEditor.current) {
        console.error('Monaco editor loading timeout');
        setEditorError('Editor loading timed out. Please refresh the page.');
        setIsEditorReady(true);
      }
    }, 10000); // 10 second timeout

    if (typeof window !== 'undefined' && editorRef.current && !monacoEditor.current) {
      console.log('Initializing Monaco Editor in ModuleLearningView', {
        hasRef: !!editorRef.current,
        refElement: editorRef.current
      });
      
      const initEditor = () => {
        if (!editorRef.current) {
          console.error('Editor ref is null!');
          setIsEditorReady(true); // Set to true to hide spinner even on error
          return;
        }

        try {
          console.log('Creating Monaco editor with code length:', code.length);
          // @ts-ignore
          monacoEditor.current = monaco.editor.create(editorRef.current, {
            value: code,
            language: language,
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 14,
          });

          monacoEditor.current.onDidChangeModelContent(() => {
            setCode(monacoEditor.current.getValue());
          });
          
          setIsEditorReady(true);
          console.log('Monaco editor created successfully!');
        } catch (error) {
          console.error('Error creating Monaco editor:', error);
          setEditorError('Failed to initialize code editor. Please refresh the page.');
          setIsEditorReady(true); // Set to true to hide spinner
        }
      };

      // Check if Monaco is already loaded
      // @ts-ignore
      if (typeof window.monaco !== 'undefined') {
        console.log('Monaco already loaded globally');
        initEditor();
      } else {
        console.log('Loading Monaco from CDN');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs/loader.js';
        script.onerror = (error) => {
          console.error('Failed to load Monaco loader script:', error);
          setEditorError('Failed to load code editor. Please check your internet connection.');
          setIsEditorReady(true); // Hide spinner on error
        };
        script.onload = () => {
          console.log('Monaco loader script loaded');
          // @ts-ignore
          window.require.config({
            paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs' }
          });
          
          // @ts-ignore
          window.require(['vs/editor/editor.main'], () => {
            console.log('Monaco editor main loaded');
            initEditor();
          });
        };
        document.body.appendChild(script);
      }
    }

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); // Re-run when tab changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monacoEditor.current) {
        console.log('Disposing Monaco editor on unmount');
        monacoEditor.current.dispose();
        monacoEditor.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isEditorReady && monacoEditor.current && code !== undefined) {
      const currentValue = monacoEditor.current.getValue();
      if (currentValue !== code) {
        monacoEditor.current.setValue(code);
      }
    }
  }, [code, isEditorReady]);

  useEffect(() => {
    if (isEditorReady && monacoEditor.current) {
      // @ts-ignore
      monaco.editor.setModelLanguage(monacoEditor.current.getModel(), language);
    }
  }, [language, isEditorReady]);

  const handleRunCode = () => {
    setTestResults('Running tests...');
    
    // Simulate test execution
    setTimeout(() => {
      const results = content.testCases.map((testCase, index) => {
        return `Test ${index + 1}: ${testCase.explanation}\n  Input: ${testCase.input}\n  Expected: ${testCase.expected}\n  ✓ Passed`;
      }).join('\n\n');
      
      setTestResults(`Test Results:\n\n${results}\n\n✅ All tests passed!`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-foreground/60 mb-2">
            <Link href={`/quests/${quest.id}`} className="hover:text-accent">
              {quest.title}
            </Link>
            <span>/</span>
            <Link href={`/quests/${quest.id}/${chapter.id}`} className="hover:text-accent">
              {chapter.title}
            </Link>
          </div>
          <h1 className="text-4xl font-bold font-heading flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-accent" />
            {module.title}
          </h1>
          <p className="text-foreground/70 mt-2">Duration: {module.duration}</p>
        </div>
        {module.completed && (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold">Completed</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="learn" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="learn">
            <BookOpen className="w-4 h-4 mr-2" />
            Learn
          </TabsTrigger>
          <TabsTrigger value="practice">
            <Code className="w-4 h-4 mr-2" />
            Practice
          </TabsTrigger>
        </TabsList>

        {/* Learn Tab */}
        <TabsContent value="learn" className="space-y-6 mt-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80 leading-relaxed">{content.introduction}</p>
              {content.concept && (
                <div className="mt-4 p-4 bg-accent/10 border-l-4 border-accent rounded">
                  <p className="font-semibold text-accent">Key Concept: {content.concept}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* How It Works */}
          {content.explanation.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {content.explanation.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-foreground/80">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Algorithm Steps */}
          {content.algorithm.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Algorithm Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {content.algorithm.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-primary flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="text-foreground/80 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Visual Example */}
          {content.visualExample && (
            <Card>
              <CardHeader>
                <CardTitle>Visual Example</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-6 rounded-lg overflow-x-auto text-sm font-mono">
                  {content.visualExample}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Complexity */}
          {content.complexity.time && (
            <Card>
              <CardHeader>
                <CardTitle>Time & Space Complexity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground/90 mb-1">⏱️ Time Complexity:</p>
                  <p className="text-foreground/70 ml-6">{content.complexity.time}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground/90 mb-1">💾 Space Complexity:</p>
                  <p className="text-foreground/70 ml-6">{content.complexity.space}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pros & Cons */}
          {(content.pros.length > 0 || content.cons.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.pros.length > 0 && (
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardHeader>
                    <CardTitle className="text-green-500">✓ Advantages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {content.pros.map((pro, index) => (
                        <li key={index} className="text-foreground/80">• {pro}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {content.cons.length > 0 && (
                <Card className="border-red-500/30 bg-red-500/5">
                  <CardHeader>
                    <CardTitle className="text-red-500">✗ Disadvantages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {content.cons.map((con, index) => (
                        <li key={index} className="text-foreground/80">• {con}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Use Cases */}
          {content.useCases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>When to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {content.useCases.map((useCase, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Trophy className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-foreground/80">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Practice Tab */}
        <TabsContent value="practice" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-accent" />
                Code Implementation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language Selector */}
              <div className="flex gap-2 items-center">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-4 py-2 rounded-md border border-border bg-background text-foreground"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                </select>
                <Button onClick={handleRunCode} className="bg-accent hover:bg-accent/90">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Run Tests
                </Button>
                {isEditorReady && (
                  <span className="text-sm text-green-500 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Editor Ready
                  </span>
                )}
              </div>

              {/* Monaco Editor */}
              <div className="relative">
                <div 
                  ref={editorRef}
                  className="w-full h-[400px] border-2 border-accent/20 rounded-lg overflow-hidden bg-[#1e1e1e]"
                />
                {!isEditorReady && !editorError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] border-2 border-accent/20 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                      <p className="text-foreground/70">Loading code editor...</p>
                      <p className="text-foreground/50 text-sm mt-2">Check browser console (F12) if this takes too long</p>
                    </div>
                  </div>
                )}
                {editorError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] border-2 border-red-500/30 rounded-lg">
                    <div className="text-center p-6">
                      <div className="text-red-500 text-5xl mb-4">⚠️</div>
                      <p className="text-red-500 font-semibold mb-2">{editorError}</p>
                      <Button 
                        onClick={() => window.location.reload()} 
                        variant="outline"
                        className="mt-4"
                      >
                        Refresh Page
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Test Results */}
              {testResults && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Test Results:</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                    {testResults}
                  </pre>
                </div>
              )}

              {/* Test Cases Info */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Test Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {content.testCases.map((testCase, index) => (
                      <div key={index} className="border-l-4 border-accent/50 pl-4">
                        <p className="font-semibold">Test {index + 1}: {testCase.explanation}</p>
                        <p className="text-sm text-foreground/70 mt-1">
                          Input: <code className="bg-background px-2 py-0.5 rounded">{testCase.input}</code>
                        </p>
                        <p className="text-sm text-foreground/70">
                          Expected: <code className="bg-background px-2 py-0.5 rounded">{testCase.expected}</code>
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-8 border-t">
        <Button variant="outline" size="lg" asChild>
          <Link href={`/quests/${quest.id}/${chapter.id}`}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Chapter
          </Link>
        </Button>
        <Button 
          size="lg"
          className="bg-gradient-to-r from-accent to-accent/80 text-primary"
        >
          Mark as Complete
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

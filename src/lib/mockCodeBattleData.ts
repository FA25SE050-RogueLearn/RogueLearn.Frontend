/**
 * Mock data for Code Battle feature
 * Based on the backend API structure from RogueLearn.CodeBattle
 */

// Event Types
export type EventType = 'code_battle' | 'workshop' | 'seminar' | 'social';

export type SubmissionStatus = 
  | 'pending' 
  | 'accepted' 
  | 'wrong_answer' 
  | 'limit_exceed' 
  | 'runtime_error' 
  | 'compilation_error';

// Event Interface
export interface Event {
  ID: string;
  Title: string;
  Description: string;
  Type: EventType;
  StartedDate: string;
  EndDate: string;
}

// Room Interface
export interface Room {
  ID: string;
  EventID: string;
  Name: string;
  Description: string;
  CreatedDate: string;
}

// Code Problem Interface
export interface CodeProblem {
  ID: string;
  Title: string;
  ProblemStatement: string;
  Difficulty: number; // 1-5 scale
  CreatedAt: string;
}

// Event Code Problem (problem in an event with score)
export interface EventCodeProblem {
  EventID: string;
  CodeProblemID: string;
  Title: string;
  Difficulty: number;
  Score: number;
}

// Language Interface
export interface Language {
  ID: string;
  Name: string;
  CompileCmd: string;
  RunCmd: string;
  TempFileDir: string;
  TempFileName: string;
}

// Problem Language Detail
export interface ProblemLanguageDetail {
  CodeProblemID: string;
  LanguageID: string;
  SolutionStub: string;
  DriverCode: string;
  TimeConstraintMs: number;
  SpaceConstraintMb: number;
}

// Leaderboard Entry
export interface LeaderboardEntry {
  player_name: string;
  score: number;
  place: number;
}

// Submission
export interface Submission {
  ID: string;
  UserID: string;
  CodeProblemID: string;
  LanguageID: string;
  RoomID: string;
  CodeSubmitted: string;
  Status: SubmissionStatus;
  ExecutionTimeMs?: number;
  SubmittedAt: string;
}

// Mock Events
export const mockEvents: Event[] = [
  {
    ID: '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90',
    Title: 'Spring Code Battle 2025',
    Description: 'Test your algorithmic skills in this exciting spring competition! Compete against other guilds for glory and rewards.',
    Type: 'code_battle',
    StartedDate: '2025-03-15T09:00:00Z',
    EndDate: '2025-03-15T17:00:00Z',
  },
  {
    ID: '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f90a1',
    Title: 'Advanced Algorithms Workshop',
    Description: 'Join us for an intensive workshop on advanced data structures and algorithms. Perfect for intermediate to advanced programmers.',
    Type: 'code_battle',
    StartedDate: '2025-04-10T10:00:00Z',
    EndDate: '2025-04-10T16:00:00Z',
  },
  {
    ID: '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f90a1b2',
    Title: 'Summer Coding Championship',
    Description: 'The biggest coding event of the season! Solve challenging problems and climb the leaderboard.',
    Type: 'code_battle',
    StartedDate: '2025-06-20T08:00:00Z',
    EndDate: '2025-06-20T20:00:00Z',
  },
];

// Mock Rooms
export const mockRooms: Room[] = [
  {
    ID: '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90',
    EventID: '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90',
    Name: 'Beginner Arena',
    Description: 'Perfect for those new to competitive programming. Solve fundamental problems and build your confidence.',
    CreatedDate: '2025-03-01T12:00:00Z',
  },
  {
    ID: '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f90a1',
    EventID: '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90',
    Name: 'Advanced Lobby',
    Description: 'For experienced programmers seeking a real challenge. Complex algorithms and optimizations required.',
    CreatedDate: '2025-03-01T12:00:00Z',
  },
  {
    ID: '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f90a1b2',
    EventID: '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f90a1',
    Name: 'Elite Challenge',
    Description: 'The ultimate test of programming prowess. Only the best will succeed here.',
    CreatedDate: '2025-04-01T12:00:00Z',
  },
];

// Mock Code Problems (for exercises/practice mode)
export const mockCodeProblems: CodeProblem[] = [
  {
    ID: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    Title: 'Two Sum',
    ProblemStatement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    Difficulty: 1,
    CreatedAt: '2025-01-15T10:00:00Z',
  },
  {
    ID: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    Title: 'Reverse Linked List',
    ProblemStatement: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    Difficulty: 2,
    CreatedAt: '2025-01-16T10:00:00Z',
  },
  {
    ID: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
    Title: 'Valid Parentheses',
    ProblemStatement: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.',
    Difficulty: 1,
    CreatedAt: '2025-01-17T10:00:00Z',
  },
  {
    ID: '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90',
    Title: 'Binary Tree Level Order Traversal',
    ProblemStatement: 'Given the root of a binary tree, return the level order traversal of its nodes\' values. (i.e., from left to right, level by level).',
    Difficulty: 2,
    CreatedAt: '2025-01-18T10:00:00Z',
  },
  {
    ID: '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f90a1',
    Title: 'Longest Substring Without Repeating Characters',
    ProblemStatement: 'Given a string s, find the length of the longest substring without repeating characters.',
    Difficulty: 3,
    CreatedAt: '2025-01-19T10:00:00Z',
  },
  {
    ID: '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f90a1b2',
    Title: 'Merge K Sorted Lists',
    ProblemStatement: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    Difficulty: 4,
    CreatedAt: '2025-01-20T10:00:00Z',
  },
  {
    ID: '7a8b9c0d-1e2f-3a4b-5c6d-7e8f90a1b2c3',
    Title: 'Median of Two Sorted Arrays',
    ProblemStatement: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
    Difficulty: 5,
    CreatedAt: '2025-01-21T10:00:00Z',
  },
];

// Mock Event Code Problems (problems assigned to events with scores)
export const mockEventCodeProblems: Record<string, EventCodeProblem[]> = {
  '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90': [
    {
      EventID: '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90',
      CodeProblemID: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
      Title: 'Two Sum',
      Difficulty: 1,
      Score: 100,
    },
    {
      EventID: '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90',
      CodeProblemID: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
      Title: 'Valid Parentheses',
      Difficulty: 1,
      Score: 150,
    },
    {
      EventID: '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90',
      CodeProblemID: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
      Title: 'Reverse Linked List',
      Difficulty: 2,
      Score: 200,
    },
  ],
  '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f90a1': [
    {
      EventID: '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f90a1',
      CodeProblemID: '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90',
      Title: 'Binary Tree Level Order Traversal',
      Difficulty: 2,
      Score: 250,
    },
    {
      EventID: '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f90a1',
      CodeProblemID: '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f90a1',
      Title: 'Longest Substring Without Repeating Characters',
      Difficulty: 3,
      Score: 300,
    },
  ],
};

// Mock Languages
export const mockLanguages: Language[] = [
  {
    ID: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    Name: 'Golang',
    CompileCmd: 'go build -o /app/temp/exe /app/temp/golang/code.go',
    RunCmd: '/app/temp/exe',
    TempFileDir: '/app/temp/golang',
    TempFileName: 'code.go',
  },
  {
    ID: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    Name: 'Python',
    CompileCmd: '',
    RunCmd: 'python3 /app/temp/python/code.py',
    TempFileDir: '/app/temp/python',
    TempFileName: 'code.py',
  },
  {
    ID: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    Name: 'Javascript',
    CompileCmd: '',
    RunCmd: 'node /app/temp/js/code.js',
    TempFileDir: '/app/temp/js',
    TempFileName: 'code.js',
  },
];

// Mock Problem Language Details (solution stubs and driver code)
export const mockProblemLanguageDetails: Record<string, Record<string, ProblemLanguageDetail>> = {
  // Two Sum problem
  '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d': {
    'Golang': {
      CodeProblemID: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
      LanguageID: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      SolutionStub: `func twoSum(nums []int, target int) []int {
    // Write your solution here
    
}`,
      DriverCode: `package main

import (
    "fmt"
    "encoding/json"
    "os"
)

// IMPORTS_HERE

// USER_CODE_HERE

func main() {
    var nums []int
    var target int
    
    decoder := json.NewDecoder(os.Stdin)
    decoder.Decode(&nums)
    decoder.Decode(&target)
    
    result := twoSum(nums, target)
    output, _ := json.Marshal(result)
    fmt.Println(string(output))
}`,
      TimeConstraintMs: 1000,
      SpaceConstraintMb: 128,
    },
    'Python': {
      CodeProblemID: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
      LanguageID: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      SolutionStub: `def two_sum(nums, target):
    # Write your solution here
    pass`,
      DriverCode: `import json
import sys

# USER_CODE_HERE

if __name__ == "__main__":
    lines = sys.stdin.read().strip().split('\\n')
    nums = json.loads(lines[0])
    target = json.loads(lines[1])
    
    result = two_sum(nums, target)
    print(json.dumps(result))`,
      TimeConstraintMs: 1000,
      SpaceConstraintMb: 128,
    },
    'Javascript': {
      CodeProblemID: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
      LanguageID: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
      SolutionStub: `function twoSum(nums, target) {
    // Write your solution here
    
}`,
      DriverCode: `// USER_CODE_HERE

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const lines = [];
rl.on('line', (line) => {
    lines.push(line);
});

rl.on('close', () => {
    const nums = JSON.parse(lines[0]);
    const target = JSON.parse(lines[1]);
    
    const result = twoSum(nums, target);
    console.log(JSON.stringify(result));
});`,
      TimeConstraintMs: 1000,
      SpaceConstraintMb: 128,
    },
  },
  // Valid Parentheses problem
  '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f': {
    'Golang': {
      CodeProblemID: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
      LanguageID: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      SolutionStub: `func isValid(s string) bool {
    // Write your solution here
    
}`,
      DriverCode: `package main

import (
    "fmt"
    "bufio"
    "os"
    "strings"
)

// IMPORTS_HERE

// USER_CODE_HERE

func main() {
    scanner := bufio.NewScanner(os.Stdin)
    scanner.Scan()
    s := strings.TrimSpace(scanner.Text())
    
    result := isValid(s)
    fmt.Println(result)
}`,
      TimeConstraintMs: 1000,
      SpaceConstraintMb: 128,
    },
    'Python': {
      CodeProblemID: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
      LanguageID: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      SolutionStub: `def is_valid(s):
    # Write your solution here
    pass`,
      DriverCode: `import sys

# USER_CODE_HERE

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    result = is_valid(s)
    print(result)`,
      TimeConstraintMs: 1000,
      SpaceConstraintMb: 128,
    },
    'Javascript': {
      CodeProblemID: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
      LanguageID: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
      SolutionStub: `function isValid(s) {
    // Write your solution here
    
}`,
      DriverCode: `// USER_CODE_HERE

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line) => {
    const s = line.trim();
    const result = isValid(s);
    console.log(result);
    rl.close();
});`,
      TimeConstraintMs: 1000,
      SpaceConstraintMb: 128,
    },
  },
  // Reverse Linked List problem
  '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e': {
    'Golang': {
      CodeProblemID: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
      LanguageID: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      SolutionStub: `type ListNode struct {
    Val  int
    Next *ListNode
}

func reverseList(head *ListNode) *ListNode {
    // Write your solution here
    
}`,
      DriverCode: `package main`,
      TimeConstraintMs: 1000,
      SpaceConstraintMb: 128,
    },
    'Python': {
      CodeProblemID: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
      LanguageID: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      SolutionStub: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    # Write your solution here
    pass`,
      DriverCode: `import sys`,
      TimeConstraintMs: 1000,
      SpaceConstraintMb: 128,
    },
    'Javascript': {
      CodeProblemID: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
      LanguageID: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
      SolutionStub: `class ListNode {
    constructor(val, next) {
        this.val = (val===undefined ? 0 : val);
        this.next = (next===undefined ? null : next);
    }
}

function reverseList(head) {
    // Write your solution here
    
}`,
      DriverCode: `// USER_CODE_HERE`,
      TimeConstraintMs: 1000,
      SpaceConstraintMb: 128,
    },
  },
  // Binary Tree Level Order Traversal problem
  '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90': {
    'Golang': {
      CodeProblemID: '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90',
      LanguageID: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      SolutionStub: `type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

func levelOrder(root *TreeNode) [][]int {
    // Write your solution here
    
}`,
      DriverCode: `package main`,
      TimeConstraintMs: 1000,
      SpaceConstraintMb: 128,
    },
    'Python': {
      CodeProblemID: '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90',
      LanguageID: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      SolutionStub: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def level_order(root):
    # Write your solution here
    pass`,
      DriverCode: `import sys`,
      TimeConstraintMs: 1000,
      SpaceConstraintMb: 128,
    },
    'Javascript': {
      CodeProblemID: '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90',
      LanguageID: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
      SolutionStub: `class TreeNode {
    constructor(val, left, right) {
        this.val = (val===undefined ? 0 : val);
        this.left = (left===undefined ? null : left);
        this.right = (right===undefined ? null : right);
    }
}

function levelOrder(root) {
    // Write your solution here
    
}`,
      DriverCode: `// USER_CODE_HERE`,
      TimeConstraintMs: 1000,
      SpaceConstraintMb: 128,
    },
  },
  // Longest Substring Without Repeating Characters problem
  '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f90a1': {
    'Golang': {
      CodeProblemID: '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f90a1',
      LanguageID: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      SolutionStub: `func lengthOfLongestSubstring(s string) int {
    // Write your solution here
    
}`,
      DriverCode: `package main`,
      TimeConstraintMs: 1000,
      SpaceConstraintMb: 128,
    },
    'Python': {
      CodeProblemID: '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f90a1',
      LanguageID: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      SolutionStub: `def length_of_longest_substring(s):
    # Write your solution here
    pass`,
      DriverCode: `import sys`,
      TimeConstraintMs: 1000,
      SpaceConstraintMb: 128,
    },
    'Javascript': {
      CodeProblemID: '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f90a1',
      LanguageID: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
      SolutionStub: `function lengthOfLongestSubstring(s) {
    // Write your solution here
    
}`,
      DriverCode: `// USER_CODE_HERE`,
      TimeConstraintMs: 1000,
      SpaceConstraintMb: 128,
    },
  },
  // Merge K Sorted Lists problem
  '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f90a1b2': {
    'Golang': {
      CodeProblemID: '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f90a1b2',
      LanguageID: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      SolutionStub: `type ListNode struct {
    Val  int
    Next *ListNode
}

func mergeKLists(lists []*ListNode) *ListNode {
    // Write your solution here
    
}`,
      DriverCode: `package main`,
      TimeConstraintMs: 2000,
      SpaceConstraintMb: 256,
    },
    'Python': {
      CodeProblemID: '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f90a1b2',
      LanguageID: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      SolutionStub: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def merge_k_lists(lists):
    # Write your solution here
    pass`,
      DriverCode: `import sys`,
      TimeConstraintMs: 2000,
      SpaceConstraintMb: 256,
    },
    'Javascript': {
      CodeProblemID: '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f90a1b2',
      LanguageID: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
      SolutionStub: `class ListNode {
    constructor(val, next) {
        this.val = (val===undefined ? 0 : val);
        this.next = (next===undefined ? null : next);
    }
}

function mergeKLists(lists) {
    // Write your solution here
    
}`,
      DriverCode: `// USER_CODE_HERE`,
      TimeConstraintMs: 2000,
      SpaceConstraintMb: 256,
    },
  },
  // Median of Two Sorted Arrays problem
  '7a8b9c0d-1e2f-3a4b-5c6d-7e8f90a1b2c3': {
    'Golang': {
      CodeProblemID: '7a8b9c0d-1e2f-3a4b-5c6d-7e8f90a1b2c3',
      LanguageID: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      SolutionStub: `func findMedianSortedArrays(nums1 []int, nums2 []int) float64 {
    // Write your solution here
    
}`,
      DriverCode: `package main`,
      TimeConstraintMs: 2000,
      SpaceConstraintMb: 256,
    },
    'Python': {
      CodeProblemID: '7a8b9c0d-1e2f-3a4b-5c6d-7e8f90a1b2c3',
      LanguageID: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      SolutionStub: `def find_median_sorted_arrays(nums1, nums2):
    # Write your solution here
    pass`,
      DriverCode: `import sys`,
      TimeConstraintMs: 2000,
      SpaceConstraintMb: 256,
    },
    'Javascript': {
      CodeProblemID: '7a8b9c0d-1e2f-3a4b-5c6d-7e8f90a1b2c3',
      LanguageID: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
      SolutionStub: `function findMedianSortedArrays(nums1, nums2) {
    // Write your solution here
    
}`,
      DriverCode: `// USER_CODE_HERE`,
      TimeConstraintMs: 2000,
      SpaceConstraintMb: 256,
    },
  },
};

// Mock Leaderboard Data
export const mockLeaderboards: Record<string, LeaderboardEntry[]> = {
  '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f90': [
    { player_name: 'CodeMaster', score: 450, place: 1 },
    { player_name: 'AlgoNinja', score: 400, place: 2 },
    { player_name: 'DevWarrior', score: 350, place: 3 },
    { player_name: 'ByteHunter', score: 300, place: 4 },
    { player_name: 'ScriptKiddie', score: 150, place: 5 },
  ],
  '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f90a1': [
    { player_name: 'EliteHacker', score: 550, place: 1 },
    { player_name: 'ProCoder', score: 500, place: 2 },
    { player_name: 'TechGuru', score: 450, place: 3 },
  ],
};

// Helper function to get problems by difficulty
export const getProblemsByDifficulty = (difficulty: number): CodeProblem[] => {
  return mockCodeProblems.filter(p => p.Difficulty === difficulty);
};

// Helper function to get difficulty label
export const getDifficultyLabel = (difficulty: number): string => {
  const labels: Record<number, string> = {
    1: 'Easy',
    2: 'Medium',
    3: 'Medium',
    4: 'Hard',
    5: 'Expert',
  };
  return labels[difficulty] || 'Unknown';
};

// Helper function to get difficulty color
export const getDifficultyColor = (difficulty: number): string => {
  const colors: Record<number, string> = {
    1: 'text-green-400',
    2: 'text-yellow-400',
    3: 'text-orange-400',
    4: 'text-red-400',
    5: 'text-purple-400',
  };
  return colors[difficulty] || 'text-gray-400';
};

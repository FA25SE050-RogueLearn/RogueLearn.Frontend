/**
 * Represents the structured data extracted from the FAP HTML.
 * This is returned by the backend after Transaction 1.
 */
export interface FapRecordData {
  gpa: number | null;
  subjects: FapSubjectData[];
}

export interface FapSubjectData {
  subjectCode: string;
  status: 'Passed' | 'Failed' | 'Studying' | string;
  mark: number | null;
}

/**
 * Represents the personalized recommendation from the gap analysis.
 * This is returned by the backend after Transaction 2.
 */
export interface GapAnalysisResponse {
  recommendedFocus: string;
  highestPrioritySubject: string;
  reason: string;
  // We'll pass this payload to the next step to forge the path.
  forgingPayload: {
    // This will likely contain the list of subject IDs that form the gap.
    subjectGaps: string[]; 
  };
}

/**
 * Represents the successfully created Learning Path structure.
 * This is returned by the backend after Transaction 3.
 */
export interface ForgedLearningPath {
    id: string;
    name: string;
    description: string;
    // Other relevant fields from the LearningPath entity.
}
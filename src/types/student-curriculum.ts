// roguelearn-web/src/types/student-curriculum.ts

export interface StudentSubjectDto {
  id: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  description: string;
  semester?: number;
  createdAt: string;
  updatedAt: string;
}

// Query Requests (optional, for consistency if needed later)
export interface GetStudentProgramSubjectsRequest {
  programId: string;
}

export interface GetStudentClassSubjectsRequest {
  classId: string;
}
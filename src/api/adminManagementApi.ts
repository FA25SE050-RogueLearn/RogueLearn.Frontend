// roguelearn-web/src/api/adminManagementApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { Skill, CreateSkillCommandRequest, UpdateSkillCommandRequest } from '@/types/skills';
import { SkillDependencyDto, AddSkillDependencyCommandRequest, AddSkillDependencyResponse } from '@/types/skill-dependencies';
import { 
  SpecializationSubjectEntry, 
  AddSpecializationRequest, 
  AddSubjectToProgramRequest,
  SubjectSkillMappingDto // ⭐ Import new type
} from '@/types/admin-management';

const adminManagementApi = {
  // ... (SKILLS CRUD & DEPENDENCIES - No Change) ...
  // =================================================================
  // SKILLS CRUD (AdminSkillsController)
  // =================================================================

  /** GET /api/admin/skills */
  getAllSkills: (): Promise<ApiResponse<{ skills: Skill[] }>> =>
    axiosClient.get<{ skills: Skill[] }>('/api/admin/skills').then(res => ({
      isSuccess: true,
      data: res.data
    })),

  /** GET /api/admin/skills/{id} */
  getSkillById: (id: string): Promise<ApiResponse<Skill>> =>
    axiosClient.get<Skill>(`/api/admin/skills/${id}`).then(res => ({
      isSuccess: true,
      data: res.data
    })),

  /** POST /api/admin/skills */
  createSkill: (payload: CreateSkillCommandRequest): Promise<ApiResponse<Skill>> =>
    axiosClient.post<Skill>('/api/admin/skills', payload).then(res => ({
      isSuccess: true,
      data: res.data
    })),

  /** PUT /api/admin/skills/{id} */
  updateSkill: (id: string, payload: Omit<UpdateSkillCommandRequest, 'id'>): Promise<ApiResponse<Skill>> =>
    axiosClient.put<Skill>(`/api/admin/skills/${id}`, payload).then(res => ({
      isSuccess: true,
      data: res.data
    })),

  /** DELETE /api/admin/skills/{id} */
  deleteSkill: (id: string): Promise<ApiResponse<void>> =>
    axiosClient.delete<void>(`/api/admin/skills/${id}`).then(() => ({
      isSuccess: true,
      data: undefined
    })),

  // =================================================================
  // SKILL DEPENDENCIES (AdminSkillsController)
  // =================================================================

  /** GET /api/admin/skills/{id}/dependencies */
  getSkillDependencies: (id: string): Promise<ApiResponse<{ dependencies: SkillDependencyDto[] }>> =>
    axiosClient.get<{ dependencies: SkillDependencyDto[] }>(`/api/admin/skills/${id}/dependencies`).then(res => ({
      isSuccess: true,
      data: res.data
    })),

  /** 
   * POST /api/admin/skills/{id}/dependencies 
   * Note: The backend expects { SkillId, PrerequisiteSkillId, RelationshipType } in body, 
   * but overrides SkillId from route.
   */
  addDependency: (payload: AddSkillDependencyCommandRequest): Promise<ApiResponse<AddSkillDependencyResponse>> =>
    axiosClient.post<AddSkillDependencyResponse>(`/api/admin/skills/${payload.skillId}/dependencies`, payload).then(res => ({
      isSuccess: true,
      data: res.data
    })),

  /** DELETE /api/admin/skills/{id}/dependencies/{prereqId} */
  removeDependency: (skillId: string, prereqId: string): Promise<ApiResponse<void>> =>
    axiosClient.delete<void>(`/api/admin/skills/${skillId}/dependencies/${prereqId}`).then(() => ({
      isSuccess: true,
      data: undefined
    })),

  // ... (CLASSES & SPECIALIZATION - No Change) ...
  getClassSpecialization: (classId: string): Promise<ApiResponse<SpecializationSubjectEntry[]>> =>
    axiosClient.get<SpecializationSubjectEntry[]>(`/api/admin/classes/${classId}/specialization-subjects`).then(res => ({
      isSuccess: true,
      data: res.data
    })),

  addClassSpecialization: (payload: AddSpecializationRequest): Promise<ApiResponse<void>> =>
    axiosClient.post<void>(`/api/admin/classes/${payload.classId}/specialization-subjects`, payload).then(res => ({
      isSuccess: true,
      data: res.data
    })),

  removeClassSpecialization: (classId: string, subjectId: string): Promise<ApiResponse<void>> =>
    axiosClient.delete<void>(`/api/admin/classes/${classId}/specialization-subjects/${subjectId}`).then(() => ({
      isSuccess: true,
      data: undefined
    })),
    
   // =================================================================
   // SUBJECT SKILL MAPPINGS
   // =================================================================
   
   // ⭐ UPDATE: Return correct DTO type
   getSubjectSkills: (subjectId: string): Promise<ApiResponse<SubjectSkillMappingDto[]>> =>
     axiosClient.get<SubjectSkillMappingDto[]>(`/api/admin/subjects/${subjectId}/skills`).then(res => ({
       isSuccess: true,
       data: res.data
     })),
     
   addSubjectSkill: (subjectId: string, skillId: string, relevance: number = 1.0): Promise<ApiResponse<void>> =>
     axiosClient.post<void>(`/api/admin/subjects/${subjectId}/skills`, { skillId, relevance }).then(() => ({
       isSuccess: true,
       data: undefined
     })),

   removeSubjectSkill: (subjectId: string, skillId: string): Promise<ApiResponse<void>> =>
     axiosClient.delete<void>(`/api/admin/subjects/${subjectId}/skills/${skillId}`).then(() => ({
       isSuccess: true,
       data: undefined
     })),
     
   // ... (PROGRAMS - No Change) ...
   addSubjectToProgram: (programId: string, subjectId: string): Promise<ApiResponse<void>> =>
     axiosClient.post<void>(`/api/admin/programs/${programId}/subjects`, { subjectId } as AddSubjectToProgramRequest).then(() => ({
        isSuccess: true,
        data: undefined
     })),

   removeSubjectFromProgram: (programId: string, subjectId: string): Promise<ApiResponse<void>> =>
     axiosClient.delete<void>(`/api/admin/programs/${programId}/subjects/${subjectId}`).then(() => ({
        isSuccess: true,
        data: undefined
     })),
     
};

export default adminManagementApi;
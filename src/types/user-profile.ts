// roguelearn-web/src/types/user-profile.ts
/**
 * Feature: User Profiles
 * Source: RogueLearn.User.Application Features/UserProfiles
 * Purpose: Mirror backend DTOs and commands for user profile management and queries.
 */

/** User profile as returned from queries, including all necessary IDs for context. */
export interface UserProfileDto {
  id: string;
  authUserId: string;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  level: number;
  experiencePoints: number;
  onboardingCompleted: boolean;
  createdAt: string; // ISO string
  profileImageUrl?: string | null;
  bio?: string | null;
  preferencesJson?: string | null; // JSON string for preferences
  roles: string[];
  classId?: string | null; // The selected specialization/career class
  routeId?: string | null; // The selected academic route/curriculum program
}

/** Command to update profile fields for the current authenticated user. */
export interface UpdateMyProfileCommand {
  // Only fields that can be updated are included.
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  preferencesJson?: string | null;
}

// Admin-related types
export interface GetAllUserProfilesResponse {
  userProfiles: UserProfileDto[];
}
export type GetUserProfileByAuthIdResponse = UserProfileDto | null;

export interface FullUserInfoResponse {
  profile: ProfileSection;
  auth: AuthSection;
  relations: RelationsSection;
  counts: CountsSection;
}

export interface FullUserInfoSocialResponse {
  profile: ProfileSection;
  auth: AuthSection;
  relations: SocialRelationsSection;
  counts: CountsSection;
}

export interface ProfileSection {
  authUserId: string;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  classId?: string | null;
  className?: string | null;
  routeId?: string | null;
  curriculumName?: string | null;
  level: number;
  experiencePoints: number;
  profileImageUrl?: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSection {
  id: string;
  email: string;
  emailVerified?: boolean | null;
  createdAt?: string | null;
  lastSignInAt?: string | null;
  userMetadata?: Record<string, unknown> | null;
}

export interface RelationsSection {
  userRoles: UserRoleItem[];
  studentEnrollments: StudentEnrollmentItem[];
  studentTermSubjects: StudentTermSubjectItem[];
  userSkills: UserSkillItem[];
  userAchievements: UserAchievementItem[];
  partyMembers: PartyMemberItem[];
  guildMembers: GuildMemberItem[];
  notes: NoteItem[];
  notifications: NotificationItem[];
  lecturerVerificationRequests: LecturerVerificationRequestItem[];
  questAttempts: QuestAttemptItem[];
}

export interface SocialRelationsSection {
  userRoles: UserRoleItem[];
  studentEnrollments: StudentEnrollmentItem[];
  userSkills: UserSkillItem[];
  userAchievements: UserAchievementItem[];
  partyMembers: PartyMemberItem[];
  guildMembers: GuildMemberItem[];
  questAttempts: QuestAttemptItem[];
}

export interface CountsSection {
  notes: number;
  achievements: number;
  meetings: number;
  notificationsUnread: number;
  questsCompleted: number;
  questsInProgress: number;
}

export interface UserProfileSearchResult {
  authUserId: string;
  username: string;
  email?: string | null;
  profileImageUrl?: string | null;
  level: number;
  className?: string | null;
  guildName?: string | null;
}

export interface SearchProfilesResponse {
  results: UserProfileSearchResult[];
}

export interface SuggestedAlliesResponse {
  users: UserProfileSearchResult[];
}

export interface TopRankedResponse {
  users: UserProfileSearchResult[];
}

export interface UserRoleItem { roleId: string; assignedAt: string; roleName?: string | null }
export interface StudentEnrollmentItem { id: string; status: string; enrollmentDate: string; expectedGraduationDate?: string | null }
export interface StudentTermSubjectItem { id: string; subjectId: string; subjectCode: string; subjectName: string; semester?: number | null; status: string; grade?: string | null }
export interface UserSkillItem { id: string; skillName: string; level: number; experiencePoints: number }
export interface UserAchievementItem { achievementId: string; earnedAt: string; achievementName?: string | null; achievementIconUrl?: string | null }
export interface PartyMemberItem { partyId: string; partyName: string; role: string; joinedAt?: string | null }
export interface GuildMemberItem { guildId: string; guildName: string; role: string; joinedAt?: string | null }
export interface NoteItem { id: string; title: string; createdAt: string }
export interface NotificationItem { id: string; type: string; title: string; isRead: boolean; createdAt: string }
export interface LecturerVerificationRequestItem { id: string; status: string; submittedAt?: string | null }
export interface QuestAttemptItem { attemptId: string; questId: string; questTitle: string; status: string; completionPercentage: number; totalExperienceEarned: number; startedAt: string; completedAt?: string | null; stepsTotal: number; stepsCompleted: number; currentStepId?: string | null }
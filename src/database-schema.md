-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon_url text,
  source_service character varying NOT NULL,
  key text,
  rule_type text,
  rule_config jsonb,
  category text,
  version integer,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT achievements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.class_nodes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  parent_id uuid,
  title text NOT NULL,
  node_type text,
  description text,
  sequence integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_locked_by_import boolean NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT class_nodes_pkey PRIMARY KEY (id),
  CONSTRAINT class_nodes_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT class_nodes_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.class_nodes(id)
);
CREATE TABLE public.class_specialization_subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  placeholder_subject_code text NOT NULL DEFAULT ''::text,
  semester integer NOT NULL DEFAULT 0,
  CONSTRAINT class_specialization_subjects_pkey PRIMARY KEY (id),
  CONSTRAINT class_specialization_subjects_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT class_specialization_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);
CREATE TABLE public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  roadmap_url text,
  skill_focus_areas ARRAY,
  difficulty_level USER-DEFINED DEFAULT 'Beginner'::difficulty_level,
  estimated_duration_months integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT classes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.curriculum_program_subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT curriculum_program_subjects_pkey PRIMARY KEY (id),
  CONSTRAINT curriculum_program_subjects_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.curriculum_programs(id),
  CONSTRAINT curriculum_program_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);
CREATE TABLE public.curriculum_programs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  program_name character varying NOT NULL,
  program_code character varying NOT NULL UNIQUE,
  description text,
  degree_level USER-DEFINED NOT NULL,
  total_credits integer,
  duration_years integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT curriculum_programs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.guild_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL,
  inviter_id uuid,
  invitee_id uuid NOT NULL,
  invitation_type USER-DEFINED NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'Pending'::invitation_status,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '14 days'::interval),
  CONSTRAINT guild_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT guild_invitations_guild_id_fkey FOREIGN KEY (guild_id) REFERENCES public.guilds(id),
  CONSTRAINT guild_invitations_inviter_id_fkey FOREIGN KEY (inviter_id) REFERENCES public.user_profiles(auth_user_id),
  CONSTRAINT guild_invitations_invitee_id_fkey FOREIGN KEY (invitee_id) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.guild_join_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL,
  requester_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'Pending'::guild_join_request_status,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '14 days'::interval),
  CONSTRAINT guild_join_requests_pkey PRIMARY KEY (id),
  CONSTRAINT guild_join_requests_guild_id_fkey FOREIGN KEY (guild_id) REFERENCES public.guilds(id),
  CONSTRAINT guild_join_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.guild_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL,
  auth_user_id uuid NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'Member'::guild_role,
  status USER-DEFINED NOT NULL DEFAULT 'Active'::member_status,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  left_at timestamp with time zone,
  contribution_points integer NOT NULL DEFAULT 0,
  rank_within_guild integer,
  CONSTRAINT guild_members_pkey PRIMARY KEY (id),
  CONSTRAINT guild_members_guild_id_fkey FOREIGN KEY (guild_id) REFERENCES public.guilds(id),
  CONSTRAINT guild_members_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.guild_post_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  author_id uuid NOT NULL,
  content text NOT NULL,
  parent_comment_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT guild_post_comments_pkey PRIMARY KEY (id),
  CONSTRAINT guild_post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.guild_posts(id),
  CONSTRAINT guild_post_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.user_profiles(auth_user_id),
  CONSTRAINT guild_post_comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.guild_post_comments(id)
);
CREATE TABLE public.guild_post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT guild_post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT guild_post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.guild_posts(id),
  CONSTRAINT guild_post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.guild_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL,
  author_id uuid NOT NULL,
  title character varying NOT NULL,
  content text NOT NULL,
  post_type USER-DEFINED NOT NULL DEFAULT 'general'::post_type,
  is_pinned boolean NOT NULL DEFAULT false,
  status USER-DEFINED NOT NULL DEFAULT 'published'::guild_post_status,
  is_locked boolean NOT NULL DEFAULT false,
  is_announcement boolean NOT NULL DEFAULT false,
  attachments jsonb,
  tags ARRAY,
  like_count integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT guild_posts_pkey PRIMARY KEY (id),
  CONSTRAINT guild_posts_guild_id_fkey FOREIGN KEY (guild_id) REFERENCES public.guilds(id),
  CONSTRAINT guild_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.guilds (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  description text NOT NULL,
  guild_type USER-DEFINED NOT NULL,
  max_members integer NOT NULL DEFAULT 100,
  current_member_count integer NOT NULL DEFAULT 1,
  merit_points integer NOT NULL DEFAULT 0,
  is_public boolean NOT NULL DEFAULT true,
  requires_approval boolean NOT NULL DEFAULT false,
  banner_image_url text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT guilds_pkey PRIMARY KEY (id),
  CONSTRAINT guilds_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.learning_paths (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text NOT NULL,
  path_type USER-DEFINED NOT NULL,
  estimated_total_duration_hours integer,
  total_experience_points integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT learning_paths_pkey PRIMARY KEY (id),
  CONSTRAINT learning_paths_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.lecturer_verification_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'Pending'::verification_status,
  documents jsonb,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewer_id uuid,
  review_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lecturer_verification_requests_pkey PRIMARY KEY (id),
  CONSTRAINT lecturer_verification_requests_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_profiles(auth_user_id),
  CONSTRAINT lecturer_verification_requests_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.meeting_participants (
  participant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL,
  user_id uuid,
  join_time timestamp with time zone,
  leave_time timestamp with time zone,
  role_in_meeting character varying NOT NULL DEFAULT 'participant'::character varying,
  display_name text,
  CONSTRAINT meeting_participants_pkey PRIMARY KEY (participant_id),
  CONSTRAINT meeting_participants_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.meetings(meeting_id),
  CONSTRAINT meeting_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.meeting_summaries (
  meeting_summary_id uuid NOT NULL DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL,
  summary_text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT meeting_summaries_pkey PRIMARY KEY (meeting_summary_id),
  CONSTRAINT meeting_summaries_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.meetings(meeting_id)
);
CREATE TABLE public.meetings (
  meeting_id uuid NOT NULL DEFAULT gen_random_uuid(),
  party_id uuid,
  title character varying NOT NULL,
  scheduled_start_time timestamp with time zone NOT NULL,
  scheduled_end_time timestamp with time zone NOT NULL,
  actual_start_time timestamp with time zone,
  actual_end_time timestamp with time zone,
  organizer_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  meeting_link text,
  guild_id uuid,
  space_name text,
  meeting_code text,
  meeting_status USER-DEFINED,
  CONSTRAINT meetings_pkey PRIMARY KEY (meeting_id),
  CONSTRAINT meetings_party_id_fkey FOREIGN KEY (party_id) REFERENCES public.parties(id),
  CONSTRAINT meetings_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.user_profiles(auth_user_id),
  CONSTRAINT meetings_guild_id_fkey FOREIGN KEY (guild_id) REFERENCES public.guilds(id)
);
CREATE TABLE public.note_quests (
  note_id uuid NOT NULL,
  quest_id uuid NOT NULL,
  CONSTRAINT note_quests_pkey PRIMARY KEY (note_id, quest_id),
  CONSTRAINT note_quests_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id),
  CONSTRAINT note_quests_quest_id_fkey FOREIGN KEY (quest_id) REFERENCES public.quests(id)
);
CREATE TABLE public.note_skills (
  note_id uuid NOT NULL,
  skill_id uuid NOT NULL,
  CONSTRAINT note_skills_pkey PRIMARY KEY (note_id, skill_id),
  CONSTRAINT note_skills_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id),
  CONSTRAINT note_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id)
);
CREATE TABLE public.note_tags (
  note_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  CONSTRAINT note_tags_pkey PRIMARY KEY (note_id, tag_id),
  CONSTRAINT note_tags_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id),
  CONSTRAINT note_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id)
);
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  title text NOT NULL,
  content jsonb,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  type USER-DEFINED NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.parties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  party_type USER-DEFINED NOT NULL,
  max_members integer NOT NULL DEFAULT 6,
  current_member_count integer NOT NULL DEFAULT 1,
  is_public boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  disbanded_at timestamp with time zone,
  CONSTRAINT parties_pkey PRIMARY KEY (id),
  CONSTRAINT parties_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.party_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL,
  inviter_id uuid NOT NULL,
  invitee_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'Pending'::invitation_status,
  message text,
  invited_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '7 days'::interval),
  CONSTRAINT party_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT party_invitations_party_id_fkey FOREIGN KEY (party_id) REFERENCES public.parties(id),
  CONSTRAINT party_invitations_inviter_id_fkey FOREIGN KEY (inviter_id) REFERENCES public.user_profiles(auth_user_id),
  CONSTRAINT party_invitations_invitee_id_fkey FOREIGN KEY (invitee_id) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.party_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL,
  auth_user_id uuid NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'Member'::party_role,
  status USER-DEFINED NOT NULL DEFAULT 'Active'::member_status,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  left_at timestamp with time zone,
  contribution_score integer NOT NULL DEFAULT 0,
  CONSTRAINT party_members_pkey PRIMARY KEY (id),
  CONSTRAINT party_members_party_id_fkey FOREIGN KEY (party_id) REFERENCES public.parties(id),
  CONSTRAINT party_members_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.party_stash_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL,
  original_note_id uuid,
  shared_by_user_id uuid NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL,
  tags ARRAY,
  shared_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT party_stash_items_pkey PRIMARY KEY (id),
  CONSTRAINT party_stash_items_party_id_fkey FOREIGN KEY (party_id) REFERENCES public.parties(id),
  CONSTRAINT party_stash_items_shared_by_user_id_fkey FOREIGN KEY (shared_by_user_id) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.quest_chapters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  learning_path_id uuid NOT NULL,
  title text NOT NULL,
  sequence integer NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'NotStarted'::path_progress_status,
  start_date date,
  end_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT quest_chapters_pkey PRIMARY KEY (id),
  CONSTRAINT quest_chapters_learning_path_id_fkey FOREIGN KEY (learning_path_id) REFERENCES public.learning_paths(id)
);
CREATE TABLE public.quest_resources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL,
  resource_type USER-DEFINED NOT NULL,
  title character varying NOT NULL,
  description text,
  url text,
  file_path text,
  metadata jsonb,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT quest_resources_pkey PRIMARY KEY (id),
  CONSTRAINT quest_resources_quest_id_fkey FOREIGN KEY (quest_id) REFERENCES public.quests(id)
);
CREATE TABLE public.quest_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL,
  step_number integer NOT NULL,
  title character varying NOT NULL,
  description text NOT NULL,
  content jsonb,
  validation_criteria jsonb,
  experience_points integer NOT NULL DEFAULT 0,
  is_optional boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT quest_steps_pkey PRIMARY KEY (id),
  CONSTRAINT quest_steps_quest_id_fkey FOREIGN KEY (quest_id) REFERENCES public.quests(id)
);
CREATE TABLE public.quest_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL,
  submission_data jsonb NOT NULL,
  graded_at timestamp with time zone,
  grade numeric,
  max_grade numeric NOT NULL,
  feedback text,
  is_passed boolean,
  attempt_number integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  quest_id uuid NOT NULL,
  step_id uuid NOT NULL,
  activity_id uuid NOT NULL,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT quest_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT quest_submissions_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.user_quest_attempts(id),
  CONSTRAINT quest_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(auth_user_id),
  CONSTRAINT quest_submissions_quest_id_fkey FOREIGN KEY (quest_id) REFERENCES public.quests(id),
  CONSTRAINT quest_submissions_step_id_fkey FOREIGN KEY (step_id) REFERENCES public.quest_steps(id)
);
CREATE TABLE public.quests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text NOT NULL,
  quest_type USER-DEFINED NOT NULL,
  difficulty_level USER-DEFINED NOT NULL,
  estimated_duration_minutes integer,
  experience_points_reward integer NOT NULL DEFAULT 0,
  subject_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  quest_chapter_id uuid,
  sequence integer,
  quest_status USER-DEFINED DEFAULT 'NotStarted'::quest_status,
  is_recommended boolean NOT NULL DEFAULT false,
  recommendation_reason character varying,
  CONSTRAINT quests_pkey PRIMARY KEY (id),
  CONSTRAINT quests_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT quests_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(auth_user_id),
  CONSTRAINT quests_quest_chapter_id_fkey FOREIGN KEY (quest_chapter_id) REFERENCES public.quest_chapters(id)
);
CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  description text,
  permissions jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.skill_dependencies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL,
  prerequisite_skill_id uuid NOT NULL,
  relationship_type USER-DEFINED NOT NULL DEFAULT 'Prerequisite'::skill_relationship_type,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT skill_dependencies_pkey PRIMARY KEY (id),
  CONSTRAINT skill_dependencies_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id),
  CONSTRAINT skill_dependencies_prerequisite_skill_id_fkey FOREIGN KEY (prerequisite_skill_id) REFERENCES public.skills(id)
);
CREATE TABLE public.skills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  domain character varying,
  tier USER-DEFINED NOT NULL DEFAULT 'Foundation'::skill_tier_level,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  source_subject_id uuid,
  CONSTRAINT skills_pkey PRIMARY KEY (id),
  CONSTRAINT fk_skills_source_subject FOREIGN KEY (source_subject_id) REFERENCES public.subjects(id)
);
CREATE TABLE public.student_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  enrollment_date date NOT NULL,
  expected_graduation_date date,
  status USER-DEFINED NOT NULL DEFAULT 'Active'::enrollment_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT student_enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT student_enrollments_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.student_semester_subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL,
  academic_year character varying NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'Studying'::subject_enrollment_status,
  grade character varying,
  credits_earned integer DEFAULT 0,
  enrolled_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  auth_user_id uuid,
  CONSTRAINT student_semester_subjects_pkey PRIMARY KEY (id),
  CONSTRAINT student_semester_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT student_semester_subjects_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.subject_skill_mappings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL,
  skill_id uuid NOT NULL,
  relevance_weight numeric NOT NULL DEFAULT 1.00 CHECK (relevance_weight >= 0.00 AND relevance_weight <= 1.00),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subject_skill_mappings_pkey PRIMARY KEY (id),
  CONSTRAINT subject_skill_mappings_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT subject_skill_mappings_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id)
);
CREATE TABLE public.subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_code character varying NOT NULL,
  subject_name character varying NOT NULL,
  credits integer NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  content jsonb,
  semester integer,
  prerequisite_subject_ids ARRAY,
  CONSTRAINT subjects_pkey PRIMARY KEY (id)
);
CREATE TABLE public.summary_chunks (
  summary_chunk_id uuid NOT NULL DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL,
  chunk_number integer NOT NULL,
  summary_text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT summary_chunks_pkey PRIMARY KEY (summary_chunk_id),
  CONSTRAINT summary_chunks_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.meetings(meeting_id)
);
CREATE TABLE public.tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  name text NOT NULL,
  CONSTRAINT tags_pkey PRIMARY KEY (id),
  CONSTRAINT tags_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.transcript_segments (
  segment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL,
  speaker_id uuid NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  transcript_text text NOT NULL,
  chunk_number integer NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'Processed'::transcript_segment_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT transcript_segments_pkey PRIMARY KEY (segment_id),
  CONSTRAINT transcript_segments_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.meetings(meeting_id),
  CONSTRAINT transcript_segments_speaker_id_fkey FOREIGN KEY (speaker_id) REFERENCES public.meeting_participants(participant_id)
);
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  achievement_id uuid NOT NULL,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  context jsonb,
  CONSTRAINT user_achievements_pkey PRIMARY KEY (id),
  CONSTRAINT user_achievements_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_profiles(auth_user_id),
  CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL UNIQUE,
  username character varying NOT NULL UNIQUE,
  bio text,
  email character varying NOT NULL UNIQUE,
  first_name character varying,
  last_name character varying,
  class_id uuid,
  route_id uuid,
  level integer NOT NULL DEFAULT 1,
  experience_points integer NOT NULL DEFAULT 0,
  profile_image_url text,
  preferences jsonb,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id),
  CONSTRAINT user_profiles_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT user_profiles_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.curriculum_programs(id)
);
CREATE TABLE public.user_quest_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  quest_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'InProgress'::quest_attempt_status,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  abandoned_at timestamp with time zone,
  total_experience_earned integer NOT NULL DEFAULT 0,
  completion_percentage numeric NOT NULL DEFAULT 0.00,
  current_step_id uuid,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_quest_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT user_quest_attempts_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_profiles(auth_user_id),
  CONSTRAINT user_quest_attempts_quest_id_fkey FOREIGN KEY (quest_id) REFERENCES public.quests(id),
  CONSTRAINT user_quest_attempts_current_step_id_fkey FOREIGN KEY (current_step_id) REFERENCES public.quest_steps(id)
);
CREATE TABLE public.user_quest_step_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL,
  step_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'NotStarted'::step_completion_status,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  submission_data jsonb,
  feedback text,
  experience_earned integer NOT NULL DEFAULT 0,
  attempts_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_activity_ids ARRAY,
  CONSTRAINT user_quest_step_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_quest_step_progress_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.user_quest_attempts(id),
  CONSTRAINT user_quest_step_progress_step_id_fkey FOREIGN KEY (step_id) REFERENCES public.quest_steps(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  assigned_by uuid,
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_profiles(auth_user_id),
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id),
  CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.user_profiles(auth_user_id)
);
CREATE TABLE public.user_skill_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  source_service character varying NOT NULL,
  source_type USER-DEFINED NOT NULL,
  source_id uuid,
  skill_id uuid NOT NULL,
  skill_name character varying NOT NULL,
  points_awarded integer NOT NULL,
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_skill_rewards_pkey PRIMARY KEY (id),
  CONSTRAINT user_skill_rewards_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_profiles(auth_user_id),
  CONSTRAINT user_skill_rewards_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id)
);
CREATE TABLE public.user_skills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  skill_id uuid NOT NULL,
  skill_name character varying NOT NULL,
  experience_points integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  last_updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_skills_pkey PRIMARY KEY (id),
  CONSTRAINT user_skills_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_profiles(auth_user_id),
  CONSTRAINT user_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id)
);
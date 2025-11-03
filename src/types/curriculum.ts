/**
 * Feature: Curriculum (Barrel)
 * Purpose: Re-export curriculum-related type definitions to keep imports stable and organized.
 * Includes: Programs, Versions, Structure, Syllabus, Import flows.
 */

export * from "./curriculum-programs";
export * from "./curriculum-versions";
export * from "./curriculum-structure";
export * from "./syllabus";
export * from "./curriculum-import";

/** Backward-compat alias: some clients import CurriculumProgram from this module. */
export type { CurriculumProgramDto as CurriculumProgram } from "./curriculum-programs";
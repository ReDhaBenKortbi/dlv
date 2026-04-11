// Book domain vocabulary — language/skill/level enumerations.
// Canonical home. src/constants/bookOptions.ts re-exports from here for
// backwards compatibility during the incremental migration.

export const TARGET_LANGUAGES = [
  { id: "AR", label: "Arabic", code: "ar" },
  { id: "EN", label: "English", code: "en" },
  { id: "FR", label: "French", code: "fr" },
] as const;

export type TargetLanguageCode = (typeof TARGET_LANGUAGES)[number]["id"];

export const FOCUS_SKILLS = [
  { id: "GRAMMAR", label: "Grammar", color: "badge-primary" },
  { id: "VOCABULARY", label: "Vocabulary", color: "badge-secondary" },
  { id: "READING", label: "Reading", color: "badge-accent" },
  { id: "LISTENING", label: "Listening", color: "badge-info" },
  { id: "SPEAKING", label: "Speaking", color: "badge-success" },
  { id: "ALL_IN_ONE", label: "All-in-One", color: "badge-neutral" },
] as const;

export type FocusSkillCode = (typeof FOCUS_SKILLS)[number]["id"];

export const PROFICIENCY_LEVELS = [
  { id: "A1", label: "A1 - Beginner", description: "Complete beginner" },
  { id: "A2", label: "A2 - Elementary", description: "Basic understanding" },
  { id: "B1", label: "B1 - Intermediate", description: "Standard conversation" },
  { id: "B2", label: "B2 - Upper Intermediate", description: "Fluent communication" },
  { id: "C1", label: "C1 - Advanced", description: "Complex academic tasks" },
  { id: "C2", label: "C2 - Mastery", description: "Native-level proficiency" },
] as const;

export type ProficiencyLevelCode = (typeof PROFICIENCY_LEVELS)[number]["id"];

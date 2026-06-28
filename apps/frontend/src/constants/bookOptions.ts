// src/constants/bookOptions.ts

// --- 1. TARGET LANGUAGES ---
export const TARGET_LANGUAGES = [
  { id: "AR", label: "Arabic", code: "ar" },
  { id: "EN", label: "English", code: "en" },
  { id: "FR", label: "French", code: "fr" },
] as const;

// Helper type to extract "AR" | "EN" | "FR"
export type TargetLanguageCode = (typeof TARGET_LANGUAGES)[number]["id"];

// --- 2. FOCUS SKILLS (The "Topic") ---
export const FOCUS_SKILLS = [
  { id: "GRAMMAR", label: "Grammar", color: "badge-primary" },
  { id: "VOCABULARY", label: "Vocabulary", color: "badge-secondary" },
  { id: "READING", label: "Reading", color: "badge-accent" },
  { id: "LISTENING", label: "Listening", color: "badge-info" },
  { id: "SPEAKING", label: "Speaking", color: "badge-success" },
  { id: "ALL_IN_ONE", label: "All-in-One", color: "badge-neutral" },
] as const;

export type FocusSkillCode = (typeof FOCUS_SKILLS)[number]["id"];

// --- 3. PROFICIENCY LEVELS (CEFR Standard) ---
export const PROFICIENCY_LEVELS = [
  { id: "A1", label: "A1 - Beginner", description: "Complete beginner" },
  { id: "A2", label: "A2 - Elementary", description: "Basic understanding" },
  {
    id: "B1",
    label: "B1 - Intermediate",
    description: "Standard conversation",
  },
  {
    id: "B2",
    label: "B2 - Upper Intermediate",
    description: "Fluent communication",
  },
  { id: "C1", label: "C1 - Advanced", description: "Complex academic tasks" },
  { id: "C2", label: "C2 - Mastery", description: "Native-level proficiency" },
] as const;

export type ProficiencyLevelCode = (typeof PROFICIENCY_LEVELS)[number]["id"];

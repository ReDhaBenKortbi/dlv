// Backwards-compatibility shim — canonical source is domain/book/vocabulary.ts.
// Existing imports continue to work during the incremental migration.
export {
  TARGET_LANGUAGES,
  FOCUS_SKILLS,
  PROFICIENCY_LEVELS,
} from "../domain/book/vocabulary";

export type {
  TargetLanguageCode,
  FocusSkillCode,
  ProficiencyLevelCode,
} from "../domain/book/vocabulary";

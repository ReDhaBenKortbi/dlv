import {
  TARGET_LANGUAGES,
  FOCUS_SKILLS,
  PROFICIENCY_LEVELS,
} from "../../constants/bookOptions";
import { Filter, GraduationCap } from "lucide-react";

interface LibrarySidebarProps {
  selectedLanguage: string;
  onLanguageChange: (id: string) => void;
  selectedSkills: string[];
  onToggleSkill: (id: string) => void;
  selectedLevels: string[];
  onToggleLevel: (id: string) => void;
  onClearFilters: () => void;
}

export const LibrarySidebar = ({
  selectedLanguage,
  onLanguageChange,
  selectedSkills,
  onToggleSkill,
  selectedLevels,
  onToggleLevel,
  onClearFilters,
}: LibrarySidebarProps) => {
  return (
    <div className="flex flex-col gap-8 p-6 bg-base-100 rounded-2xl border border-base-300 shadow-sm h-fit sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-lg">
          <Filter size={18} /> Filters
        </h2>
        <button
          onClick={onClearFilters}
          className="text-xs font-bold text-primary hover:underline"
        >
          Reset All
        </button>
      </div>

      {/* 1. LANGUAGE SELECTOR (Single Choice) */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-4">
          Target Language
        </h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onLanguageChange("")}
            className={`btn btn-sm justify-start ${selectedLanguage === "" ? "btn-primary" : "btn-ghost"}`}
          >
            All Languages
          </button>
          {TARGET_LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => onLanguageChange(lang.id)}
              className={`btn btn-sm justify-start ${selectedLanguage === lang.id ? "btn-primary" : "btn-ghost"}`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SKILL SELECTOR (Multiple Choice) */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-4">
          Focus Skill
        </h3>
        <div className="flex flex-wrap gap-2">
          {FOCUS_SKILLS.map((skill) => {
            const isSelected = selectedSkills.includes(skill.id);
            return (
              <button
                key={skill.id}
                onClick={() => onToggleSkill(skill.id)}
                className={`badge badge-md py-3 px-4 cursor-pointer transition-all border-none font-bold text-[10px] uppercase
                  ${isSelected ? skill.color : "bg-base-200 text-base-content/50 hover:bg-base-300"}`}
              >
                {skill.label}
              </button>
            );
          })}
        </div>
      </div>
      {/* 3. PROFICIENCY LEVEL (Multiple Choice) */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2">
          <GraduationCap size={14} /> Proficiency Level
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {PROFICIENCY_LEVELS.map((level) => {
            const isSelected = selectedLevels.includes(level.id);
            return (
              <button
                key={level.id}
                onClick={() => onToggleLevel(level.id)}
                className={`btn btn-xs h-10 font-bold border-none transition-all
            ${isSelected ? "btn-neutral text-white" : "bg-base-200 text-base-content/40 hover:bg-base-300"}`}
                title={level.description} // Shows description on hover
              >
                {level.id}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

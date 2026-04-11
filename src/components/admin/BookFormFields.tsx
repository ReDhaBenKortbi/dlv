import {
  TARGET_LANGUAGES,
  FOCUS_SKILLS,
  PROFICIENCY_LEVELS,
} from "../../constants/bookOptions";

export interface BookFormValues {
  title: string;
  author: string;
  description: string;
  targetLanguage: string;
  focusSkill: string;
  proficiencyLevel: string;
}

interface BookFormFieldsProps {
  values: BookFormValues;
  onChange: (field: keyof BookFormValues, value: string) => void;
  requireSelects?: boolean;
}

export function BookFormFields({ values, onChange, requireSelects = false }: BookFormFieldsProps) {
  return (
    <>
      {/* TITLE + AUTHOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-base-content/60 uppercase">
            Book Title
          </label>
          <input
            type="text"
            placeholder="The Great Gatsby"
            className="input input-bordered bg-base-200 border-base-300 mt-1 w-full"
            value={values.title}
            onChange={(e) => onChange("title", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-base-content/60 uppercase">
            Author Name
          </label>
          <input
            type="text"
            placeholder="F. Scott Fitzgerald"
            className="input input-bordered bg-base-200 border-base-300 mt-1 w-full"
            value={values.author}
            onChange={(e) => onChange("author", e.target.value)}
            required
          />
        </div>
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="text-xs font-bold text-base-content/60 uppercase">
          Book Description
        </label>
        <textarea
          className="textarea textarea-bordered bg-base-200 border-base-300 mt-1 h-28 w-full"
          placeholder="Describe the flipbook content..."
          value={values.description}
          onChange={(e) => onChange("description", e.target.value)}
          required
        />
      </div>

      {/* ACADEMIC PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-base-content/60 uppercase">
            Language
          </label>
          <select
            className="select select-bordered bg-base-200 border-base-300 mt-1 w-full"
            value={values.targetLanguage}
            onChange={(e) => onChange("targetLanguage", e.target.value)}
            required={requireSelects}
          >
            <option value="" disabled>
              Select Language
            </option>
            {TARGET_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-base-content/60 uppercase">
            Focus Skill
          </label>
          <select
            className="select select-bordered bg-base-200 border-base-300 mt-1 w-full"
            value={values.focusSkill}
            onChange={(e) => onChange("focusSkill", e.target.value)}
            required={requireSelects}
          >
            <option value="" disabled>
              Select Skill
            </option>
            {FOCUS_SKILLS.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-base-content/60 uppercase">
            Proficiency Level
          </label>
          <select
            className="select select-bordered bg-base-200 border-base-300 mt-1 w-full"
            value={values.proficiencyLevel}
            onChange={(e) => onChange("proficiencyLevel", e.target.value)}
            required={requireSelects}
          >
            <option value="" disabled>
              Select Level
            </option>
            {PROFICIENCY_LEVELS.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}

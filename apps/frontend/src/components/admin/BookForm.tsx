import {
  BOOK_TIERS,
  FOCUS_SKILLS,
  PROFICIENCY_LEVELS,
  TARGET_LANGUAGES,
} from "@/constants/bookOptions";
import type {
  BookTier,
  FocusSkillCode,
  ProficiencyLevelCode,
  TargetLanguageCode,
} from "@/constants/bookOptions";
import type { BookFormValues } from "@/hooks/books/useBookForm";

const LABEL = "text-xs font-bold text-base-content/60 uppercase";

interface FieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

const Field = ({ label, children, className = "" }: FieldProps) => (
  <div className={className}>
    <label className={LABEL}>{label}</label>
    <div className="mt-1">{children}</div>
  </div>
);

interface BookFormProps {
  values: BookFormValues;
  onChange: <K extends keyof BookFormValues>(
    key: K,
    value: BookFormValues[K],
  ) => void;
  /** The page's cover control — uploaded fresh, reused from a sibling, or replaced. */
  coverSlot?: React.ReactNode;
}

/**
 * Every editable field of a book, in one controlled and presentational
 * component. Owns no state and performs no saving: AddBook and EditBook keep
 * their own submit flow, cover handling and surrounding chrome.
 *
 * Previously this field set was written out twice, ~780 lines across the two
 * pages, with the labels and validation drifting between them.
 */
export const BookForm = ({ values, onChange, coverSlot }: BookFormProps) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Book Title">
        <input
          type="text"
          placeholder="The Great Gatsby"
          className="input input-bordered bg-base-200 border-base-300 w-full"
          value={values.title}
          onChange={(e) => onChange("title", e.target.value)}
          required
        />
      </Field>

      <Field label="Author Name">
        <input
          type="text"
          placeholder="F. Scott Fitzgerald"
          className="input input-bordered bg-base-200 border-base-300 w-full"
          value={values.author}
          onChange={(e) => onChange("author", e.target.value)}
          required
        />
      </Field>
    </div>

    <Field label="Book Description">
      <textarea
        className="textarea textarea-bordered bg-base-200 border-base-300 h-28 w-full"
        placeholder="Describe the flipbook content..."
        value={values.description}
        onChange={(e) => onChange("description", e.target.value)}
        required
      />
    </Field>

    {/* The three orthogonal metadata dimensions. */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Field label="Language">
        <select
          className="select select-bordered bg-base-200 border-base-300 w-full"
          value={values.targetLanguage}
          onChange={(e) =>
            onChange("targetLanguage", e.target.value as TargetLanguageCode)
          }
          required
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
      </Field>

      <Field label="Focus Skill">
        <select
          className="select select-bordered bg-base-200 border-base-300 w-full"
          value={values.focusSkill}
          onChange={(e) => onChange("focusSkill", e.target.value as FocusSkillCode)}
          required
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
      </Field>

      <Field label="Proficiency Level">
        <select
          className="select select-bordered bg-base-200 border-base-300 w-full"
          value={values.proficiencyLevel}
          onChange={(e) =>
            onChange("proficiencyLevel", e.target.value as ProficiencyLevelCode)
          }
          required
        >
          <option value="" disabled>
            Select Level
          </option>
          {PROFICIENCY_LEVELS.map((level) => (
            <option key={level.id} value={level.id}>
              {level.label}
            </option>
          ))}
        </select>
      </Field>
    </div>

    <div className="bg-base-200/50 border border-base-300 rounded-xl p-5 space-y-4">
      <div>
        <label className="text-xs font-bold text-warning uppercase">
          Netlify URL (index.html)
        </label>
        <input
          type="url"
          placeholder="https://your-flipbook.netlify.app/index.html"
          className="input input-bordered bg-base-100 border-warning/40 mt-1 w-full"
          value={values.indexURL}
          onChange={(e) => onChange("indexURL", e.target.value)}
          required
        />
      </div>

      {coverSlot && <Field label="Cover Image">{coverSlot}</Field>}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Access Tier">
        <select
          className="select select-bordered bg-base-200 border-base-300 w-full"
          value={values.bookTier}
          onChange={(e) => onChange("bookTier", e.target.value as BookTier)}
        >
          {BOOK_TIERS.map((tier) => (
            <option key={tier.id} value={tier.id}>
              {tier.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Group Key (optional)">
        <input
          type="text"
          placeholder="e.g. english-grammar-foundations"
          className="input input-bordered bg-base-200 border-base-300 w-full"
          value={values.groupKey}
          onChange={(e) => onChange("groupKey", e.target.value)}
        />
        <p className="text-xs opacity-50 mt-2">
          Books sharing a Group Key render as one library card with an edition
          switcher. Leave blank for a standalone book.
        </p>
      </Field>
    </div>
  </div>
);

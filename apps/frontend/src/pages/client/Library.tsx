import { useState, useMemo } from "react";
import { useBooks } from "../../hooks/books/useBooks";
import { LibrarySidebar } from "../../components/library/LibrarySidebar";
import { BookCard } from "../../components/library/BookCard";
import LoadingScreen from "../../components/common/LoadingScreen";
import { Filter } from "lucide-react";

const Library = () => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { books, isLoading } = useBooks();

  // --- FILTER STATE ---
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  // --- FILTER LOGIC ---
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const langMatch =
        selectedLanguage === "" || book.targetLanguage === selectedLanguage;
      const skillMatch =
        selectedSkills.length === 0 ||
        (book.focusSkill && selectedSkills.includes(book.focusSkill));

      // --- ADD LEVEL MATCH ---
      const levelMatch =
        selectedLevels.length === 0 ||
        (book.proficiencyLevel &&
          selectedLevels.includes(book.proficiencyLevel));

      return langMatch && skillMatch && levelMatch;
    });
  }, [books, selectedLanguage, selectedSkills, selectedLevels]);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId],
    );
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="max-w-7xl mx-auto min-h-screen p-4 md:p-10 ">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT: Sidebar (Fixed width on desktop) */}
        <aside
          className={`w-full lg:w-64 flex-shrink-0 ${showMobileFilters ? "block" : "hidden lg:block"}`}
        >
          <LibrarySidebar
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            selectedSkills={selectedSkills}
            onToggleSkill={toggleSkill}
            selectedLevels={selectedLevels}
            onToggleLevel={(lvlId) =>
              setSelectedLevels((prev) =>
                prev.includes(lvlId)
                  ? prev.filter((id) => id !== lvlId)
                  : [...prev, lvlId],
              )
            }
            onClearFilters={() => {
              setSelectedLanguage("");
              setSelectedSkills([]);
              setSelectedLevels([]);
            }}
          />
        </aside>

        {/* RIGHT: Book Grid */}
        <main className="flex-1">
          <div className="flex flex-col gap-6">
            {/* Header / Results Count */}
            <div className="flex justify-between items-center bg-base-100 p-4 rounded-xl lg:bg-transparent lg:p-0">
              <div>
                <h1 className="text-2xl font-bold">Explore Library</h1>
                <p className="text-xs opacity-50 font-medium uppercase tracking-wider">
                  {filteredBooks.length} titles found
                </p>
              </div>

              {/* Mobile Filter Button (Hidden on Desktop) */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="btn btn-primary btn-sm lg:hidden flex gap-2"
              >
                <Filter size={16} />
                {showMobileFilters ? "Hide Filters" : "Filters"}
              </button>
            </div>

            {/* The Grid */}
            {filteredBooks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 min-h-full py-4 ">
                {filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-base-100 rounded-3xl border border-dashed border-base-300">
                <p className="opacity-40 italic">
                  No books match these filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedLanguage("");
                    setSelectedSkills([]);
                  }}
                  className="btn btn-link btn-sm mt-2"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Library;

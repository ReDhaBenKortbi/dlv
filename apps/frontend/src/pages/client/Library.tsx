import { useMemo, useState } from "react";
import { useBooksList } from "../../hooks/books/useBooksList";
import { useSearch } from "../../context/SearchContext";
import { LibrarySidebar } from "../../components/library/LibrarySidebar";
import { BookCard } from "../../components/library/BookCard";
import LoadingScreen from "../../components/common/LoadingScreen";
import Pagination from "../../components/common/Pagination";
import { getTotalPages } from "../../lib/pagination";
import { LuFilter } from "react-icons/lu";

import { groupBooksIntoSeries } from "../../lib/bookSeries";

const PAGE_SIZE = 24;

const Library = () => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { searchTerm } = useSearch();

  // --- FILTER STATE ---
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // Filters/search are sent to the backend, which also handles grouping
  // multi-tier editions of the same title into one series per page.
  const { books, meta, isLoading } = useBooksList({
    page,
    limit: PAGE_SIZE,
    targetLanguage: selectedLanguage || undefined,
    focusSkill: selectedSkills,
    proficiencyLevel: selectedLevels,
    search: searchTerm || undefined,
  });

  // Any filter/search change invalidates the current page window — reset
  // to page 1 during render (React's recommended pattern for adjusting
  // state in response to a prop/derived-value change) rather than in an
  // effect, which would cost an extra render-and-commit round trip.
  const filterKey = `${selectedLanguage}|${selectedSkills.join(",")}|${selectedLevels.join(",")}|${searchTerm}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  const totalPages = meta ? getTotalPages(meta.total, meta.limit) : 1;

  if (filterKey !== prevFilterKey) {
    // Filters/search just changed — always take priority over clamping,
    // since `meta` still reflects the previous filter's stale totalPages.
    setPrevFilterKey(filterKey);
    setPage(1);
  } else if (meta && page > totalPages) {
    // Data shrank (e.g. a deletion) and the current page no longer exists —
    // fall back to the last valid page.
    setPage(totalPages);
  }

  // Tier editions of the same title (linked via `groupKey`) collapse into a
  // single card — the backend already guarantees every edition of a series
  // shown on this page is present, so this is pure display grouping now.
  const series = useMemo(() => groupBooksIntoSeries(books), [books]);

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
                  {meta?.total ?? series.length} titles found
                </p>
              </div>

              {/* Mobile Filter Button (Hidden on Desktop) */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="btn btn-primary btn-sm lg:hidden flex gap-2"
              >
                <LuFilter size={16} />
                {showMobileFilters ? "Hide Filters" : "Filters"}
              </button>
            </div>

            {/* The Grid */}
            {series.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 min-h-full py-4 ">
                {series.map(({ groupKey, editions }) => (
                  <BookCard key={groupKey} book={editions[0]} editions={editions} />
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

            {meta && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                total={meta.total}
                limit={meta.limit}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Library;

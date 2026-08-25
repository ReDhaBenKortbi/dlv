import { useMemo, useState } from "react";
import { useBooksList } from "../../hooks/books/useBooksList";
import { useSearch } from "../../context/SearchContext";
import { LibrarySidebar } from "../../components/library/LibrarySidebar";
import { BookCard } from "../../components/library/BookCard";
import LoadingScreen from "../../components/common/LoadingScreen";
import Pagination from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";
import { usePaginatedList } from "../../hooks/usePaginatedList";
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

  const filterKey = `${selectedLanguage}|${selectedSkills.join(",")}|${selectedLevels.join(",")}|${searchTerm}`;
  const { page, setPage, syncMeta } = usePaginatedList(filterKey);

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

  const totalPages = syncMeta(meta);

  // Tier editions of the same title (linked via `groupKey`) collapse into a
  // single card — the backend already guarantees every edition of a series
  // shown on this page is present, so this is pure display grouping now.
  const series = useMemo(() => groupBooksIntoSeries(books), [books]);

  const clearFilters = () => {
    setSelectedLanguage("");
    setSelectedSkills([]);
    setSelectedLevels([]);
  };

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
            onClearFilters={clearFilters}
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
              <div className="bg-base-100 rounded-3xl border border-dashed border-base-300">
                <EmptyState
                  icon="search"
                  title="No books match these filters"
                  message="Try widening your search, or clear the filters to see the whole library."
                  actionLabel="Clear all filters"
                  onAction={clearFilters}
                />
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

import { useState } from "react";
import { Link } from "react-router-dom";

import { useBookMutations } from "@/hooks/books/useBookMutations";
import { useBooksList } from "@/hooks/books/useBooksList";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { groupBooksIntoSeries } from "@/lib/bookSeries";
import LoadingScreen from "@/components/common/LoadingScreen";
import Pagination from "@/components/common/Pagination";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BookSeriesRow } from "@/components/admin/BookSeriesRow";
import type { Book } from "@/types/book";

const PAGE_SIZE = 15;

const BooksManager = () => {
  const { page, setPage, syncMeta } = usePaginatedList();

  // Grouped mode: one row per *title*. The API guarantees every edition of a
  // series lands on the same page, so a ladder is never split across a page
  // boundary, and `meta.total` counts titles rather than rows.
  const {
    books,
    meta,
    isLoading: isFetching,
  } = useBooksList({ page, limit: PAGE_SIZE });
  const totalPages = syncMeta(meta);

  const { remove, deletingId } = useBookMutations();

  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const toggle = (groupKey: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (!next.delete(groupKey)) next.add(groupKey);
      return next;
    });

  const handleDelete = async (edition: Book, editions: Book[]) => {
    const survivors = editions.filter((e) => e.id !== edition.id);
    // Deleting one edition of a series leaves the others behind, which isn't
    // obvious from a bare title — so name what stays.
    const message = survivors.length
      ? `Delete the ${edition.bookTier} edition of "${editions[0].title}"?\n\n` +
        `This is 1 of ${editions.length} editions — the ` +
        `${survivors.map((e) => e.bookTier).join(" and ")} ` +
        `edition${survivors.length > 1 ? "s" : ""} will remain.`
      : `Are you sure you want to delete "${edition.title}"?`;

    // Native confirm for intent; the toast covers progress and outcome.
    if (window.confirm(message)) {
      await remove(edition.id);
    }
  };

  if (isFetching) return <LoadingScreen />;

  const series = groupBooksIntoSeries(books);

  return (
    <div className="p-4 md:p-10 min-h-screen bg-base-100 text-base-content">
      <div className="max-w-7xl mx-auto">
        <AdminPageHeader
          className="mb-6 md:mb-8"
          title="Manage Books"
          subtitle="One row per title — expand a series to edit its tier editions."
          action={
            <Link
              className="btn btn-primary btn-sm md:btn-md"
              to="/admin/add-book"
            >
              + Add New Book
            </Link>
          }
        />

        <div className="overflow-x-auto bg-base-200 rounded-lg shadow border border-base-300">
          <table className="table table-compact w-full">
            <thead className="bg-base-300">
              <tr>
                <th className="text-left">Book</th>
                <th className="text-left">Details</th>
                <th className="text-center">Level</th>
                <th>Editions</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {series.map(({ groupKey, editions }) => (
                <BookSeriesRow
                  key={groupKey}
                  editions={editions}
                  isExpanded={expanded.has(groupKey)}
                  onToggle={() => toggle(groupKey)}
                  onDelete={(edition) => void handleDelete(edition, editions)}
                  deletingId={deletingId}
                />
              ))}
            </tbody>
          </table>
        </div>

        {meta && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={meta.total}
            limit={meta.limit}
            className="mt-6"
          />
        )}
      </div>
    </div>
  );
};

export default BooksManager;

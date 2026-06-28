import { Languages, GraduationCap, Target } from "lucide-react";
import { FOCUS_SKILLS } from "../../constants/bookOptions";

import { useBookMutations } from "../../hooks/books/useBookMutations";
import { useBooks } from "../../hooks/books/useBooks";

import LoadingScreen from "../../components/common/LoadingScreen";
import { Link } from "react-router-dom";

const BooksManager = () => {
  // 2. Use the "Reader" hook for the list
  const { books, isLoading: isFetching } = useBooks();

  // 3. Use the "Writer" hook for the delete action
  const { remove, isProcessing } = useBookMutations();

  const handleDelete = async (id: string, title: string) => {
    // 1. Keep the native confirm for safety (toasts are for progress, confirm is for intent)
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      // 2. We 'await' the remove call.
      // The toast will show "Deleting book..." automatically!
      await remove(id);

      // No need for alerts here!
      // The toast will say "Book deleted permanently" on its own.
    }
  };

  if (isFetching) return <LoadingScreen />;

  return (
    <div className="p-4 md:p-10 min-h-screen bg-base-100 text-base-content">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 md:gap-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Manage Books</h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
              View, edit, or remove books from the library.
            </p>
          </div>
          <Link
            className="btn btn-primary btn-sm md:btn-md"
            to="/admin/add-book"
          >
            + Add New Book
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-base-200 rounded-lg shadow border border-base-300">
          <table className="table table-compact w-full">
            <thead className="bg-base-300">
              <tr>
                <th className="text-left">Book</th>
                <th className="text-left">Details</th>
                <th className="text-center">Level</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => {
                const skillInfo = FOCUS_SKILLS.find(
                  (s) => s.id === book.focusSkill,
                );

                return (
                  <tr key={book.id} className="hover">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img src={book.coverURL} alt={book.title} />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm leading-tight">
                            {book.title}
                          </span>
                          <span className="text-[10px] opacity-60">
                            by {book.author}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
                          <Languages size={12} /> {book.targetLanguage || "N/A"}
                        </div>
                        {skillInfo && (
                          <div
                            className={`badge ${skillInfo.color} badge-xs text-[9px] border-none font-bold gap-1`}
                          >
                            <Target size={10} />
                            {skillInfo.label}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="text-center">
                      {book.proficiencyLevel ? (
                        <div className="badge badge-ghost border-base-300 gap-1 font-bold">
                          <GraduationCap size={12} className="opacity-60" />
                          {book.proficiencyLevel}
                        </div>
                      ) : (
                        <span className="opacity-20 text-xs">-</span>
                      )}
                    </td>

                    <td>
                      <div
                        className={`badge badge-sm font-bold ${book.isPremium ? "badge-secondary" : "badge-outline"}`}
                      >
                        {book.isPremium ? "PREMIUM" : "FREE"}
                      </div>
                    </td>

                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Link
                          to={`/admin/edit-book/${book.id}`}
                          className="btn btn-xs btn-outline btn-info"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(book.id, book.title)}
                          disabled={isProcessing}
                          className="btn btn-xs btn-outline btn-error"
                        >
                          {isProcessing ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BooksManager;

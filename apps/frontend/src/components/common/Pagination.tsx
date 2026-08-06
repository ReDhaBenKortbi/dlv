import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Total item count, used with `limit` to render a "Showing X–Y of Z" summary. */
  total?: number;
  limit?: number;
  className?: string;
}

const ELLIPSIS = "…" as const;

/** First, last, current ± 1, with "…" filling any gaps. */
function buildPageList(page: number, totalPages: number): (number | typeof ELLIPSIS)[] {
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const result: (number | typeof ELLIPSIS)[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(ELLIPSIS);
    result.push(sorted[i]);
  }
  return result;
}

export const Pagination = ({
  page,
  totalPages,
  onPageChange,
  total,
  limit,
  className = "",
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pageList = buildPageList(page, totalPages);

  const rangeStart = total !== undefined && limit ? (page - 1) * limit + 1 : undefined;
  const rangeEnd =
    total !== undefined && limit ? Math.min(page * limit, total) : undefined;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {total !== undefined && limit !== undefined && (
        <p className="text-xs opacity-50 font-medium">
          Showing {rangeStart}–{rangeEnd} of {total}
        </p>
      )}

      <div className="join">
        <button
          type="button"
          className="join-item btn btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {pageList.map((p, i) =>
          p === ELLIPSIS ? (
            <button
              key={`ellipsis-${i}`}
              type="button"
              className="join-item btn btn-sm btn-disabled"
              disabled
            >
              {ELLIPSIS}
            </button>
          ) : (
            <button
              key={p}
              type="button"
              className={`join-item btn btn-sm ${p === page ? "btn-active btn-primary" : ""}`}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          className="join-item btn btn-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

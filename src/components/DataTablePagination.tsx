"use client";

import Icon from "@/components/Icon";

const DEFAULT_ROWS_PER_PAGE_OPTIONS = [10, 12, 25, 50];

/**
 * Shared pagination bar for data tables (Employee Records, Transfer History,
 * Retirement History, …): Previous/Next, numbered pages with ellipsis for
 * long lists, rows-per-page selector, and a "Showing X–Y of Z" summary.
 */
export default function DataTablePagination({
  page,
  totalPages,
  onPrev,
  onNext,
  onGoTo,
  rowsPerPage,
  onRowsPerPageChange,
  rowsPerPageOptions = DEFAULT_ROWS_PER_PAGE_OPTIONS,
  start,
  end,
  total,
  itemLabel = "records",
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (page: number) => void;
  rowsPerPage: number;
  onRowsPerPageChange: (n: number) => void;
  rowsPerPageOptions?: number[];
  start: number;
  end: number;
  total: number;
  itemLabel?: string;
}) {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((n) => totalPages <= 7 || n === 1 || n === totalPages || Math.abs(n - page) <= 1)
    .reduce<number[]>((acc, n) => {
      if (acc.length > 0 && n - acc[acc.length - 1] > 1) acc.push(-1);
      acc.push(n);
      return acc;
    }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-soft px-4 py-3">
      <div className="text-[12.5px] text-muted">
        {total === 0 ? `No ${itemLabel} to show` : `Showing ${start}–${end} of ${total} ${itemLabel}`}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[12.5px] text-muted">
          Rows per page
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            aria-label="Rows Per Page"
            className="h-8 rounded-[7px] border-[1.5px] border-border bg-white px-2 text-[12.5px] text-ink focus:border-primary focus:outline-none"
          >
            {rowsPerPageOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={page === 1}
            className="flex h-8 items-center gap-1 rounded-[7px] border-[1.5px] border-border px-2.5 text-[12.5px] font-semibold text-ink transition-colors hover:border-muted-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="chevron" className="h-3.5 w-3.5 rotate-180" />
            Previous
          </button>

          <div className="mx-1 flex items-center gap-1">
            {pageNumbers.map((n, idx) =>
              n === -1 ? (
                <span key={`gap-${idx}`} className="px-1 text-muted-2">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  onClick={() => onGoTo(n)}
                  aria-current={n === page ? "page" : undefined}
                  className={`flex h-8 w-8 items-center justify-center rounded-[7px] text-[12.5px] font-semibold transition-colors ${
                    n === page ? "bg-primary text-white" : "text-ink hover:bg-canvas"
                  }`}
                >
                  {n}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={page === totalPages}
            className="flex h-8 items-center gap-1 rounded-[7px] border-[1.5px] border-border px-2.5 text-[12.5px] font-semibold text-ink transition-colors hover:border-muted-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <Icon name="chevron" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

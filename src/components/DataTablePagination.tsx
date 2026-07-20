"use client";

import Icon from "@/components/Icon";
import { useLang, useT } from "@/lib/i18n";

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
  const t = useT();
  const { lang } = useLang();
  const label = t(itemLabel);
  const summary =
    total === 0
      ? lang === "mr"
        ? `दाखवण्यासाठी कोणतेही ${label} नाहीत`
        : `No ${itemLabel} to show`
      : lang === "mr"
        ? `${total} पैकी ${start}–${end} ${label} दाखवत आहे`
        : `Showing ${start}–${end} of ${total} ${itemLabel}`;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((n) => totalPages <= 7 || n === 1 || n === totalPages || Math.abs(n - page) <= 1)
    .reduce<number[]>((acc, n) => {
      if (acc.length > 0 && n - acc[acc.length - 1] > 1) acc.push(-1);
      acc.push(n);
      return acc;
    }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-soft px-4 py-3">
      <div className="text-[12.5px] text-muted">{summary}</div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[12.5px] text-muted">
          {t("Rows per page")}
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
              aria-label="Rows Per Page"
              className="h-8 appearance-none rounded-[7px] border-[1.5px] border-border bg-white py-0 pr-6 pl-2 text-[12.5px] text-ink focus:border-primary focus:outline-none"
            >
              {rowsPerPageOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-muted-2">
              <Icon name="chevron" className="h-3 w-3 rotate-90" />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={page === 1}
            className="flex h-8 items-center gap-1 rounded-[7px] border-[1.5px] border-border px-2.5 text-[12.5px] font-semibold text-ink transition-colors hover:border-muted-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="chevron" className="h-3.5 w-3.5 rotate-180" />
            {t("Previous")}
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
            {t("Next")}
            <Icon name="chevron" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

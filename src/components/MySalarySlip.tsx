"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import DataTablePagination from "@/components/DataTablePagination";
import { Toast } from "@/components/form/Field";
import { EMPLOYEE_DIRECTORY } from "@/lib/employee-directory";

const CURRENT_EMPLOYEE = EMPLOYEE_DIRECTORY[0];
const YEARS = ["2026", "2025", "2024"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const BILL_TYPES = ["Regular", "Arrears", "Supplementary"];

type HistoryRow = {
  id: string;
  month: string;
  year: string;
  billType: string;
  generatedOn: string;
  status: "Generated" | "Pending";
};

const HISTORY: HistoryRow[] = [
  { id: "S-1", month: "June", year: "2026", billType: "Regular", generatedOn: "2026-06-30", status: "Generated" },
  { id: "S-2", month: "May", year: "2026", billType: "Regular", generatedOn: "2026-05-31", status: "Generated" },
  { id: "S-3", month: "April", year: "2026", billType: "Regular", generatedOn: "2026-04-30", status: "Generated" },
  { id: "S-4", month: "March", year: "2026", billType: "Arrears", generatedOn: "2026-03-28", status: "Generated" },
  { id: "S-5", month: "March", year: "2026", billType: "Regular", generatedOn: "2026-03-31", status: "Generated" },
  { id: "S-6", month: "July", year: "2026", billType: "Regular", generatedOn: "—", status: "Pending" },
];

const EARNINGS = [
  { label: "Basic Pay", amount: 35400 },
  { label: "Grade Pay", amount: 2400 },
  { label: "Dearness Allowance", amount: 14868 },
  { label: "House Rent Allowance", amount: 9558 },
  { label: "Travel Allowance", amount: 1200 },
  { label: "Medical Allowance", amount: 1250 },
];

const DEDUCTIONS = [
  { label: "CPF", amount: 3540 },
  { label: "GIS", amount: 120 },
  { label: "Income Tax", amount: 2500 },
  { label: "Professional Tax", amount: 200 },
  { label: "LIC Premium", amount: 1200 },
];

function statusTone(status: HistoryRow["status"]) {
  return status === "Generated" ? ("success" as const) : ("warning" as const);
}

export default function MySalarySlip() {
  const [year, setYear] = useState(YEARS[0]);
  const [month, setMonth] = useState("June");
  const [billType, setBillType] = useState(BILL_TYPES[0]);
  const [viewing, setViewing] = useState(false);
  const [zoom, setZoom] = useState(100);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function announce(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  const grossTotal = EARNINGS.reduce((s, e) => s + e.amount, 0);
  const deductionTotal = DEDUCTIONS.reduce((s, d) => s + d.amount, 0);
  const netTotal = grossTotal - deductionTotal;

  function handleView() {
    setViewing(true);
    setZoom(100);
    announce(`Loaded salary slip for ${month} ${year} (${billType}).`);
  }

  /* ---------------- History table ---------------- */
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [billTypeFilter, setBillTypeFilter] = useState("All");
  const [sortKey, setSortKey] = useState<"generatedOn" | "month">("generatedOn");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return HISTORY.filter((r) => {
      const matchesSearch = q === "" || `${r.month} ${r.year} ${r.billType}`.toLowerCase().includes(q);
      const matchesYear = yearFilter === "All" || r.year === yearFilter;
      const matchesMonth = monthFilter === "All" || r.month === monthFilter;
      const matchesBillType = billTypeFilter === "All" || r.billType === billTypeFilter;
      return matchesSearch && matchesYear && matchesMonth && matchesBillType;
    }).sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      return a[sortKey] > b[sortKey] ? dir : a[sortKey] < b[sortKey] ? -dir : 0;
    });
  }, [search, yearFilter, monthFilter, billTypeFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = filtered.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const end = Math.min(safePage * rowsPerPage, filtered.length);
  const pageRows = filtered.slice(start - 1, end);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        routeKey="ij-pay-slip"
        title="My Salary Slip"
        subtitle="Select a month and year to view, print, or download your salary slip."
      />

      {/* Profile card */}
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[14px] font-bold text-white">
          {CURRENT_EMPLOYEE.name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </span>
        <div>
          <div className="text-[14.5px] font-semibold text-ink">{CURRENT_EMPLOYEE.name}</div>
          <div className="text-[12.5px] text-muted">
            ID {CURRENT_EMPLOYEE.id} · {CURRENT_EMPLOYEE.designation} · {CURRENT_EMPLOYEE.department}
          </div>
        </div>
      </div>

      {/* Salary Slip Selection */}
      <div className="mb-5 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)] sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FilterSelect label="Salary Year" value={year} onChange={setYear} options={YEARS} />
          <FilterSelect label="Salary Month" value={month} onChange={setMonth} options={MONTHS} />
          <FilterSelect label="Bill Type" value={billType} onChange={setBillType} options={BILL_TYPES} />
        </div>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleView}
            className="flex items-center gap-2 rounded-[9px] bg-accent px-8 py-2.5 text-[13.5px] font-semibold text-white hover:bg-accent-dark"
          >
            <Icon name="eye" className="h-4 w-4" />
            View Salary Slip
          </button>
        </div>
      </div>

      {viewing && (
        <div className="mb-6">
          {/* Sticky toolbar */}
          <div className="sticky top-16 z-10 mb-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-surface/95 p-2.5 shadow-[0_1px_2px_rgba(22,35,28,0.04)] backdrop-blur">
            <PreviewToolButton icon="salary-slip" label="Download PDF" onClick={() => announce("PDF download isn't available in this preview.")} />
            <PreviewToolButton icon="printer" label="Print" onClick={() => window.print()} />
            <PreviewToolButton icon="eye" label="Open in New Tab" onClick={() => announce("Opening in a new tab isn't available in this preview.")} />
            <span className="mx-1 h-6 w-px bg-border" />
            <PreviewToolButton icon="x-circle" label="Zoom Out" onClick={() => setZoom((z) => Math.max(50, z - 10))} />
            <span className="w-11 text-center text-[12px] font-semibold text-muted">{zoom}%</span>
            <PreviewToolButton icon="allowance" label="Zoom In" onClick={() => setZoom((z) => Math.min(150, z + 10))} />
            <PreviewToolButton icon="chevron-double-left" label="Fit to Width" onClick={() => setZoom(100)} />
            <span className="mx-1 h-6 w-px bg-border" />
            <PreviewToolButton icon="attendance" label="Refresh" onClick={() => announce("Salary slip refreshed.")} />
          </div>

          {/* PDF-style preview */}
          <div className="overflow-auto rounded-xl border border-border bg-canvas p-6">
            <div
              className="mx-auto origin-top rounded-[4px] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.12)] transition-transform"
              style={{ width: 640, transform: `scale(${zoom / 100})` }}
            >
              <div className="flex items-center gap-3 border-b border-border-soft pb-4">
                <Image src="/mhada-emblem.png" alt="MHADA" width={476} height={498} className="h-11 w-11 object-contain" />
                <div>
                  <div className="disp text-[15px] font-bold text-ink">
                    Maharashtra Housing &amp; Area Development Authority
                  </div>
                  <div className="text-[11.5px] text-muted">Salary Slip — {month} {year} ({billType})</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12px]">
                <SlipField label="Employee Name" value={CURRENT_EMPLOYEE.name} />
                <SlipField label="Employee ID" value={CURRENT_EMPLOYEE.id} />
                <SlipField label="Designation" value={CURRENT_EMPLOYEE.designation} />
                <SlipField label="Department" value={CURRENT_EMPLOYEE.department} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <div className="rounded-t-[6px] bg-primary px-3 py-1.5 text-[11px] font-bold text-white uppercase">Earnings</div>
                  <table className="w-full border border-t-0 border-border-soft text-[12px]">
                    <tbody>
                      {EARNINGS.map((e) => (
                        <tr key={e.label} className="border-b border-border-soft last:border-0">
                          <td className="px-2.5 py-1.5 text-ink">{e.label}</td>
                          <td className="px-2.5 py-1.5 text-right text-ink">{e.amount.toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                      <tr className="bg-canvas font-semibold">
                        <td className="px-2.5 py-1.5 text-ink">Gross Salary</td>
                        <td className="px-2.5 py-1.5 text-right text-ink">{grossTotal.toLocaleString("en-IN")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <div className="rounded-t-[6px] bg-[#2E6DA4] px-3 py-1.5 text-[11px] font-bold text-white uppercase">Deductions</div>
                  <table className="w-full border border-t-0 border-border-soft text-[12px]">
                    <tbody>
                      {DEDUCTIONS.map((d) => (
                        <tr key={d.label} className="border-b border-border-soft last:border-0">
                          <td className="px-2.5 py-1.5 text-ink">{d.label}</td>
                          <td className="px-2.5 py-1.5 text-right text-ink">{d.amount.toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                      <tr className="bg-canvas font-semibold">
                        <td className="px-2.5 py-1.5 text-ink">Total Deductions</td>
                        <td className="px-2.5 py-1.5 text-right text-ink">{deductionTotal.toLocaleString("en-IN")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-[8px] bg-primary-tint px-4 py-2.5">
                <span className="text-[12.5px] font-semibold text-primary">Net Salary</span>
                <span className="disp text-[16px] font-bold text-primary">₹{netTotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 border-t border-border-soft pt-3 text-[12px]">
                <SlipField label="Bank Name" value="Bank of Maharashtra" />
                <SlipField label="Account Number" value="60XXXXXXXX12" />
              </div>

              <div className="mt-6 flex items-end justify-between text-[11px] text-muted">
                <span>Generated on {new Date().toISOString().slice(0, 10)}</span>
                <span className="border-t border-ink pt-1 text-center">Authorised Signatory</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="disp mb-3 text-[16px] font-semibold text-ink">Salary Slip History</h2>

        <div className="mb-3 rounded-xl border border-border bg-surface p-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-2">
                <Icon name="search" className="h-4 w-4" />
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search…"
                className="h-9.5 w-full rounded-[9px] border-[1.5px] border-border bg-white pr-3 pl-9 text-[13px] text-ink placeholder:text-muted-2 focus:border-primary focus:outline-none"
              />
            </div>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setPage(1);
              }}
              className="h-9.5 rounded-[9px] border-[1.5px] border-border bg-white px-3 text-[13px] text-ink focus:border-primary focus:outline-none"
            >
              <option value="All">All Years</option>
              {YEARS.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
            <select
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setPage(1);
              }}
              className="h-9.5 rounded-[9px] border-[1.5px] border-border bg-white px-3 text-[13px] text-ink focus:border-primary focus:outline-none"
            >
              <option value="All">All Months</option>
              {MONTHS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <select
              value={billTypeFilter}
              onChange={(e) => {
                setBillTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-9.5 rounded-[9px] border-[1.5px] border-border bg-white px-3 text-[13px] text-ink focus:border-primary focus:outline-none"
            >
              <option value="All">All Bill Types</option>
              {BILL_TYPES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="sticky top-0 z-10 border-b border-border-soft bg-border-soft/70 backdrop-blur">
                  <SortableTh label="Salary Month" active={sortKey === "month"} dir={sortDir} onClick={() => toggleSort("month")} />
                  <Th>Salary Year</Th>
                  <Th>Bill Type</Th>
                  <SortableTh label="Generated Date" active={sortKey === "generatedOn"} dir={sortDir} onClick={() => toggleSort("generatedOn")} />
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted">
                      No salary slips match the current filters.
                    </td>
                  </tr>
                )}
                {pageRows.map((r, i) => (
                  <tr key={r.id} className={`border-b border-border-soft transition-colors last:border-0 hover:bg-primary-tint/50 ${i % 2 === 1 ? "bg-canvas/60" : "bg-surface"}`}>
                    <td className="px-3.5 py-2.5 font-medium text-ink">{r.month}</td>
                    <td className="px-3.5 py-2.5 text-muted">{r.year}</td>
                    <td className="px-3.5 py-2.5 text-muted">{r.billType}</td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">{r.generatedOn}</td>
                    <td className="px-3.5 py-2.5">
                      <StatusBadge label={r.status} tone={statusTone(r.status)} />
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setMonth(r.month);
                            setYear(r.year);
                            setBillType(r.billType);
                            handleView();
                          }}
                          title="View PDF"
                          aria-label={`View salary slip for ${r.month} ${r.year}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
                        >
                          <Icon name="eye" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => announce("PDF download isn't available in this preview.")}
                          title="Download PDF"
                          aria-label={`Download salary slip for ${r.month} ${r.year}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
                        >
                          <Icon name="salary-slip" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          title="Print"
                          aria-label={`Print salary slip for ${r.month} ${r.year}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
                        >
                          <Icon name="printer" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DataTablePagination
            page={safePage}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            onGoTo={setPage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(n) => {
              setRowsPerPage(n);
              setPage(1);
            }}
            start={start}
            end={end}
            total={filtered.length}
            itemLabel="salary slips"
          />
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-[9px] border-[1.5px] border-border bg-white px-3 py-2.5 pr-9 text-[13.5px] text-ink outline-none focus:border-primary"
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-2">
          <Icon name="chevron" className="h-3.5 w-3.5 rotate-90" />
        </span>
      </div>
    </div>
  );
}

function PreviewToolButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-8 items-center gap-1.5 rounded-[7px] px-2.5 text-[12px] font-semibold text-ink hover:bg-canvas"
    >
      <Icon name={icon} className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function SlipField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3.5 py-2.5 text-left text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-muted uppercase">
      {children}
    </th>
  );
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th className="px-3.5 py-2.5 text-left text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-muted uppercase">
      <button type="button" onClick={onClick} className="flex items-center gap-1 hover:text-ink">
        {label}
        <Icon
          name="chevron"
          className={`h-3 w-3 transition-transform ${active ? "text-primary" : "text-muted-2"} ${
            active && dir === "asc" ? "-rotate-90" : active && dir === "desc" ? "rotate-90" : "rotate-90 opacity-40"
          }`}
        />
      </button>
    </th>
  );
}

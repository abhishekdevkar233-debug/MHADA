"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import KPICard from "@/components/KPICard";
import SearchableSelect from "@/components/SearchableSelect";
import StatusBadge from "@/components/StatusBadge";
import DataTablePagination from "@/components/DataTablePagination";
import { Toast } from "@/components/form/Field";
import { EMPLOYEE_DIRECTORY } from "@/lib/employee-directory";

const FINANCIAL_YEARS = ["2026-27", "2025-26", "2024-25"];
const MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
const BILL_TYPES = ["Regular", "Arrears", "Supplementary", "Provisional"];
const BILL_NUMBERS = ["BILL/2026/0417", "BILL/2026/0398", "BILL/2026/0372", "BILL/2026/0341"];
const REPORT_TYPES = ["Summary", "Detailed", "Department-wise"];

const DEDUCTION_TYPES = ["CPF", "GIS", "Income Tax", "Professional Tax", "LIC", "Society Loan", "Bank Recovery"];

type HistoryRow = {
  id: string;
  reportName: string;
  month: string;
  year: string;
  billType: string;
  reportType: string;
  generatedOn: string;
  generatedBy: string;
  status: "Generated" | "Pending" | "Failed";
};

const HISTORY: HistoryRow[] = [
  { id: "R-1", reportName: "All Deductions Report — June 2026", month: "June", year: "2026", billType: "Regular", reportType: "Summary", generatedOn: "2026-06-30", generatedBy: "Mumbai Division", status: "Generated" },
  { id: "R-2", reportName: "All Deductions Report — May 2026", month: "May", year: "2026", billType: "Regular", reportType: "Detailed", generatedOn: "2026-05-31", generatedBy: "Mumbai Division", status: "Generated" },
  { id: "R-3", reportName: "All Deductions Report — April 2026", month: "April", year: "2026", billType: "Regular", reportType: "Summary", generatedOn: "2026-04-30", generatedBy: "Mumbai Division", status: "Generated" },
  { id: "R-4", reportName: "All Deductions Report — March 2026 Arrears", month: "March", year: "2026", billType: "Arrears", reportType: "Department-wise", generatedOn: "2026-03-28", generatedBy: "Konkan Division", status: "Generated" },
  { id: "R-5", reportName: "All Deductions Report — July 2026", month: "July", year: "2026", billType: "Regular", reportType: "Summary", generatedOn: "—", generatedBy: "—", status: "Pending" },
];

function statusTone(status: HistoryRow["status"]) {
  if (status === "Generated") return "success" as const;
  if (status === "Failed") return "danger" as const;
  return "warning" as const;
}

function seedEmployeeDeductions() {
  return EMPLOYEE_DIRECTORY.slice(0, 8).map((e, i) => ({
    ...e,
    cpf: 3540,
    gis: 120,
    incomeTax: [0, 2500, 0, 1800, 0, 3200, 0, 0][i],
    pt: 200,
    total: 0,
  })).map((r) => ({ ...r, total: r.cpf + r.gis + r.incomeTax + r.pt }));
}

export default function AllDeductionsReport() {
  const [financialYear, setFinancialYear] = useState(FINANCIAL_YEARS[0]);
  const [salaryMonth, setSalaryMonth] = useState("June");
  const [billType, setBillType] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [shown, setShown] = useState(false);
  const [zoom, setZoom] = useState(100);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function announce(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  const rows = useMemo(() => seedEmployeeDeductions(), []);
  const grandTotal = rows.reduce((s, r) => s + r.total, 0);

  function handleShow() {
    if (!billType || !billNumber) {
      announce("Select a bill type and bill number to generate the report.");
      return;
    }
    setShown(true);
    setZoom(100);
    announce("Deduction report generated.");
  }

  function handleReset() {
    setFinancialYear(FINANCIAL_YEARS[0]);
    setSalaryMonth("June");
    setBillType("");
    setBillNumber("");
    setReportType(REPORT_TYPES[0]);
    setShown(false);
  }

  /* ---------------- History table ---------------- */
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [billTypeFilter, setBillTypeFilter] = useState("All");
  const [reportTypeFilter, setReportTypeFilter] = useState("All");
  const [sortKey, setSortKey] = useState<"reportName" | "generatedOn">("generatedOn");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return HISTORY.filter((r) => {
      const matchesSearch = q === "" || r.reportName.toLowerCase().includes(q);
      const matchesMonth = monthFilter === "All" || r.month === monthFilter;
      const matchesYear = yearFilter === "All" || r.year === yearFilter;
      const matchesBillType = billTypeFilter === "All" || r.billType === billTypeFilter;
      const matchesReportType = reportTypeFilter === "All" || r.reportType === reportTypeFilter;
      return matchesSearch && matchesMonth && matchesYear && matchesBillType && matchesReportType;
    }).sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      return a[sortKey] > b[sortKey] ? dir : a[sortKey] < b[sortKey] ? -dir : 0;
    });
  }, [search, monthFilter, yearFilter, billTypeFilter, reportTypeFilter, sortKey, sortDir]);

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
    <div className="mx-auto max-w-6xl">
      <PageHeader routeKey="ij-all-deductions-report" />

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)] sm:p-5">
        <h2 className="mb-4 text-[14px] font-semibold text-ink">Generate Deduction Report</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <FilterSelect label="Financial Year" value={financialYear} onChange={setFinancialYear} options={FINANCIAL_YEARS} />
          <FilterSelect label="Salary Month" value={salaryMonth} onChange={setSalaryMonth} options={MONTHS} />
          <SearchableSelect label="Bill Type" required value={billType} onChange={setBillType} options={BILL_TYPES} placeholder="Search bill type…" />
          <SearchableSelect label="Bill Number" required value={billNumber} onChange={setBillNumber} options={BILL_NUMBERS} placeholder="Search bill number…" />
          <FilterSelect label="Report Type" value={reportType} onChange={setReportType} options={REPORT_TYPES} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleShow}
            className="flex items-center gap-2 rounded-[9px] bg-primary px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-primary-dark"
          >
            <Icon name="bill-report" className="h-4 w-4" />
            Show Report
          </button>
          <button type="button" onClick={handleReset} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
            Reset
          </button>
          <button
            type="button"
            onClick={() => announce("Exporting to Excel…")}
            className="flex items-center gap-1.5 rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2"
          >
            <Icon name="salary-slip" className="h-4 w-4" />
            Export Excel
          </button>
        </div>
      </div>

      {shown && (
        <>
          {/* Summary cards */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KPICard label="Total Employees" value={String(rows.length)} icon="employee" />
            <KPICard label="Total Deduction Amount" value={`₹${grandTotal.toLocaleString("en-IN")}`} tone="accent" icon="money" />
            <KPICard label="Total Deduction Types" value={String(DEDUCTION_TYPES.length)} icon="deduction" />
            <KPICard label="Report Period" value={`${salaryMonth} ${financialYear.split("-")[0]}`} icon="attendance" />
          </div>

          {/* Toolbar */}
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
            <PreviewToolButton icon="attendance" label="Refresh Preview" onClick={() => announce("Preview refreshed.")} />
          </div>

          {/* Embedded PDF-style preview */}
          <div className="mb-6 overflow-auto rounded-xl border border-border bg-canvas p-6">
            <div
              className="mx-auto origin-top rounded-[4px] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.12)] transition-transform"
              style={{ width: 760, transform: `scale(${zoom / 100})` }}
            >
              <div className="flex items-center gap-3 border-b border-border-soft pb-4">
                <Image src="/mhada-emblem.png" alt="MHADA" width={476} height={498} className="h-11 w-11 object-contain" />
                <div>
                  <div className="disp text-[15px] font-bold text-ink">Maharashtra Housing &amp; Area Development Authority</div>
                  <div className="text-[11.5px] text-muted">All Deductions Report</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-x-6 gap-y-1.5 text-[12px]">
                <SlipField label="Financial Year" value={financialYear} />
                <SlipField label="Salary Month" value={salaryMonth} />
                <SlipField label="Bill Type" value={billType} />
                <SlipField label="Bill Number" value={billNumber} />
                <SlipField label="Report Type" value={reportType} />
              </div>

              <table className="mt-4 w-full border border-border-soft text-[11.5px]">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="px-2.5 py-1.5 text-left">Emp. ID</th>
                    <th className="px-2.5 py-1.5 text-left">Employee Name</th>
                    <th className="px-2.5 py-1.5 text-right">CPF</th>
                    <th className="px-2.5 py-1.5 text-right">GIS</th>
                    <th className="px-2.5 py-1.5 text-right">Income Tax</th>
                    <th className="px-2.5 py-1.5 text-right">PT</th>
                    <th className="px-2.5 py-1.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 1 ? "bg-canvas" : ""}>
                      <td className="border-t border-border-soft px-2.5 py-1.5 font-mono">{r.id}</td>
                      <td className="border-t border-border-soft px-2.5 py-1.5">{r.name}</td>
                      <td className="border-t border-border-soft px-2.5 py-1.5 text-right">{r.cpf.toLocaleString("en-IN")}</td>
                      <td className="border-t border-border-soft px-2.5 py-1.5 text-right">{r.gis.toLocaleString("en-IN")}</td>
                      <td className="border-t border-border-soft px-2.5 py-1.5 text-right">{r.incomeTax.toLocaleString("en-IN")}</td>
                      <td className="border-t border-border-soft px-2.5 py-1.5 text-right">{r.pt.toLocaleString("en-IN")}</td>
                      <td className="border-t border-border-soft px-2.5 py-1.5 text-right font-semibold">{r.total.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                  <tr className="bg-primary-tint font-bold">
                    <td colSpan={6} className="border-t border-border px-2.5 py-2 text-right text-primary">
                      Grand Total
                    </td>
                    <td className="border-t border-border px-2.5 py-2 text-right text-primary">{grandTotal.toLocaleString("en-IN")}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-6 flex items-end justify-between text-[11px] text-muted">
                <span>
                  Generated on {new Date().toISOString().slice(0, 10)}
                  <br />
                  Generated by Mumbai Division
                </span>
                <span className="border-t border-ink pt-1 text-center">Approving Authority</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recent Generated Reports */}
      <div>
        <h2 className="disp mb-3 text-[16px] font-semibold text-ink">Recent Generated Reports</h2>

        <div className="mb-3 rounded-xl border border-border bg-surface p-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className="relative lg:col-span-2">
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
                placeholder="Search reports…"
                className="h-9.5 w-full rounded-[9px] border-[1.5px] border-border bg-white pr-3 pl-9 text-[13px] text-ink placeholder:text-muted-2 focus:border-primary focus:outline-none"
              />
            </div>
            <FilterSelectCompact value={monthFilter} onChange={(v) => { setMonthFilter(v); setPage(1); }} options={MONTHS} allLabel="All Months" />
            <FilterSelectCompact value={yearFilter} onChange={(v) => { setYearFilter(v); setPage(1); }} options={["2026", "2025", "2024"]} allLabel="All Years" />
            <FilterSelectCompact value={billTypeFilter} onChange={(v) => { setBillTypeFilter(v); setPage(1); }} options={BILL_TYPES} allLabel="All Bill Types" />
            <FilterSelectCompact value={reportTypeFilter} onChange={(v) => { setReportTypeFilter(v); setPage(1); }} options={REPORT_TYPES} allLabel="All Report Types" />
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => announce("Exporting report list…")}
              className="flex h-8 items-center gap-1.5 rounded-[7px] border-[1.5px] border-border px-3 text-[12px] font-semibold text-ink hover:border-muted-2"
            >
              <Icon name="salary-slip" className="h-3.5 w-3.5" />
              Export
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setMonthFilter("All");
                setYearFilter("All");
                setBillTypeFilter("All");
                setReportTypeFilter("All");
                setPage(1);
              }}
              className="flex h-8 items-center gap-1.5 rounded-[7px] border-[1.5px] border-border px-3 text-[12px] font-semibold text-ink hover:border-muted-2"
            >
              <Icon name="x-circle" className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
          <div className="max-h-[480px] overflow-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="sticky top-0 z-10 border-b border-border-soft bg-border-soft/70 backdrop-blur">
                  <SortableTh label="Report Name" active={sortKey === "reportName"} dir={sortDir} onClick={() => toggleSort("reportName")} />
                  <Th>Month</Th>
                  <Th>Year</Th>
                  <Th>Bill Type</Th>
                  <SortableTh label="Generated Date" active={sortKey === "generatedOn"} dir={sortDir} onClick={() => toggleSort("generatedOn")} />
                  <Th>Generated By</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted">
                      No reports match the current filters.
                    </td>
                  </tr>
                )}
                {pageRows.map((r, i) => (
                  <tr key={r.id} className={`border-b border-border-soft transition-colors last:border-0 hover:bg-primary-tint/50 ${i % 2 === 1 ? "bg-canvas/60" : "bg-surface"}`}>
                    <td className="px-3.5 py-2.5 font-medium text-ink">{r.reportName}</td>
                    <td className="px-3.5 py-2.5 text-muted">{r.month}</td>
                    <td className="px-3.5 py-2.5 text-muted">{r.year}</td>
                    <td className="px-3.5 py-2.5 text-muted">{r.billType}</td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">{r.generatedOn}</td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">{r.generatedBy}</td>
                    <td className="px-3.5 py-2.5">
                      <StatusBadge label={r.status} tone={statusTone(r.status)} />
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <RowIconButton icon="eye" label="View PDF" onClick={() => announce(`Viewing ${r.reportName}…`)} />
                        <RowIconButton icon="salary-slip" label="Download PDF" onClick={() => announce("PDF download isn't available in this preview.")} />
                        <RowIconButton icon="printer" label="Print" onClick={() => window.print()} />
                        <RowIconButton icon="attendance" label="Regenerate" onClick={() => announce(`Regenerating ${r.reportName}…`)} />
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
            itemLabel="reports"
          />
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none rounded-[9px] border-[1.5px] border-border bg-white px-3 py-2.5 pr-9 text-[13.5px] text-ink outline-none focus:border-primary">
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

function FilterSelectCompact({ value, onChange, options, allLabel }: { value: string; onChange: (v: string) => void; options: string[]; allLabel: string }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9.5 w-full appearance-none rounded-[9px] border-[1.5px] border-border bg-white px-3 pr-9 text-[13px] text-ink focus:border-primary focus:outline-none">
        <option value="All">{allLabel}</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-2">
        <Icon name="chevron" className="h-3.5 w-3.5 rotate-90" />
      </span>
    </div>
  );
}

function PreviewToolButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} title={label} className="flex h-8 items-center gap-1.5 rounded-[7px] px-2.5 text-[12px] font-semibold text-ink hover:bg-canvas">
      <Icon name={icon} className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function RowIconButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink">
      <Icon name={icon} className="h-3.5 w-3.5" />
    </button>
  );
}

function SlipField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-ink">{value || "—"}</span>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3.5 py-2.5 text-left text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-muted uppercase">{children}</th>;
}

function SortableTh({ label, active, dir, onClick }: { label: string; active: boolean; dir: "asc" | "desc"; onClick: () => void }) {
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

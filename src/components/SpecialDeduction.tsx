"use client";

import { useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import DataTablePagination from "@/components/DataTablePagination";
import { Toast } from "@/components/form/Field";
import { EMPLOYEE_DIRECTORY } from "@/lib/employee-directory";

const YEARS = ["2026", "2025", "2024"];
const MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
const DEPARTMENTS = ["Mumbai Board", "Konkan Board", "Pune Board", "Nagpur Board", "Nashik Board"];
const DIVISIONS = ["Zone 1", "Zone 2", "Zone 3", "Zone 4"];

type DeductionType = "Day" | "Amount";

function seedEmployees() {
  return EMPLOYEE_DIRECTORY.map((e, i) => ({
    ...e,
    division: DIVISIONS[i % DIVISIONS.length],
    status: i % 7 === 6 ? "Inactive" : "Active",
  }));
}

export default function SpecialDeduction() {
  const [year, setYear] = useState(YEARS[0]);
  const [month, setMonth] = useState("June");
  const [deductionType, setDeductionType] = useState<DeductionType>("Day");
  const [department, setDepartment] = useState("");
  const [division, setDivision] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [days, setDays] = useState("");
  const [amount, setAmount] = useState("");

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function announce(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  const allEmployees = useMemo(() => seedEmployees(), []);

  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();
    return allEmployees.filter((e) => {
      const matchesDept = !department || e.department === department;
      const matchesDiv = !division || e.division === division;
      const matchesSearch = q === "" || e.name.toLowerCase().includes(q) || e.id.includes(q);
      return matchesDept && matchesDiv && matchesSearch;
    });
  }, [allEmployees, department, division, employeeSearch]);

  function handleLoad() {
    setLoaded(true);
    setSelected(new Set());
    announce(`Loaded ${filteredEmployees.length} employees.`);
  }

  function handleReset() {
    setYear(YEARS[0]);
    setMonth("June");
    setDeductionType("Day");
    setDepartment("");
    setDivision("");
    setEmployeeSearch("");
    setLoaded(false);
    setSelected(new Set());
    setDays("");
    setAmount("");
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllOnPage(ids: string[], checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  }

  function handleSave() {
    if (selected.size === 0) {
      announce("Select at least one employee.");
      return;
    }
    const value = deductionType === "Day" ? days : amount;
    if (!value) {
      announce(`Enter the ${deductionType === "Day" ? "number of days" : "amount"}.`);
      return;
    }
    announce(`Special deduction saved for ${selected.size} employee${selected.size === 1 ? "" : "s"}.`);
  }

  /* ---------------- Employee list pagination ---------------- */
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = filteredEmployees.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const end = Math.min(safePage * rowsPerPage, filteredEmployees.length);
  const pageRows = filteredEmployees.slice(start - 1, end);
  const pageIds = pageRows.map((e) => e.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const selectedValue = deductionType === "Day" ? days : amount;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader routeKey="special-deduction" title="Special Deduction Assignment" />

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)] sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <FilterSelect label="Year" value={year} onChange={setYear} options={YEARS} />
          <FilterSelect label="Month" value={month} onChange={setMonth} options={MONTHS} />
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">Deduction Type</label>
            <div className="flex h-[42px] items-center gap-4">
              {(["Day", "Amount"] as DeductionType[]).map((t) => (
                <label key={t} className="flex items-center gap-1.5 text-[13px] text-ink">
                  <input
                    type="radio"
                    name="deduction-type"
                    checked={deductionType === t}
                    onChange={() => setDeductionType(t)}
                    className="h-4 w-4 accent-accent"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <FilterSelectOptional label="Department" value={department} onChange={setDepartment} options={DEPARTMENTS} />
          <FilterSelectOptional label="Division" value={division} onChange={setDivision} options={DIVISIONS} />
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">Employee Search</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-2">
                <Icon name="search" className="h-4 w-4" />
              </span>
              <input
                type="search"
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                placeholder="Name or Employee ID"
                className="w-full rounded-[9px] border-[1.5px] border-border bg-white py-2.5 pr-3 pl-9 text-[13.5px] text-ink outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5">
          <button type="button" onClick={handleReset} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
            Reset
          </button>
          <button type="button" onClick={handleLoad} className="flex items-center gap-2 rounded-[9px] bg-primary px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-primary-dark">
            <Icon name="employee" className="h-4 w-4" />
            Load Employees
          </button>
        </div>
      </div>

      {loaded && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          {/* Employee Selection */}
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
            <div className="flex items-center justify-between border-b border-border-soft px-4 py-3">
              <h2 className="text-[14px] font-semibold text-ink">Employee Selection</h2>
              <span className="rounded-full bg-primary-tint px-3 py-1 text-[12px] font-semibold text-primary">
                {selected.size} Selected
              </span>
            </div>
            <div className="max-h-[480px] overflow-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="sticky top-0 z-10 border-b border-border-soft bg-border-soft/70 backdrop-blur">
                    <th className="px-3.5 py-2.5">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={(e) => toggleAllOnPage(pageIds, e.target.checked)}
                        className="h-4 w-4 accent-accent"
                        aria-label="Select all on this page"
                      />
                    </th>
                    <Th>Employee ID</Th>
                    <Th>Employee Name</Th>
                    <Th>Department</Th>
                    <Th>Division</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted">
                        No employees match the current filters.
                      </td>
                    </tr>
                  )}
                  {pageRows.map((e, i) => (
                    <tr
                      key={e.id}
                      onClick={() => toggleOne(e.id)}
                      className={`cursor-pointer border-b border-border-soft transition-colors last:border-0 hover:bg-primary-tint/50 ${
                        i % 2 === 1 ? "bg-canvas/60" : "bg-surface"
                      }`}
                    >
                      <td className="px-3.5 py-2.5" onClick={(ev) => ev.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(e.id)}
                          onChange={() => toggleOne(e.id)}
                          className="h-4 w-4 accent-accent"
                          aria-label={`Select ${e.name}`}
                        />
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-[12px] text-muted-2">{e.id}</td>
                      <td className="px-3.5 py-2.5 font-medium text-ink">{e.name}</td>
                      <td className="px-3.5 py-2.5 text-muted">{e.department}</td>
                      <td className="px-3.5 py-2.5 text-muted">{e.division}</td>
                      <td className="px-3.5 py-2.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            e.status === "Active" ? "bg-primary-tint text-primary" : "bg-border-soft text-muted"
                          }`}
                        >
                          {e.status}
                        </span>
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
              total={filteredEmployees.length}
              itemLabel="employees"
            />
          </div>

          {/* Deduction Details */}
          <div className="h-fit rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)] sm:p-5">
            <h2 className="mb-4 text-[14px] font-semibold text-ink">Deduction Details</h2>

            {deductionType === "Day" ? (
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">Days</label>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full rounded-[9px] border-[1.5px] border-border bg-white px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-primary"
                />
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full rounded-[9px] border-[1.5px] border-border bg-white px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-primary"
                />
              </div>
            )}

            <div className="mt-5 space-y-2 rounded-xl bg-canvas px-4 py-3.5 text-[12.5px]">
              <SummaryRow label="Year" value={year} />
              <SummaryRow label="Month" value={month} />
              <SummaryRow label="Deduction Type" value={deductionType} />
              <SummaryRow label={deductionType === "Day" ? "Days" : "Amount"} value={selectedValue || "—"} />
              <SummaryRow label="Employees Selected" value={String(selected.size)} />
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center justify-center gap-2 rounded-[9px] bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-accent-dark"
              >
                <Icon name="bill-create" className="h-4 w-4" />
                Save Special Deduction
              </button>
              <button type="button" onClick={handleReset} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

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

function FilterSelectOptional({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none rounded-[9px] border-[1.5px] border-border bg-white px-3 py-2.5 pr-9 text-[13.5px] text-ink outline-none focus:border-primary">
          <option value="">All</option>
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3.5 py-2.5 text-left text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-muted uppercase">{children}</th>;
}

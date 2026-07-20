"use client";

import { useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import {
  SectionTitle,
  TextField,
  TextAreaField,
  DateField,
  Toast,
} from "@/components/form/Field";
import EmployeeSearchCard from "@/components/EmployeeSearchCard";
import DataTablePagination from "@/components/DataTablePagination";
import type { DirectoryEmployee } from "@/lib/employee-directory";

const RETIREMENT_TYPES = ["Superannuation", "Voluntary", "Compulsory", "Medical"];
const RETIREMENT_AGE = 60;

/** Mock joining/DOB derivation for the read-only panel — not part of the shared directory model. */
function serviceDetails(e: DirectoryEmployee) {
  const seed = Number(e.id) % 1000;
  const dobYear = 1963 + (seed % 8);
  const joinYear = dobYear + 24 + (seed % 4);
  const dob = `${dobYear}-0${1 + (seed % 9) - (seed % 9 === 9 ? 1 : 0)}-1${seed % 9}`.slice(0, 10);
  const doj = `${joinYear}-0${1 + (seed % 8)}-0${1 + (seed % 8)}`.slice(0, 10);
  const expectedRetirement = `${dobYear + RETIREMENT_AGE}-0${1 + (seed % 9) - (seed % 9 === 9 ? 1 : 0)}-1${seed % 9}`.slice(0, 10);
  return { dob, doj, expectedRetirement };
}

type RetirementRecord = {
  id: string;
  employeeName: string;
  designation: string;
  department: string;
  retirementType: string;
  retirementDate: string;
  orderNumber: string;
  orderDate: string;
  pensionStatus: string;
  benefitsStatus: string;
  overallStatus: "Initiated" | "In Progress" | "Approved" | "Completed";
};

const HISTORY: RetirementRecord[] = [
  { id: "R-3301", employeeName: "Ramakant Bhalchandra Meher", designation: "Superintendent", department: "Nashik Board", retirementType: "Superannuation", retirementDate: "2024-05-31", orderNumber: "MHADA/RT/2024/0041", orderDate: "2024-04-10", pensionStatus: "Completed", benefitsStatus: "Completed", overallStatus: "Completed" },
  { id: "R-3302", employeeName: "Shri Yashwant Ganpat Gosavi", designation: "Section Officer", department: "Pune Board", retirementType: "Voluntary", retirementDate: "2025-01-15", orderNumber: "MHADA/RT/2025/0006", orderDate: "2024-11-20", pensionStatus: "In Progress", benefitsStatus: "In Progress", overallStatus: "Approved" },
  { id: "R-3303", employeeName: "Abdul Raheman Abdul Razzak", designation: "Section Officer", department: "Mumbai Board", retirementType: "Superannuation", retirementDate: "2025-09-30", orderNumber: "—", orderDate: "—", pensionStatus: "Not Started", benefitsStatus: "Not Started", overallStatus: "Initiated" },
  { id: "R-3304", employeeName: "Madhuri Sachin Zele", designation: "Stenographer", department: "Mumbai Board", retirementType: "Medical", retirementDate: "2025-03-01", orderNumber: "MHADA/RT/2025/0011", orderDate: "2025-01-18", pensionStatus: "In Progress", benefitsStatus: "Not Started", overallStatus: "In Progress" },
  { id: "R-3305", employeeName: "Kalpana Nandan Pawar", designation: "Accountant", department: "Konkan Board", retirementType: "Superannuation", retirementDate: "2026-02-28", orderNumber: "—", orderDate: "—", pensionStatus: "Not Started", benefitsStatus: "Not Started", overallStatus: "Initiated" },
  { id: "R-3306", employeeName: "Bhagwan Maruti Sawant", designation: "Junior Engineer", department: "Mumbai Board", retirementType: "Compulsory", retirementDate: "2024-08-12", orderNumber: "MHADA/RT/2024/0067", orderDate: "2024-07-02", pensionStatus: "Completed", benefitsStatus: "Completed", overallStatus: "Completed" },
];

export default function EmployeeRetirement() {
  const [employee, setEmployee] = useState<DirectoryEmployee | null>(null);

  const [retiredDate, setRetiredDate] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function announce(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  function resetForm() {
    setRetiredDate("");
    setOrderNumber("");
    setOrderDate("");
    setRemarks("");
    setErrors({});
  }

  function handleSelectEmployee(e: DirectoryEmployee | null) {
    setEmployee(e);
    resetForm();
  }

  function handleCancel() {
    setEmployee(null);
    resetForm();
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!retiredDate) next.retiredDate = "Retired date is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSaveDraft() {
    announce(`Draft saved for ${employee?.name}.`);
  }

  function handleSubmit() {
    if (!validate()) return;
    announce(`Retirement submitted for approval — ${employee?.name}.`);
  }

  const service = employee ? serviceDetails(employee) : null;

  /* ---------------- History table: filters, sort, pagination ---------------- */
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<"employeeName" | "retirementDate">("retirementDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return HISTORY.filter((r) => {
      const matchesSearch = q === "" || r.employeeName.toLowerCase().includes(q);
      const matchesType = typeFilter === "All" || r.retirementType === typeFilter;
      const matchesStatus = statusFilter === "All" || r.overallStatus === statusFilter;
      const matchesFrom = !dateFrom || r.retirementDate >= dateFrom;
      const matchesTo = !dateTo || r.retirementDate <= dateTo;
      return matchesSearch && matchesType && matchesStatus && matchesFrom && matchesTo;
    }).sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      return a[sortKey] > b[sortKey] ? dir : a[sortKey] < b[sortKey] ? -dir : 0;
    });
  }, [search, typeFilter, statusFilter, dateFrom, dateTo, sortKey, sortDir]);

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

  function clearFilters() {
    setSearch("");
    setTypeFilter("All");
    setStatusFilter("All");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        routeKey="retirement"
        subtitle="Search for an employee and record their retirement order details."
      />

      <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)] sm:p-6">
        <SectionTitle>Employee</SectionTitle>
        <EmployeeSearchCard employee={employee} onSelect={handleSelectEmployee} required />

        {employee && service && (
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl bg-canvas px-4 py-3.5 sm:grid-cols-3 lg:grid-cols-5">
            <ReadOnlyStat label="Employee ID" value={employee.id} />
            <ReadOnlyStat label="Employee Name" value={employee.name} />
            <ReadOnlyStat label="Designation" value={employee.designation} />
            <ReadOnlyStat label="Department" value={employee.department} />
            <ReadOnlyStat label="Date of Joining" value={service.doj} />
            <ReadOnlyStat label="Date of Birth" value={service.dob} />
            <ReadOnlyStat label="Retirement Age" value={`${RETIREMENT_AGE} years`} />
            <ReadOnlyStat label="Expected Retirement Date" value={service.expectedRetirement} />
          </div>
        )}

        <div className={`mt-6 ${employee ? "" : "pointer-events-none opacity-40"}`}>
          <SectionTitle>Retirement Details</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DateField label="Retired Date" required value={retiredDate} onChange={setRetiredDate} error={errors.retiredDate} />
            <TextField label="Retirement Order No." value={orderNumber} onChange={setOrderNumber} placeholder="e.g. MHADA/RT/2026/0001" />
            <DateField label="Date of Retirement Order" value={orderDate} onChange={setOrderDate} />
          </div>

          <div className="mt-5">
            <TextAreaField label="Remarks" value={remarks} onChange={setRemarks} placeholder="Optional remarks…" rows={3} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5 border-t border-border-soft pt-5">
            <button type="button" onClick={handleCancel} className="rounded-[9px] border-[1.5px] border-border px-4 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
              Cancel
            </button>
            <button type="button" onClick={resetForm} className="rounded-[9px] border-[1.5px] border-border px-4 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
              Reset
            </button>
            <button type="button" onClick={handleSaveDraft} className="rounded-[9px] border-[1.5px] border-border px-4 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
              Save Draft
            </button>
            <button type="button" onClick={handleSubmit} className="flex items-center gap-2 rounded-[9px] bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-accent-dark">
              Submit for Approval
            </button>
          </div>
        </div>
      </div>

      {/* Retirement History */}
      <div className="mt-6">
        <h2 className="disp mb-3 text-[16px] font-semibold text-ink">Employee Retirement History</h2>

        <div className="mb-3 rounded-xl border border-border bg-surface p-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr_0.9fr_auto_auto_auto_auto]">
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
                placeholder="Search employee…"
                className="h-9.5 w-full rounded-[9px] border-[1.5px] border-border bg-white pr-3 pl-9 text-[13px] text-ink placeholder:text-muted-2 focus:border-primary focus:outline-none"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-9.5 rounded-[9px] border-[1.5px] border-border bg-white px-3 text-[13px] text-ink focus:border-primary focus:outline-none"
            >
              <option value="All">All Types</option>
              {RETIREMENT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9.5 rounded-[9px] border-[1.5px] border-border bg-white px-3 text-[13px] text-ink focus:border-primary focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option>Initiated</option>
              <option>In Progress</option>
              <option>Approved</option>
              <option>Completed</option>
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              aria-label="From date"
              className="h-9.5 rounded-[9px] border-[1.5px] border-border bg-white px-3 text-[13px] text-ink focus:border-primary focus:outline-none"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              aria-label="To date"
              className="h-9.5 rounded-[9px] border-[1.5px] border-border bg-white px-3 text-[13px] text-ink focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={() => announce("Exporting retirement history…")}
              className="flex h-9.5 items-center justify-center gap-1.5 rounded-[9px] border-[1.5px] border-border px-3.5 text-[13px] font-semibold text-ink hover:border-muted-2"
            >
              <Icon name="salary-slip" className="h-3.5 w-3.5" />
              Export
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="flex h-9.5 items-center justify-center gap-1.5 rounded-[9px] border-[1.5px] border-border px-3.5 text-[13px] font-semibold text-ink hover:border-muted-2"
            >
              <Icon name="x-circle" className="h-3.5 w-3.5" />
              Clear Filters
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="sticky top-0 z-10 border-b border-border-soft bg-border-soft/70 backdrop-blur">
                  <SortableTh label="Employee Name" active={sortKey === "employeeName"} dir={sortDir} onClick={() => toggleSort("employeeName")} />
                  <Th>Designation</Th>
                  <Th>Department</Th>
                  <Th>Retirement Type</Th>
                  <SortableTh label="Retirement Date" active={sortKey === "retirementDate"} dir={sortDir} onClick={() => toggleSort("retirementDate")} />
                  <Th>Order Number</Th>
                  <Th>Order Date</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted">
                      No retirement records match the current filters.
                    </td>
                  </tr>
                )}
                {pageRows.map((r, i) => (
                  <tr key={r.id} className={`border-b border-border-soft transition-colors last:border-0 hover:bg-primary-tint/50 ${i % 2 === 1 ? "bg-canvas/60" : "bg-surface"}`}>
                    <td className="px-3.5 py-2.5 font-medium whitespace-nowrap text-ink">{r.employeeName}</td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">{r.designation}</td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">{r.department}</td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">{r.retirementType}</td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-ink">{r.retirementDate}</td>
                    <td className="px-3.5 py-2.5 font-mono whitespace-nowrap text-muted-2">{r.orderNumber}</td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">{r.orderDate}</td>
                    <td className="px-3.5 py-2.5">
                      <button
                        type="button"
                        onClick={() => announce(`Viewing retirement record ${r.id}…`)}
                        title="View"
                        aria-label={`View retirement record for ${r.employeeName}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
                      >
                        <Icon name="eye" className="h-4 w-4" />
                      </button>
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
            itemLabel="retirement records"
          />
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}

function ReadOnlyStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold tracking-[0.03em] text-muted-2 uppercase">{label}</div>
      <div className="mt-0.5 truncate text-[13px] font-medium text-ink">{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3.5 py-2.5 text-left text-[10.5px] font-semibold tracking-[0.04em] whitespace-nowrap text-muted uppercase">
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
    <th className="px-3.5 py-2.5 text-left text-[10.5px] font-semibold tracking-[0.04em] whitespace-nowrap text-muted uppercase">
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

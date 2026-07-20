"use client";

import { useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import KPICard from "@/components/KPICard";
import DataTablePagination from "@/components/DataTablePagination";
import { Toast } from "@/components/form/Field";
import { EMPLOYEE_DIRECTORY } from "@/lib/employee-directory";

const MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
const YEARS = ["2026", "2025", "2024"];
const DEPARTMENTS = ["Mumbai Board", "Konkan Board", "Pune Board", "Nagpur Board", "Nashik Board"];
const VIEWS = ["All Employees", "Need Review", "Present", "Absent", "On Leave"] as const;
const STATUSES = ["Present", "Leave", "Need Review"] as const;

type Status = (typeof STATUSES)[number];

type AttendanceRow = {
  id: string;
  name: string;
  department: string;
  biometricDays: number;
  totalDays: number;
  actualDays: number;
  leaveInfo: string;
  remarks: string;
  status: Status;
};

function seedRows(): AttendanceRow[] {
  const totalDays = 30;
  return EMPLOYEE_DIRECTORY.map((e, i) => {
    const pattern = i % 5;
    if (pattern === 0) {
      // biometric/actual mismatch — needs review
      return { ...e, biometricDays: 26, totalDays, actualDays: 28, leaveInfo: "—", remarks: "", status: "Need Review" as Status };
    }
    if (pattern === 1) {
      return { ...e, biometricDays: 22, totalDays, actualDays: 22, leaveInfo: "2 days CL, 6 days present via biometric gap", remarks: "", status: "Leave" as Status };
    }
    return { ...e, biometricDays: 30, totalDays, actualDays: 30, leaveInfo: "—", remarks: "", status: "Present" as Status };
  });
}

function statusBadge(status: Status) {
  if (status === "Present") return "bg-primary-tint text-primary";
  if (status === "Leave") return "bg-accent-tint text-accent-dark";
  return "bg-danger/10 text-danger";
}

export default function EmployeeAttendance() {
  const [month, setMonth] = useState("June");
  const [year, setYear] = useState(YEARS[0]);
  const [rows, setRows] = useState<AttendanceRow[]>(seedRows);

  const [search, setSearch] = useState("");
  const [view, setView] = useState<(typeof VIEWS)[number]>("Need Review");
  const [department, setDepartment] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedView, setAppliedView] = useState<(typeof VIEWS)[number]>("Need Review");
  const [appliedDepartment, setAppliedDepartment] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function announce(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  const summary = useMemo(() => {
    const total = rows.length;
    const present = rows.filter((r) => r.status === "Present").length;
    const onLeave = rows.filter((r) => r.status === "Leave").length;
    const needReview = rows.filter((r) => r.status === "Need Review").length;
    return { total, present, onLeave, needReview };
  }, [rows]);

  function applyFilters() {
    setAppliedSearch(search);
    setAppliedView(view);
    setAppliedDepartment(department);
    setAppliedStatus(statusFilter);
    setPage(1);
  }
  function resetFilters() {
    setSearch("");
    setView("Need Review");
    setDepartment("");
    setStatusFilter("");
    setAppliedSearch("");
    setAppliedView("Need Review");
    setAppliedDepartment("");
    setAppliedStatus("");
    setPage(1);
  }

  const filtered = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesSearch = q === "" || r.name.toLowerCase().includes(q) || r.id.includes(q) || r.department.toLowerCase().includes(q);
      const matchesView =
        appliedView === "All Employees" ||
        (appliedView === "Need Review" && r.status === "Need Review") ||
        (appliedView === "Present" && r.status === "Present") ||
        (appliedView === "On Leave" && r.status === "Leave") ||
        (appliedView === "Absent" && r.actualDays < r.totalDays && r.status !== "Leave");
      const matchesDept = !appliedDepartment || r.department === appliedDepartment;
      const matchesStatus = !appliedStatus || r.status === appliedStatus;
      return matchesSearch && matchesView && matchesDept && matchesStatus;
    });
  }, [rows, appliedSearch, appliedView, appliedDepartment, appliedStatus]);

  const [page, setPage] = useState(1);
  const rowsPerPage = 12;
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = filtered.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const end = Math.min(safePage * rowsPerPage, filtered.length);
  const pageRows = filtered.slice(start - 1, end);

  function updateActual(id: string, value: string) {
    const n = Number(value);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, actualDays: Number.isFinite(n) ? n : 0 } : r)));
  }
  function updateRemarks(id: string, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, remarks: value } : r)));
  }

  function handleSaveDraft() {
    announce("Attendance draft saved.");
  }
  function handleReset() {
    setRows(seedRows());
    announce("Attendance reset to imported values.");
  }
  function confirmFinalize() {
    setConfirmOpen(false);
    announce(`Attendance finalized for ${month} ${year}.`);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-border-soft px-3 py-1 text-[11.5px] font-medium text-muted-2">
          Operations <span>›</span> <span className="text-accent-dark">Employee Attendance</span>
        </div>
        <h1 className="disp mt-3 text-[22px] font-semibold text-ink">Employee Attendance</h1>
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-muted">
          Review biometric attendance, verify exceptions, and finalize monthly
          attendance for payroll processing.
        </p>
      </div>

      {/* Attendance Summary */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPICard label="Total Employees" value={String(summary.total)} icon="employee" />
        <KPICard label="Present" value={String(summary.present)} icon="attendance" tone="success" />
        <KPICard label="On Leave" value={String(summary.onLeave)} icon="leave-balance" tone="accent" />
        <KPICard label="Need Review" value={String(summary.needReview)} icon="help" tone="accent" />
      </div>

      {/* Payroll Period */}
      <div className="mb-5 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)] sm:p-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[auto_1fr_auto]">
          <div className="grid grid-cols-2 gap-3 sm:w-72">
            <FilterSelect label="Month" value={month} onChange={setMonth} options={MONTHS} />
            <FilterSelect label="Year" value={year} onChange={setYear} options={YEARS} />
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-x border-border-soft px-5 text-[12.5px] sm:grid-cols-3 lg:border-y-0">
            <BiometricStat label="Last Sync Time" value="2026-07-18 06:00 AM" />
            <BiometricStat label="Imported Records" value={`${summary.total}`} />
            <BiometricStat label="Pending Review Count" value={String(summary.needReview)} />
          </div>

          <div className="flex flex-col justify-center gap-2 lg:w-56">
            <button
              type="button"
              onClick={() => announce("Biometric attendance import started.")}
              className="flex items-center justify-center gap-2 rounded-[8px] bg-primary px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-primary-dark"
            >
              <Icon name="attendance" className="h-4 w-4" />
              Import Biometric Attendance
            </button>
            <button
              type="button"
              onClick={() => announce("Import history isn't available in this preview.")}
              className="rounded-[8px] border-[1.5px] border-border px-4 py-2 text-[13px] font-semibold text-ink hover:border-muted-2"
            >
              View Import History
            </button>
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="mb-4 rounded-xl border border-border bg-surface p-3.5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto_auto]">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-2">
              <Icon name="search" className="h-4 w-4" />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Employee ID, Employee Name or Department…"
              className="h-9.5 w-full rounded-[8px] border-[1.5px] border-border bg-white pr-3 pl-9 text-[13px] text-ink placeholder:text-muted-2 focus:border-primary focus:outline-none"
            />
          </div>
          <select value={view} onChange={(e) => setView(e.target.value as (typeof VIEWS)[number])} className="h-9.5 rounded-[8px] border-[1.5px] border-border bg-white px-3 text-[13px] text-ink focus:border-primary focus:outline-none">
            {VIEWS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="h-9.5 rounded-[8px] border-[1.5px] border-border bg-white px-3 text-[13px] text-ink focus:border-primary focus:outline-none">
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9.5 rounded-[8px] border-[1.5px] border-border bg-white px-3 text-[13px] text-ink focus:border-primary focus:outline-none">
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button type="button" onClick={applyFilters} className="flex h-9.5 items-center justify-center gap-1.5 rounded-[8px] bg-primary px-4 text-[13px] font-semibold text-white hover:bg-primary-dark">
            Apply Filters
          </button>
          <button type="button" onClick={resetFilters} className="flex h-9.5 items-center justify-center gap-1.5 rounded-[8px] border-[1.5px] border-border px-4 text-[13px] font-semibold text-ink hover:border-muted-2">
            Reset
          </button>
        </div>
      </div>

      {/* Attendance table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
        <div className="max-h-[560px] overflow-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-border-soft bg-border-soft/70 backdrop-blur">
                <Th>Employee ID</Th>
                <Th>Employee Name</Th>
                <Th>Department</Th>
                <Th>Biometric Attendance</Th>
                <Th>Actual Attendance</Th>
                <Th>Leave Information</Th>
                <Th>Remarks</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted">
                    No employees match the current filters.
                  </td>
                </tr>
              )}
              {pageRows.map((r, i) => (
                <tr key={r.id} className={`border-b border-border-soft transition-colors last:border-0 hover:bg-primary-tint/40 ${i % 2 === 1 ? "bg-canvas/60" : "bg-surface"}`}>
                  <td className="px-3.5 py-2.5 font-mono text-[12px] text-muted-2">{r.id}</td>
                  <td className="px-3.5 py-2.5 font-medium whitespace-nowrap text-ink">{r.name}</td>
                  <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">{r.department}</td>
                  <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">
                    {r.biometricDays}/{r.totalDays} days
                  </td>
                  <td className="px-3.5 py-2.5">
                    <input
                      type="number"
                      value={r.actualDays}
                      onChange={(e) => updateActual(r.id, e.target.value)}
                      className="w-20 rounded-[6px] border-[1.5px] border-border bg-white px-2 py-1.5 text-right text-[12.5px] text-ink outline-none focus:border-primary"
                    />
                  </td>
                  <td className="px-3.5 py-2.5 text-muted">{r.leaveInfo}</td>
                  <td className="px-3.5 py-2.5">
                    <input
                      value={r.remarks}
                      onChange={(e) => updateRemarks(r.id, e.target.value)}
                      placeholder="—"
                      className="w-32 rounded-[6px] border-[1.5px] border-border bg-white px-2 py-1.5 text-[12.5px] text-ink outline-none focus:border-primary"
                    />
                  </td>
                  <td className="px-3.5 py-2.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${statusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => announce(`Editing attendance for ${r.name}…`)}
                        title="Edit"
                        aria-label={`Edit attendance for ${r.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
                      >
                        <Icon name="pencil" className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => announce(`Viewing details for ${r.name}…`)}
                        title="View Details"
                        aria-label={`View details for ${r.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
                      >
                        <Icon name="eye" className="h-3.5 w-3.5" />
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
          onRowsPerPageChange={() => {}}
          rowsPerPageOptions={[12]}
          start={start}
          end={end}
          total={filtered.length}
          itemLabel="employees"
        />
      </div>

      {/* Bottom action bar */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
        <button type="button" onClick={handleReset} className="rounded-[8px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
          Reset
        </button>
        <button type="button" onClick={handleSaveDraft} className="rounded-[8px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex items-center gap-2 rounded-[8px] bg-accent px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-accent-dark"
        >
          <Icon name="attendance" className="h-4 w-4" />
          Finalize Attendance
        </button>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
            <h3 className="text-[16px] font-semibold text-ink">Finalize attendance?</h3>
            <p className="mt-1.5 text-[13px] text-muted">
              This will lock attendance for <span className="font-medium text-ink">{month} {year}</span> and
              make it available for payroll processing. {summary.needReview > 0 && (
                <span className="font-medium text-danger">{summary.needReview} employee(s) still need review.</span>
              )}
            </p>
            <div className="mt-5 flex gap-2.5">
              <button type="button" onClick={() => setConfirmOpen(false)} className="flex-1 rounded-[9px] border-[1.5px] border-border py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
                Cancel
              </button>
              <button type="button" onClick={confirmFinalize} className="flex-1 rounded-[9px] bg-primary py-2.5 text-[13.5px] font-semibold text-white hover:bg-primary-dark">
                Confirm
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
      <label className="mb-1.5 block text-[12px] font-semibold text-ink">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none rounded-[8px] border-[1.5px] border-border bg-white px-3 py-2 pr-9 text-[13px] text-ink outline-none focus:border-primary">
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

function BiometricStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold tracking-[0.02em] text-muted-2 uppercase">{label}</div>
      <div className="mt-0.5 font-semibold text-ink">{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3.5 py-2.5 text-left text-[10.5px] font-semibold tracking-[0.03em] whitespace-nowrap text-muted uppercase">{children}</th>;
}

"use client";

import { useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import { DateField, SelectField, Toast } from "@/components/form/Field";
import EmployeeSearchCard from "@/components/EmployeeSearchCard";
import StatusBadge from "@/components/StatusBadge";
import DataTablePagination from "@/components/DataTablePagination";
import type { DirectoryEmployee } from "@/lib/employee-directory";

const LEAVE_TYPES = ["Casual Leave", "Sick Leave", "Earned Leave", "Half Pay Leave", "Maternity Leave", "Compensatory Leave"];
const SUB_DEPARTMENTS = ["Accounts Office", "Engineering Office", "Estate Office", "Administration Office"];

const LEAVE_BALANCE: Record<string, number> = {
  "Casual Leave": 7,
  "Sick Leave": 13,
  "Earned Leave": 19,
  "Half Pay Leave": 20,
  "Maternity Leave": 180,
  "Compensatory Leave": 5,
};

type LeaveHistoryRow = {
  id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  status: "Sanctioned" | "Pending" | "Rejected";
  orderNumber: string;
  orderDate: string;
};

const HISTORY: LeaveHistoryRow[] = [
  { id: "L-1", leaveType: "Casual Leave", fromDate: "2026-06-02", toDate: "2026-06-03", days: 2, status: "Sanctioned", orderNumber: "MHADA/LV/2026/0301", orderDate: "2026-05-28" },
  { id: "L-2", leaveType: "Sick Leave", fromDate: "2026-06-14", toDate: "2026-06-14", days: 1, status: "Sanctioned", orderNumber: "MHADA/LV/2026/0312", orderDate: "2026-06-14" },
  { id: "L-3", leaveType: "Earned Leave", fromDate: "2026-06-22", toDate: "2026-06-26", days: 5, status: "Pending", orderNumber: "—", orderDate: "—" },
  { id: "L-4", leaveType: "Casual Leave", fromDate: "2026-07-06", toDate: "2026-07-06", days: 1, status: "Rejected", orderNumber: "MHADA/LV/2026/0339", orderDate: "2026-07-05" },
  { id: "L-5", leaveType: "Compensatory Leave", fromDate: "2026-07-11", toDate: "2026-07-11", days: 1, status: "Sanctioned", orderNumber: "MHADA/LV/2026/0344", orderDate: "2026-07-10" },
];

function statusTone(status: LeaveHistoryRow["status"]) {
  if (status === "Sanctioned") return "success" as const;
  if (status === "Rejected") return "danger" as const;
  return "warning" as const;
}

export default function EmployeeLeaveEntry() {
  const [employee, setEmployee] = useState<DirectoryEmployee | null>(null);

  const [leaveType, setLeaveType] = useState("");
  const [halfDay, setHalfDay] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [applicationDate, setApplicationDate] = useState("");
  const [holidayBefore, setHolidayBefore] = useState(false);
  const [holidayAfter, setHolidayAfter] = useState(false);
  const [subDepartment, setSubDepartment] = useState("");

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function announce(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  function resetForm() {
    setLeaveType("");
    setHalfDay(false);
    setFromDate("");
    setToDate("");
    setApplicationDate("");
    setHolidayBefore(false);
    setHolidayAfter(false);
    setSubDepartment("");
  }

  function handleSelectEmployee(e: DirectoryEmployee | null) {
    setEmployee(e);
    resetForm();
  }

  function handleCancel() {
    setEmployee(null);
    resetForm();
  }

  function handleSave() {
    announce(`Leave entry saved for ${employee?.name}.`);
  }

  const leaveCount = useMemo(() => {
    if (!fromDate || !toDate) return null;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (to < from) return null;
    const days = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
    return halfDay && days === 1 ? 0.5 : days;
  }, [fromDate, toDate, halfDay]);

  const balance = leaveType ? LEAVE_BALANCE[leaveType] : null;

  /* ---------------- History table: sort + pagination ---------------- */
  const [sortKey, setSortKey] = useState<"fromDate" | "leaveType">("fromDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const sorted = useMemo(() => {
    return [...HISTORY].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      return a[sortKey] > b[sortKey] ? dir : a[sortKey] < b[sortKey] ? -dir : 0;
    });
  }, [sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = sorted.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const end = Math.min(safePage * rowsPerPage, sorted.length);
  const pageRows = sorted.slice(start - 1, end);

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
      <PageHeader
        routeKey="leave-setup"
        title="Employee Leave Entry"
        subtitle="Search for an employee and record a new leave entry against their available balance."
      />

      <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)] sm:p-6">
        <EmployeeSearchCard employee={employee} onSelect={handleSelectEmployee} />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
          {/* Form */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField label="Leave Type" required options={LEAVE_TYPES} value={leaveType} onChange={setLeaveType} />
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="half-day"
                checked={halfDay}
                onChange={(e) => setHalfDay(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              <label htmlFor="half-day" className="text-[12.5px] font-medium text-ink">
                Half-Day Leave
              </label>
            </div>
            <DateField label="From Date" required value={fromDate} onChange={setFromDate} />
            <DateField label="To Date" required value={toDate} onChange={setToDate} min={fromDate || undefined} />
            <DateField label="Application Date" value={applicationDate} onChange={setApplicationDate} />
            <SelectField label="Sub Department" options={SUB_DEPARTMENTS} value={subDepartment} onChange={setSubDepartment} placeholder="Optional" />
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="holiday-before"
                checked={holidayBefore}
                onChange={(e) => setHolidayBefore(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              <label htmlFor="holiday-before" className="text-[12.5px] font-medium text-ink">
                Holiday Before Leave
              </label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="holiday-after"
                checked={holidayAfter}
                onChange={(e) => setHolidayAfter(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              <label htmlFor="holiday-after" className="text-[12.5px] font-medium text-ink">
                Holiday After Leave
              </label>
            </div>
          </div>

          {/* Summary cards */}
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-border bg-primary-tint px-4 py-3.5">
              <div className="text-[10.5px] font-semibold tracking-[0.03em] text-primary/70 uppercase">Balance Leave</div>
              <div className="disp mt-1 text-[22px] font-semibold text-primary">
                {balance !== null ? `${balance} days` : "—"}
              </div>
              <div className="mt-0.5 text-[11.5px] text-primary/70">{leaveType || "Select a leave type"}</div>
            </div>
            <div className="rounded-xl border border-border bg-accent-tint px-4 py-3.5">
              <div className="text-[10.5px] font-semibold tracking-[0.03em] text-accent-dark/70 uppercase">Leave Count</div>
              <div className="disp mt-1 text-[22px] font-semibold text-accent-dark">
                {leaveCount !== null ? `${leaveCount} day${leaveCount === 1 ? "" : "s"}` : "—"}
              </div>
              <div className="mt-0.5 text-[11.5px] text-accent-dark/70">Requested this entry</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2.5 border-t border-border-soft pt-5">
          <button type="button" onClick={handleCancel} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
            Cancel
          </button>
          <button type="button" onClick={resetForm} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-[9px] bg-accent px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-accent-dark"
          >
            <Icon name="attendance" className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      {/* Previous Two Month Leave Information */}
      <div className="mt-6">
        <h2 className="disp mb-3 text-[16px] font-semibold text-ink">Previous Two Month Leave Information</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="sticky top-0 z-10 border-b border-border-soft bg-border-soft/70 backdrop-blur">
                  <Th>Sr. No.</Th>
                  <SortableTh label="Leave Type" active={sortKey === "leaveType"} dir={sortDir} onClick={() => toggleSort("leaveType")} />
                  <SortableTh label="From Date" active={sortKey === "fromDate"} dir={sortDir} onClick={() => toggleSort("fromDate")} />
                  <Th>To Date</Th>
                  <Th>No. of Days</Th>
                  <Th>Status</Th>
                  <Th>Order Number</Th>
                  <Th>Order Date</Th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted">
                      No leave records in the last two months.
                    </td>
                  </tr>
                )}
                {pageRows.map((r, i) => (
                  <tr key={r.id} className={`border-b border-border-soft transition-colors last:border-0 hover:bg-primary-tint/50 ${i % 2 === 1 ? "bg-canvas/60" : "bg-surface"}`}>
                    <td className="px-3.5 py-2.5 text-muted">{start + i}</td>
                    <td className="px-3.5 py-2.5 font-medium text-ink">{r.leaveType}</td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">{r.fromDate}</td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">{r.toDate}</td>
                    <td className="px-3.5 py-2.5 text-ink">{r.days}</td>
                    <td className="px-3.5 py-2.5">
                      <StatusBadge label={r.status} tone={statusTone(r.status)} />
                    </td>
                    <td className="px-3.5 py-2.5 font-mono whitespace-nowrap text-muted-2">{r.orderNumber}</td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">{r.orderDate}</td>
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
            total={sorted.length}
            itemLabel="leave records"
          />
        </div>
      </div>

      <Toast message={toast} />
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

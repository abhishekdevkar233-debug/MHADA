"use client";

import { useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import { SectionTitle, TextField, DateField, SelectField, Toast } from "@/components/form/Field";
import EmployeeSearchCard from "@/components/EmployeeSearchCard";
import DataTablePagination from "@/components/DataTablePagination";
import type { DirectoryEmployee } from "@/lib/employee-directory";

const DEPARTMENTS = ["Mumbai Board", "Konkan Board", "Pune Board", "Nagpur Board", "Nashik Board"];
const DIVISIONS = ["Zone 1", "Zone 2", "Zone 3", "Zone 4"];
const SUB_DIVISIONS = ["Sub-Division 1", "Sub-Division 2", "Sub-Division 3"];
const SUB_DEPARTMENTS = ["Accounts Office", "Engineering Office", "Estate Office", "Administration Office"];
const SECRETARIES = ["1 Chief Officer", "2 Deputy Officer", "3 Assistant Secretary"];

/** Derives the employee's current org placement for the read-only panel — not part of the shared directory model. */
function currentPlacement(e: DirectoryEmployee) {
  const zoneIndex = DEPARTMENTS.indexOf(e.department) % DIVISIONS.length;
  return {
    division: DIVISIONS[zoneIndex],
    subDivision: SUB_DIVISIONS[Number(e.id) % SUB_DIVISIONS.length],
    office: "Divisional Office",
  };
}

type TransferRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  changedDate: string;
  newDepartment: string;
  newSubdivision: string;
  commandNumber: string;
  orderDate: string;
};

const HISTORY: TransferRecord[] = [
  { id: "T-1", employeeId: "34008", employeeName: "Anil Dadarao Markad", designation: "Accountant", changedDate: "2025-02-01", newDepartment: "0002 Mumbai Housing & Area Development Board", newSubdivision: "2 Main Accounts Office", commandNumber: "1926", orderDate: "2024-08-21" },
  { id: "T-2", employeeId: "34008", employeeName: "Anil Dadarao Markad", designation: "Accountant", changedDate: "2016-11-01", newDepartment: "0001 Maharashtra Housing & Area Development Authority", newSubdivision: "19 F01 Class 1 & 2", commandNumber: "1234", orderDate: "2016-10-06" },
  { id: "T-3", employeeId: "34008", employeeName: "Anil Dadarao Markad", designation: "Accountant", changedDate: "2016-06-05", newDepartment: "0002 Mumbai Housing & Area Development Board", newSubdivision: "2 Main Accounts Office", commandNumber: "2568", orderDate: "2016-05-31" },
];

export default function EmployeePromotion() {
  const [employee, setEmployee] = useState<DirectoryEmployee | null>(null);

  const [newDivisions, setNewDivisions] = useState("");
  const [subDivisions, setSubDivisions] = useState("");
  const [secretary, setSecretary] = useState("");
  const [subDepartment, setSubDepartment] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [fromThePeriod, setFromThePeriod] = useState("");
  const [share, setShare] = useState("");

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function announce(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  function resetForm() {
    setNewDivisions("");
    setSubDivisions("");
    setSecretary("");
    setSubDepartment("");
    setOrderNo("");
    setOrderDate("");
    setFromThePeriod("");
    setShare("");
  }

  function handleSelectEmployee(e: DirectoryEmployee | null) {
    setEmployee(e);
    resetForm();
  }

  function handleCancel() {
    setEmployee(null);
    resetForm();
  }

  function handleSaveDraft() {
    announce(`Draft saved for ${employee?.name}.`);
  }

  function handleSubmit() {
    announce(`Transfer submitted for ${employee?.name}.`);
  }

  const placement = employee ? currentPlacement(employee) : null;

  /* ---------------- History table: search, date range, pagination ---------------- */
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return HISTORY.filter((r) => {
      const matchesSearch =
        q === "" || r.employeeName.toLowerCase().includes(q) || r.employeeId.includes(q);
      const matchesFrom = !dateFrom || r.changedDate >= dateFrom;
      const matchesTo = !dateTo || r.changedDate <= dateTo;
      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [search, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = filtered.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const end = Math.min(safePage * rowsPerPage, filtered.length);
  const pageRows = filtered.slice(start - 1, end);

  function clearFilters() {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        routeKey="employee-promotion"
        subtitle="Search for an employee, review their current posting, and record a transfer to a new department, division, or office."
      />

      <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)] sm:p-6">
        <SectionTitle>Employee</SectionTitle>
        <EmployeeSearchCard employee={employee} onSelect={handleSelectEmployee} required />

        {employee && placement && (
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl bg-canvas px-4 py-3.5 sm:grid-cols-3 lg:grid-cols-6">
            <ReadOnlyStat label="Employee ID" value={employee.id} />
            <ReadOnlyStat label="Employee Name" value={employee.name} />
            <ReadOnlyStat label="Current Designation" value={employee.designation} />
            <ReadOnlyStat label="Current Department" value={employee.department} />
            <ReadOnlyStat label="Current Division" value={placement.division} />
            <ReadOnlyStat label="Current Sub Division" value={placement.subDivision} />
          </div>
        )}

        <div className={`mt-6 ${employee ? "" : "pointer-events-none opacity-40"}`}>
          <SectionTitle>Transfer Details</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField label="New Divisions" options={DIVISIONS} value={newDivisions} onChange={setNewDivisions} />
            <SelectField label="Sub-Divisions" options={SUB_DIVISIONS} value={subDivisions} onChange={setSubDivisions} />
            <SelectField label="Secretary" options={SECRETARIES} value={secretary} onChange={setSecretary} />
            <SelectField label="Sub-Department" options={SUB_DEPARTMENTS} value={subDepartment} onChange={setSubDepartment} />
            <TextField label="Order No." value={orderNo} onChange={setOrderNo} placeholder="e.g. MHADA/TR/2026/0001" />
            <DateField label="Order Date" value={orderDate} onChange={setOrderDate} />
            <DateField label="From the Period" value={fromThePeriod} onChange={setFromThePeriod} />
            <TextField label="Share" value={share} onChange={setShare} />
          </div>

          {/* Employee Transfer Information — placed right after Transfer Details, per request */}
          <div className="mt-6">
            <div className="mb-3 rounded-xl border border-border bg-surface p-3.5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.3fr_auto_auto_auto_auto]">
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
                    placeholder="Search Employee (Name / Employee ID)"
                    className="h-9.5 w-full rounded-[9px] border-[1.5px] border-border bg-white pr-3 pl-9 text-[13px] text-ink placeholder:text-muted-2 focus:border-primary focus:outline-none"
                  />
                </div>
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
                  onClick={() => announce("Exporting transfer history…")}
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
                  Refresh
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
              <div className="border-b border-border-soft bg-primary-tint px-4 py-2.5 text-center text-[13px] font-semibold text-primary">
                Employee Transfer Information
              </div>
              <div className="max-h-[520px] overflow-auto">
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="sticky top-0 z-10 border-b border-border-soft bg-border-soft/70 backdrop-blur">
                      <Th>S.No.</Th>
                      <Th>Officer/Employee Name</Th>
                      <Th>Current Designations</Th>
                      <Th>Changed Date</Th>
                      <Th>New Departments</Th>
                      <Th>New Subdivision</Th>
                      <Th>Command Number</Th>
                      <Th>Order Date</Th>
                      <Th>Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-muted">
                          No transfer records match the current filters.
                        </td>
                      </tr>
                    )}
                    {pageRows.map((r, i) => (
                      <tr key={r.id} className={`border-b border-border-soft transition-colors last:border-0 hover:bg-primary-tint/50 ${i % 2 === 1 ? "bg-canvas/60" : "bg-surface"}`}>
                        <td className="px-3.5 py-2.5 text-muted">{start + i}</td>
                        <td className="px-3.5 py-2.5 font-medium text-ink">
                          <span className="mr-1.5 font-mono text-[11.5px] text-muted-2">{r.employeeId}</span>
                          {r.employeeName}
                        </td>
                        <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">{r.designation}</td>
                        <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">{r.changedDate}</td>
                        <td className="px-3.5 py-2.5 text-ink">{r.newDepartment}</td>
                        <td className="px-3.5 py-2.5 whitespace-nowrap text-ink">{r.newSubdivision}</td>
                        <td className="px-3.5 py-2.5 font-mono whitespace-nowrap text-muted-2">{r.commandNumber}</td>
                        <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">{r.orderDate}</td>
                        <td className="px-3.5 py-2.5">
                          <button
                            type="button"
                            onClick={() => announce(`Opening correction for record ${r.id}…`)}
                            className="text-[12.5px] font-semibold text-primary hover:text-primary-dark hover:underline"
                          >
                            Correction
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
                itemLabel="transfer records"
              />
            </div>
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
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-[9px] bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-accent-dark"
            >
              <Icon name="pay-change" className="h-4 w-4" />
              Submit Transfer
            </button>
          </div>
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

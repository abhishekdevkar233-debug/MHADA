"use client";

import { useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import KPICard from "@/components/KPICard";
import { Toast } from "@/components/form/Field";
import EmployeeSearchCard from "@/components/EmployeeSearchCard";
import type { DirectoryEmployee } from "@/lib/employee-directory";

const OLD_DA_RATE = 0.42;
const NEW_DA_RATE = 0.46;

type ArrearRow = {
  month: string;
  year: number;
  totalDays: number;
  absentDays: number;
  basicPay: number;
  gradePay: number;
  grossPay: number;
};

const BASE_ROWS: ArrearRow[] = [
  { month: "January", year: 2026, totalDays: 31, absentDays: 0, basicPay: 35400, gradePay: 2400, grossPay: 62800 },
  { month: "February", year: 2026, totalDays: 28, absentDays: 1, basicPay: 35400, gradePay: 2400, grossPay: 62800 },
  { month: "March", year: 2026, totalDays: 31, absentDays: 0, basicPay: 35400, gradePay: 2400, grossPay: 62800 },
  { month: "April", year: 2026, totalDays: 30, absentDays: 2, basicPay: 36500, gradePay: 2400, grossPay: 64100 },
  { month: "May", year: 2026, totalDays: 31, absentDays: 0, basicPay: 36500, gradePay: 2400, grossPay: 64100 },
  { month: "June", year: 2026, totalDays: 30, absentDays: 0, basicPay: 36500, gradePay: 2400, grossPay: 64100 },
];

function computed(row: ArrearRow) {
  const presentRatio = (row.totalDays - row.absentDays) / row.totalDays;
  const payBase = (row.basicPay + row.gradePay) * presentRatio;
  const daGiven = payBase * OLD_DA_RATE;
  const daEntitlement = payBase * NEW_DA_RATE;
  const daArrear = daEntitlement - daGiven;
  const cpfArrear = daArrear * 0.1;
  const bcArrear = daArrear * 0.02;
  const ptArrear = daArrear * 0.01;
  return { daGiven, daEntitlement, daArrear, cpfArrear, bcArrear, ptArrear };
}

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export default function DAArrears() {
  const [employee, setEmployee] = useState<DirectoryEmployee | null>(null);
  const billMonth = "June 2026";
  const [rows, setRows] = useState<ArrearRow[]>(BASE_ROWS);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function announce(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  function handleSelectEmployee(e: DirectoryEmployee | null) {
    setEmployee(e);
    setRows(BASE_ROWS);
  }

  function updateRow(index: number, key: keyof ArrearRow, value: string) {
    const n = Number(value);
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: Number.isFinite(n) ? n : 0 } : r)));
  }

  function handleReset() {
    setRows(BASE_ROWS);
    announce("Arrear figures reset.");
  }

  function handleCalculate() {
    announce("DA, CPF, BC, and PT arrears recalculated.");
  }

  function handleRefresh() {
    announce(`Latest processed payroll data fetched for ${employee?.name}.`);
  }

  const totals = useMemo(() => {
    let da = 0,
      cpf = 0,
      bc = 0,
      pt = 0;
    rows.forEach((r) => {
      const c = computed(r);
      da += c.daArrear;
      cpf += c.cpfArrear;
      bc += c.bcArrear;
      pt += c.ptArrear;
    });
    return { da, cpf, bc, pt, total: da + cpf + bc + pt };
  }, [rows]);

  return (
    <div className="mx-auto max-w-[1300px]">
      <PageHeader
        routeKey="da-arrears"
        title="DA Arrears Calculation"
        subtitle="Calculate dearness allowance arrears for an employee following a DA rate revision, along with CPF, BC, and PT arrears."
      />

      {/* Employee Selection */}
      <div className="mb-5 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)] sm:p-5">
        <div className="mb-1 text-[12.5px] font-semibold text-ink">Employee Selection</div>
        <EmployeeSearchCard employee={employee} onSelect={handleSelectEmployee} required />

        {employee && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-canvas px-4 py-3.5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
              <ReadOnlyStat label="Employee ID" value={employee.id} />
              <ReadOnlyStat label="Employee Name" value={employee.name} />
              <ReadOnlyStat label="Designation" value={employee.designation} />
              <ReadOnlyStat label="Department" value={employee.department} />
              <ReadOnlyStat label="Sub Department" value="Accounts Office" />
              <ReadOnlyStat label="Bill Month" value={billMonth} />
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="flex h-9 flex-shrink-0 items-center gap-1.5 rounded-[9px] border-[1.5px] border-border px-3.5 text-[12.5px] font-semibold text-ink hover:border-muted-2"
            >
              <Icon name="x-circle" className="h-3.5 w-3.5" />
              Refresh Data
            </button>
          </div>
        )}
      </div>

      <div className={employee ? "" : "pointer-events-none opacity-40"}>
        {/* Info banner + Rate info */}
        <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary-tint px-4 py-3.5 text-[13px] text-primary">
            <Icon name="help" className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              Basic Pay, Grade Pay, Gross Pay, and attendance are fetched
              automatically from processed salary bills for each month below.
              You can edit any value if a correction is required before
              calculating arrears.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
            <div className="text-[10.5px] font-semibold tracking-[0.03em] text-muted-2 uppercase">Rate Information</div>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-muted">Old DA Rate</span>
              <span className="font-semibold text-ink">{Math.round(OLD_DA_RATE * 100)}%</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[13px]">
              <span className="text-muted">New DA Rate</span>
              <span className="font-semibold text-primary">{Math.round(NEW_DA_RATE * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="sticky top-0 z-10 border-b border-border-soft bg-border-soft/80 backdrop-blur">
                  <Th>Month</Th>
                  <Th>Year</Th>
                  <Th align="right">Total Days</Th>
                  <Th align="right" editable>Absent Days</Th>
                  <Th align="right" editable>Basic Pay</Th>
                  <Th align="right" editable>Grade Pay</Th>
                  <Th align="right" editable>Gross Pay</Th>
                  <Th align="right">DA Given</Th>
                  <Th align="right">DA Entitlement</Th>
                  <Th align="right">DA Arrear</Th>
                  <Th align="right">CPF Arrear</Th>
                  <Th align="right">BC Arrear</Th>
                  <Th align="right">PT Arrear</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const c = computed(r);
                  return (
                    <tr key={`${r.month}-${r.year}`} className={`transition-colors hover:bg-primary-tint/40 ${i % 2 === 1 ? "bg-canvas/60" : "bg-surface"}`}>
                      <td className="border-b border-border-soft px-3 py-2 font-semibold whitespace-nowrap text-ink">{r.month}</td>
                      <td className="border-b border-border-soft px-3 py-2 whitespace-nowrap text-muted">{r.year}</td>
                      <td className="border-b border-border-soft px-3 py-2 text-right whitespace-nowrap text-muted">{r.totalDays}</td>
                      <td className="border-b border-border-soft px-1.5 py-1.5">
                        <EditableCell value={r.absentDays} onChange={(v) => updateRow(i, "absentDays", v)} />
                      </td>
                      <td className="border-b border-border-soft px-1.5 py-1.5">
                        <EditableCell value={r.basicPay} onChange={(v) => updateRow(i, "basicPay", v)} width={90} />
                      </td>
                      <td className="border-b border-border-soft px-1.5 py-1.5">
                        <EditableCell value={r.gradePay} onChange={(v) => updateRow(i, "gradePay", v)} />
                      </td>
                      <td className="border-b border-border-soft px-1.5 py-1.5">
                        <EditableCell value={r.grossPay} onChange={(v) => updateRow(i, "grossPay", v)} width={90} />
                      </td>
                      <td className="border-b border-border-soft bg-border-soft/40 px-3 py-2 text-right whitespace-nowrap text-muted">{inr(c.daGiven)}</td>
                      <td className="border-b border-border-soft bg-border-soft/40 px-3 py-2 text-right whitespace-nowrap text-muted">{inr(c.daEntitlement)}</td>
                      <td className="border-b border-border-soft bg-primary-tint/60 px-3 py-2 text-right font-semibold whitespace-nowrap text-primary">{inr(c.daArrear)}</td>
                      <td className="border-b border-border-soft bg-primary-tint/60 px-3 py-2 text-right whitespace-nowrap text-primary">{inr(c.cpfArrear)}</td>
                      <td className="border-b border-border-soft bg-primary-tint/60 px-3 py-2 text-right whitespace-nowrap text-primary">{inr(c.bcArrear)}</td>
                      <td className="border-b border-border-soft bg-primary-tint/60 px-3 py-2 text-right whitespace-nowrap text-primary">{inr(c.ptArrear)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-border-soft/70 font-semibold">
                  <td colSpan={9} className="px-3 py-2.5 text-right whitespace-nowrap text-ink">
                    Total
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap text-primary">{inr(totals.da)}</td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap text-primary">{inr(totals.cpf)}</td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap text-primary">{inr(totals.bc)}</td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap text-primary">{inr(totals.pt)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* KPI summary */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <KPICard label="Total DA Arrear" value={inr(totals.da)} icon="da-arrears" tone="accent" />
          <KPICard label="Total CPF Arrear" value={inr(totals.cpf)} icon="money" tone="accent" />
          <KPICard label="Total BC Arrear" value={inr(totals.bc)} icon="money" tone="accent" />
          <KPICard label="Total PT Arrear" value={inr(totals.pt)} icon="money" tone="accent" />
          <KPICard label="Total Arrear Amount" value={inr(totals.total)} icon="bill-create" tone="primary" />
        </div>

        {/* Calculation Summary (collapsible) */}
        <div className="mt-5 overflow-hidden rounded-xl border border-border bg-surface">
          <button
            type="button"
            onClick={() => setSummaryOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-[13px] font-semibold text-ink hover:bg-canvas"
          >
            Calculation Summary
            <Icon name="chevron" className={`h-4 w-4 transition-transform ${summaryOpen ? "rotate-90" : ""}`} />
          </button>
          {summaryOpen && (
            <div className="border-t border-border-soft px-4 py-3.5 text-[13px] leading-relaxed text-muted">
              <p>For each month, present days are calculated as Total Days minus Absent Days.</p>
              <p className="mt-1.5">
                DA Given = (Basic Pay + Grade Pay) × present-day ratio × Old DA
                Rate ({Math.round(OLD_DA_RATE * 100)}%). DA Entitlement uses the
                same formula at the New DA Rate ({Math.round(NEW_DA_RATE * 100)}%).
              </p>
              <p className="mt-1.5">DA Arrear = DA Entitlement − DA Given.</p>
              <p className="mt-1.5">
                CPF Arrear, BC Arrear, and PT Arrear are each derived as a
                percentage of the DA Arrear for that month, then totalled
                across all months shown above.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <button type="button" onClick={() => announce("Cancelled.")} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
            Cancel
          </button>
          <button type="button" onClick={handleReset} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
            Reset
          </button>
          <button type="button" onClick={handleCalculate} className="rounded-[9px] border-[1.5px] border-primary/40 bg-primary-tint px-5 py-2.5 text-[13.5px] font-semibold text-primary hover:bg-primary-tint/70">
            Calculate
          </button>
          <button
            type="button"
            onClick={() => announce("DA arrears saved.")}
            className="flex items-center gap-2 rounded-[9px] bg-accent px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-accent-dark"
          >
            <Icon name="bill-create" className="h-4 w-4" />
            Save
          </button>
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

function Th({ children, align, editable }: { children: React.ReactNode; align?: "right"; editable?: boolean }) {
  return (
    <th className={`px-3 py-2.5 text-[10.5px] font-semibold tracking-[0.04em] whitespace-nowrap text-muted uppercase ${align === "right" ? "text-right" : "text-left"} ${editable ? "bg-accent-tint/40 text-accent-dark" : ""}`}>
      {children}
    </th>
  );
}

function EditableCell({ value, onChange, width = 70 }: { value: number; onChange: (v: string) => void; width?: number }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width }}
      className="rounded-[6px] border-[1.5px] border-border bg-accent-tint/20 px-2 py-1.5 text-right text-[12.5px] text-ink outline-none focus:border-primary"
    />
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import { SectionTitle, TextAreaField, Toast } from "@/components/form/Field";
import EmployeeSearchCard from "@/components/EmployeeSearchCard";
import type { DirectoryEmployee } from "@/lib/employee-directory";

type LeaveRow = {
  code: string;
  label: string;
  entitled: number;
  availed: number;
};

const BASE_LEAVE_ROWS: LeaveRow[] = [
  { code: "CL", label: "Casual Leave", entitled: 12, availed: 5 },
  { code: "SL", label: "Sick Leave", entitled: 15, availed: 2 },
  { code: "EL", label: "Earned Leave", entitled: 30, availed: 11 },
  { code: "HPL", label: "Half Pay Leave", entitled: 20, availed: 0 },
  { code: "ML", label: "Maternity Leave", entitled: 180, availed: 0 },
  { code: "COL", label: "Compensatory Leave", entitled: 6, availed: 1 },
];

export default function LeaveBalanceCorrection() {
  const [employee, setEmployee] = useState<DirectoryEmployee | null>(null);
  const [corrected, setCorrected] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function announce(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  const rows = useMemo(
    () =>
      BASE_LEAVE_ROWS.map((r) => ({
        ...r,
        balance: r.entitled - r.availed,
      })),
    [],
  );

  function correctedValue(code: string, fallback: number) {
    return corrected[code] ?? String(fallback);
  }

  function resetForm() {
    setCorrected({});
    setRemarks("");
  }

  function handleSelect(e: DirectoryEmployee | null) {
    setEmployee(e);
    resetForm();
  }

  function handleSave() {
    announce(`Leave balance updated for ${employee?.name}.`);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        routeKey="leave-balance"
        subtitle="Search for an employee and correct their recorded leave balance across all leave types on file."
      />

      <div className="mb-5">
        <EmployeeSearchCard employee={employee} onSelect={handleSelect} required />
      </div>

      <div className={employee ? "" : "pointer-events-none opacity-40"}>
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <SectionTitle>Leave Balances</SectionTitle>

          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border-soft bg-border-soft/60">
                  <th className="px-3.5 py-2.5 text-left text-[11px] font-semibold tracking-[0.04em] text-muted uppercase">
                    Leave Type
                  </th>
                  <th className="w-24 px-3.5 py-2.5 text-right text-[11px] font-semibold tracking-[0.04em] text-muted uppercase">
                    Entitled
                  </th>
                  <th className="w-24 px-3.5 py-2.5 text-right text-[11px] font-semibold tracking-[0.04em] text-muted uppercase">
                    Availed
                  </th>
                  <th className="w-28 px-3.5 py-2.5 text-right text-[11px] font-semibold tracking-[0.04em] text-muted uppercase">
                    Current Balance
                  </th>
                  <th className="w-36 px-3.5 py-2.5 text-right text-[11px] font-semibold tracking-[0.04em] text-muted uppercase">
                    Corrected Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.code}
                    className={`border-b border-border-soft last:border-0 ${i % 2 === 1 ? "bg-canvas/60" : "bg-surface"}`}
                  >
                    <td className="px-3.5 py-2.5">
                      <span className="font-medium text-ink">{r.label}</span>
                      <span className="ml-1.5 font-mono text-[11px] text-muted-2">({r.code})</span>
                    </td>
                    <td className="px-3.5 py-2.5 text-right text-muted">{r.entitled}</td>
                    <td className="px-3.5 py-2.5 text-right text-muted">{r.availed}</td>
                    <td className="px-3.5 py-2.5 text-right font-medium text-ink">{r.balance}</td>
                    <td className="px-3.5 py-2.5">
                      <input
                        type="number"
                        value={correctedValue(r.code, r.balance)}
                        onChange={(e) =>
                          setCorrected((c) => ({ ...c, [r.code]: e.target.value }))
                        }
                        className="w-full rounded-[7px] border-[1.5px] border-border bg-white px-2.5 py-1.5 text-right text-[13px] text-ink outline-none focus:border-primary"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5">
            <TextAreaField
              label="Remarks"
              value={remarks}
              onChange={setRemarks}
              placeholder="Optional note on why the balance was corrected…"
            />
          </div>

          <div className="mt-6 flex items-center gap-2.5 border-t border-border-soft pt-5">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-[9px] border-[1.5px] border-border px-4 py-2.5 text-[13.5px] font-semibold text-ink transition-colors hover:border-muted-2"
            >
              Reset
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={handleSave}
              disabled={!employee}
              className="flex items-center gap-2 rounded-[9px] bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="attendance" className="h-4 w-4" />
              Save
            </button>
          </div>
        </div>
      </div>

      {!employee && (
        <p className="mt-3 text-center text-[12.5px] text-muted-2">
          Select an employee above to view and correct their leave balances.
        </p>
      )}

      <Toast message={toast} />
    </div>
  );
}

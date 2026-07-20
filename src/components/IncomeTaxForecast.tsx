"use client";

import { useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import KPICard from "@/components/KPICard";
import { EMPLOYEE_DIRECTORY } from "@/lib/employee-directory";
import { Toast } from "@/components/form/Field";

const DEPARTMENTS = ["Mumbai Board", "Konkan Board", "Pune Board", "Nagpur Board", "Nashik Board"];
const SUB_DEPARTMENTS = ["Accounts Office", "Engineering Office", "Estate Office", "Administration Office"];
const FINANCIAL_YEARS = ["2026-27", "2025-26", "2024-25"];
const MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
const FORECAST_TYPES = ["All", "Salary Components", "Deductions", "Net Pay", "Other Allowances"] as const;

const EARNINGS_COLS = [
  { key: "basic", label: "Basic" },
  { key: "gradePay", label: "Grade Pay" },
  { key: "da", label: "DA" },
  { key: "bonus", label: "Bonus" },
  { key: "otAmount", label: "OT Amount" },
  { key: "cla", label: "CLA" },
  { key: "hra", label: "HRA" },
  { key: "medical", label: "Medical" },
  { key: "otherAllowance", label: "Other Allowance" },
  { key: "ta", label: "TA" },
] as const;

const OTHER_ALLOWANCE_KEYS = new Set(["cla", "hra", "medical", "otherAllowance", "ta"]);

const DEDUCTION_COLS = [
  { key: "cpf", label: "CPF" },
  { key: "gis", label: "GIS" },
  { key: "incomeTax", label: "Income Tax" },
  { key: "pt", label: "PT" },
  { key: "lic", label: "LIC" },
  { key: "hrr", label: "HRR" },
  { key: "hba", label: "HBA" },
  { key: "otherLoan", label: "Other Loan" },
  { key: "bankRecovery", label: "Bank Recovery" },
] as const;

type EarningKey = (typeof EARNINGS_COLS)[number]["key"];
type DeductionKey = (typeof DEDUCTION_COLS)[number]["key"];
type MonthRow = Record<EarningKey, number> & Record<DeductionKey, number>;

function defaultRow(): MonthRow {
  return {
    basic: 35400,
    gradePay: 2400,
    da: 14868,
    bonus: 0,
    otAmount: 500,
    cla: 300,
    hra: 9558,
    medical: 1250,
    otherAllowance: 200,
    ta: 1200,
    cpf: 3540,
    gis: 120,
    incomeTax: 2500,
    pt: 200,
    lic: 1200,
    hrr: 0,
    hba: 0,
    otherLoan: 0,
    bankRecovery: 500,
  };
}

function seedRows(): Record<string, MonthRow> {
  const rows: Record<string, MonthRow> = {};
  MONTHS.forEach((m) => {
    rows[m] = defaultRow();
  });
  return rows;
}

function grossOf(row: MonthRow) {
  return EARNINGS_COLS.reduce((sum, c) => sum + (row[c.key] ?? 0), 0);
}
function deductionOf(row: MonthRow) {
  return DEDUCTION_COLS.reduce((sum, c) => sum + (row[c.key] ?? 0), 0);
}
function netPayOf(row: MonthRow) {
  return grossOf(row) - deductionOf(row);
}
function inr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}
function remainingMonthsInFY() {
  const now = new Date();
  const fyIndex = (now.getMonth() + 9) % 12; // April = 0
  return 12 - fyIndex;
}

export default function IncomeTaxForecast() {
  const [department, setDepartment] = useState("");
  const [subDepartment, setSubDepartment] = useState("");
  const [financialYear, setFinancialYear] = useState(FINANCIAL_YEARS[0]);
  const [employeeId, setEmployeeId] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [forecastType, setForecastType] = useState<(typeof FORECAST_TYPES)[number]>("All");
  const [rows, setRows] = useState<Record<string, MonthRow>>(seedRows);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function announce(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  const employee = EMPLOYEE_DIRECTORY.find((e) => e.id === employeeId) ?? null;

  function handleLoadForecast() {
    if (!employeeId) {
      announce("Select an employee to load the forecast.");
      return;
    }
    setLoaded(true);
    announce(`Forecast loaded for ${employee?.name}.`);
  }

  function updateCell(month: string, key: EarningKey | DeductionKey, value: string) {
    const n = Number(value);
    setRows((prev) => ({
      ...prev,
      [month]: { ...prev[month], [key]: Number.isFinite(n) ? n : 0 },
    }));
  }

  function handleCopyPreviousMonth() {
    setRows((prev) => {
      const next: Record<string, MonthRow> = { ...prev };
      for (let i = 1; i < MONTHS.length; i++) {
        next[MONTHS[i]] = { ...next[MONTHS[i - 1]] };
      }
      return next;
    });
    announce("Copied each month's values from the month before it.");
  }

  function handleApplyToRemaining() {
    setRows((prev) => {
      const next: Record<string, MonthRow> = { ...prev };
      const template = next[MONTHS[0]];
      for (let i = 1; i < MONTHS.length; i++) {
        next[MONTHS[i]] = { ...template };
      }
      return next;
    });
    announce("Applied April's values to all remaining months.");
  }

  function handleReset() {
    setRows(seedRows());
    announce("All months reset to default values.");
  }

  const totals = useMemo(() => {
    const t: Partial<MonthRow> & { gross: number; deduction: number; netPay: number } = {
      gross: 0,
      deduction: 0,
      netPay: 0,
    };
    [...EARNINGS_COLS, ...DEDUCTION_COLS].forEach((c) => {
      t[c.key] = 0;
    });
    MONTHS.forEach((m) => {
      const row = rows[m];
      [...EARNINGS_COLS, ...DEDUCTION_COLS].forEach((c) => {
        t[c.key] = (t[c.key] ?? 0) + row[c.key];
      });
      t.gross += grossOf(row);
      t.deduction += deductionOf(row);
      t.netPay += netPayOf(row);
    });
    return t;
  }, [rows]);

  const showEarnings = forecastType === "All" || forecastType === "Salary Components" || forecastType === "Other Allowances";
  const showDeductions = forecastType === "All" || forecastType === "Deductions";
  const showNetPay = forecastType === "All" || forecastType === "Net Pay";
  const earningsCols =
    forecastType === "Other Allowances" ? EARNINGS_COLS.filter((c) => OTHER_ALLOWANCE_KEYS.has(c.key)) : EARNINGS_COLS;
  const showGross = showEarnings && forecastType !== "Other Allowances";

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-border-soft px-3 py-1 text-[11.5px] font-medium text-muted-2">
          Operations <span>›</span> <span className="text-accent-dark">Income Tax Forecast</span>
        </div>
        <h1 className="disp mt-3 text-[22px] font-semibold text-ink">Income Tax Forecast</h1>
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-muted">
          Project annual salary, deductions, and estimated tax liability for an
          employee across the financial year.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)] sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <FilterSelect label="Department" value={department} onChange={setDepartment} options={DEPARTMENTS} />
          <FilterSelect label="Sub Department" value={subDepartment} onChange={setSubDepartment} options={SUB_DEPARTMENTS} />
          <FilterSelect label="Financial Year" value={financialYear} onChange={setFinancialYear} options={FINANCIAL_YEARS} />
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">Employee Search</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full rounded-[9px] border-[1.5px] border-border bg-white px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-primary"
            >
              <option value="">Choose Employee</option>
              {EMPLOYEE_DIRECTORY.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} — {e.id}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleLoadForecast}
              className="flex h-[42px] w-full items-center justify-center gap-2 rounded-[9px] bg-primary text-[13.5px] font-semibold text-white hover:bg-primary-dark"
            >
              <Icon name="income-tax" className="h-4 w-4" />
              Load Forecast
            </button>
          </div>
        </div>
      </div>

      {!loaded ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-tint text-primary">
            <Icon name="income-tax" className="h-7 w-7" />
          </span>
          <h2 className="disp mt-4 text-base font-semibold text-ink">No forecast loaded</h2>
          <p className="mt-1.5 max-w-md text-[13.5px] text-muted">
            Select a department, sub department, financial year, and employee
            above, then click <span className="font-medium text-ink">Load Forecast</span>.
          </p>
        </div>
      ) : (
        <>
          {/* Employee summary KPIs */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <KPICard label="Employee ID" value={employee?.id ?? "—"} icon="employee" />
            <KPICard label="Employee Name" value={employee?.name ?? "—"} icon="employee" />
            <KPICard label="Designation" value={employee?.designation ?? "—"} icon="employee" />
            <KPICard label="Department" value={employee?.department ?? "—"} icon="shield" />
            <KPICard label="Sub Department" value={subDepartment || "—"} icon="shield" />
            <KPICard label="Financial Year" value={financialYear} icon="income-tax" />
            <KPICard label="Remaining Months" value={String(remainingMonthsInFY())} icon="income-tax" />
            <KPICard label="Projected Annual Gross" value={inr(totals.gross)} tone="accent" icon="money" />
            <KPICard label="Total Annual Deductions" value={inr(totals.deduction)} tone="accent" icon="money" />
            <KPICard label="Estimated Income Tax" value={inr(totals.incomeTax ?? 0)} tone="accent" icon="income-tax" />
          </div>

          {/* Toolbar */}
          <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3">
            <ToolbarButton icon="pay-change" label="Copy Previous Month" onClick={handleCopyPreviousMonth} />
            <ToolbarButton icon="allowance" label="Apply to Remaining Months" onClick={handleApplyToRemaining} />
            <ToolbarButton icon="attendance" label="Auto Calculate" onClick={() => announce("Gross, deductions, and net pay recalculated.")} />
            <ToolbarButton icon="salary-slip" label="Import Excel" onClick={() => announce("Excel import isn't available in this preview.")} />
            <ToolbarButton icon="salary-slip" label="Export Excel" onClick={() => announce("Exporting forecast to Excel…")} />
            <ToolbarButton icon="x-circle" label="Reset All" onClick={handleReset} />

            <div className="ml-auto flex items-center gap-2">
              <label className="text-[12.5px] font-semibold text-ink">Type of Forecast</label>
              <select
                value={forecastType}
                onChange={(e) => setForecastType(e.target.value as (typeof FORECAST_TYPES)[number])}
                className="h-9.5 rounded-[9px] border-[1.5px] border-border bg-white px-3 text-[13px] text-ink focus:border-primary focus:outline-none"
              >
                {FORECAST_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Forecast table */}
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
            <div className="max-h-[600px] overflow-auto">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="sticky top-0 z-20">
                    <th rowSpan={2} className="sticky left-0 z-30 border-b border-border-soft bg-border-soft/90 px-3 py-2.5 text-left text-[10.5px] font-semibold tracking-[0.04em] text-muted uppercase backdrop-blur">
                      Month
                    </th>
                    {showEarnings && (
                      <th colSpan={earningsCols.length + (showGross ? 1 : 0)} className="border-b border-primary/20 bg-primary px-3 py-1.5 text-center text-[11px] font-bold tracking-[0.04em] text-white uppercase">
                        Earnings
                      </th>
                    )}
                    {showDeductions && (
                      <th colSpan={DEDUCTION_COLS.length + 1} className="border-b border-[#2E6DA4]/20 bg-[#2E6DA4] px-3 py-1.5 text-center text-[11px] font-bold tracking-[0.04em] text-white uppercase">
                        Deductions
                      </th>
                    )}
                    {showNetPay && (
                      <th className="border-b border-[#0D3157]/20 bg-[#0D3157] px-3 py-1.5 text-center text-[11px] font-bold tracking-[0.04em] text-white uppercase">
                        Net Pay
                      </th>
                    )}
                  </tr>
                  <tr className="sticky top-[33px] z-20">
                    {showEarnings &&
                      earningsCols.map((c) => (
                        <Th key={c.key} tint="primary">
                          {c.label}
                        </Th>
                      ))}
                    {showGross && <Th tint="primary" auto>Gross Amount</Th>}
                    {showDeductions &&
                      DEDUCTION_COLS.map((c) => (
                        <Th key={c.key} tint="success">
                          {c.label}
                        </Th>
                      ))}
                    {showDeductions && <Th tint="success" auto>Total Deduction</Th>}
                    {showNetPay && <Th tint="purple" auto>Net Pay</Th>}
                  </tr>
                </thead>
                <tbody>
                  {MONTHS.map((m, i) => {
                    const row = rows[m];
                    return (
                      <tr key={m} className={`transition-colors hover:bg-primary-tint/40 ${i % 2 === 1 ? "bg-canvas/60" : "bg-surface"}`}>
                        <td className="sticky left-0 z-10 border-b border-border-soft bg-inherit px-3 py-2 font-semibold whitespace-nowrap text-ink">
                          {m}
                        </td>
                        {showEarnings &&
                          earningsCols.map((c) => (
                            <td key={c.key} className="border-b border-border-soft px-1.5 py-1.5">
                              <EditableCell value={row[c.key]} onChange={(v) => updateCell(m, c.key, v)} />
                            </td>
                          ))}
                        {showGross && (
                          <td className="border-b border-border-soft bg-primary-tint/50 px-3 py-2 text-right font-semibold whitespace-nowrap text-primary">
                            {inr(grossOf(row))}
                          </td>
                        )}
                        {showDeductions &&
                          DEDUCTION_COLS.map((c) => (
                            <td key={c.key} className="border-b border-border-soft px-1.5 py-1.5">
                              <EditableCell value={row[c.key]} onChange={(v) => updateCell(m, c.key, v)} />
                            </td>
                          ))}
                        {showDeductions && (
                          <td className="border-b border-border-soft bg-[#2E6DA4]/8 px-3 py-2 text-right font-semibold whitespace-nowrap text-[#2E6DA4]">
                            {inr(deductionOf(row))}
                          </td>
                        )}
                        {showNetPay && (
                          <td className="border-b border-border-soft bg-[#0D3157]/8 px-3 py-2 text-right font-semibold whitespace-nowrap text-[#0D3157]">
                            {inr(netPayOf(row))}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-border-soft/70 font-semibold">
                    <td className="sticky left-0 z-10 bg-border-soft px-3 py-2.5 whitespace-nowrap text-ink">Total</td>
                    {showEarnings &&
                      earningsCols.map((c) => (
                        <td key={c.key} className="px-3 py-2.5 text-right whitespace-nowrap text-ink">
                          {inr(totals[c.key] ?? 0)}
                        </td>
                      ))}
                    {showGross && <td className="px-3 py-2.5 text-right whitespace-nowrap text-primary">{inr(totals.gross)}</td>}
                    {showDeductions &&
                      DEDUCTION_COLS.map((c) => (
                        <td key={c.key} className="px-3 py-2.5 text-right whitespace-nowrap text-ink">
                          {inr(totals[c.key] ?? 0)}
                        </td>
                      ))}
                    {showDeductions && <td className="px-3 py-2.5 text-right whitespace-nowrap text-[#2E6DA4]">{inr(totals.deduction)}</td>}
                    {showNetPay && <td className="px-3 py-2.5 text-right whitespace-nowrap text-[#0D3157]">{inr(totals.netPay)}</td>}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-5 text-[12px] text-muted">
            <LegendSwatch cls="border border-border bg-white" label="Editable" />
            <LegendSwatch cls="bg-primary-tint" label="Auto Calculated" />
            <LegendSwatch cls="bg-border-soft" label="Read Only" />
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <button type="button" onClick={handleReset} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
              Reset
            </button>
            <button type="button" onClick={() => setLoaded(false)} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
              Cancel
            </button>
            <button type="button" onClick={() => announce("Forecast saved.")} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
              Save
            </button>
            <button
              type="button"
              onClick={() => announce("Forecast saved and generated.")}
              className="flex items-center gap-2 rounded-[9px] bg-accent px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-accent-dark"
            >
              <Icon name="bill-create" className="h-4 w-4" />
              Save &amp; Generate Tax Forecast
            </button>
          </div>
        </>
      )}

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

function ToolbarButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 items-center gap-1.5 rounded-[9px] border-[1.5px] border-border px-3 text-[12.5px] font-semibold text-ink transition-colors hover:border-muted-2"
    >
      <Icon name={icon} className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function Th({ children, tint, auto }: { children: React.ReactNode; tint: "primary" | "success" | "purple"; auto?: boolean }) {
  const tintCls =
    tint === "primary" ? "bg-primary-tint text-primary" : tint === "success" ? "bg-[#2E6DA4]/10 text-[#2E6DA4]" : "bg-[#0D3157]/10 text-[#0D3157]";
  return (
    <th className={`border-b border-border-soft px-3 py-2 text-right text-[10.5px] font-semibold tracking-[0.02em] whitespace-nowrap uppercase ${tintCls}`}>
      {children}
      {auto && <span className="ml-1 opacity-60">Σ</span>}
    </th>
  );
}

function EditableCell({ value, onChange }: { value: number; onChange: (v: string) => void }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-[84px] rounded-[6px] border-[1.5px] border-border bg-white px-2 py-1.5 text-right text-[12.5px] text-ink outline-none focus:border-primary"
    />
  );
}

function LegendSwatch({ cls, label }: { cls: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-3.5 w-3.5 rounded-[4px] ${cls}`} />
      {label}
    </div>
  );
}

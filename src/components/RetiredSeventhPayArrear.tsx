"use client";

import { useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import DataTablePagination from "@/components/DataTablePagination";
import { Toast } from "@/components/form/Field";
import { EMPLOYEE_DIRECTORY } from "@/lib/employee-directory";

const DEPARTMENTS = ["Mumbai Board", "Konkan Board", "Pune Board", "Nagpur Board", "Nashik Board"];
const SUB_DEPARTMENTS = ["Accounts Office", "Engineering Office", "Estate Office", "Administration Office"];
const MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

const EDITABLE_FIELDS = [
  "wpa", "wp", "hpl", "totalDays",
  "dueBasic", "dueDA", "dueHRA", "dueCPF", "dueBC",
  "drawnBasic", "drawnDA", "drawnHRA", "drawnCPF", "drawnBC", "drawnArrear", "drawnMisc", "drawnBCArrear",
  "adjBasic", "adjDA", "adjHRA", "adjCPF", "adjBC",
] as const;
type EditableField = (typeof EDITABLE_FIELDS)[number];
type Row = Record<EditableField, number> & { id: string; month: string; year: number; remarks: string };

function seedRow(month: string, year: number): Row {
  return {
    id: `r-${Math.random().toString(36).slice(2, 9)}`,
    month,
    year,
    wpa: 0,
    wp: 0,
    hpl: 0,
    totalDays: 30,
    dueBasic: 35400,
    dueDA: 16284,
    dueHRA: 9558,
    dueCPF: 3540,
    dueBC: 708,
    drawnBasic: 31200,
    drawnDA: 13104,
    drawnHRA: 8424,
    drawnCPF: 3120,
    drawnBC: 624,
    drawnArrear: 0,
    drawnMisc: 0,
    drawnBCArrear: 0,
    adjBasic: 0,
    adjDA: 0,
    adjHRA: 0,
    adjCPF: 0,
    adjBC: 0,
    remarks: "",
  };
}

function seedRows(): Row[] {
  return [seedRow("January", 2026), seedRow("February", 2026), seedRow("March", 2026), seedRow("April", 2026)];
}

function diffOf(row: Row) {
  const diffBasic = row.dueBasic - row.drawnBasic - row.adjBasic;
  const diffDA = row.dueDA - row.drawnDA - row.adjDA;
  const diffHRA = row.dueHRA - row.drawnHRA - row.adjHRA;
  const totalDiff = diffBasic + diffDA + diffHRA;
  const diffCPF = row.dueCPF - row.drawnCPF - row.adjCPF;
  const diffBC = row.dueBC - row.drawnBC - row.adjBC - row.drawnBCArrear;
  return { diffBasic, diffDA, diffHRA, totalDiff, diffCPF, diffBC };
}

function inr(n: number) {
  return n.toLocaleString("en-IN");
}

export default function RetiredSeventhPayArrear() {
  const [department, setDepartment] = useState("");
  const [subDepartment, setSubDepartment] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [rows, setRows] = useState<Row[]>(seedRows);
  const [expanded, setExpanded] = useState(true);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function announce(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  const employee = EMPLOYEE_DIRECTORY.find((e) => e.id === employeeId) ?? null;

  function handleLoad() {
    if (!employeeId) {
      announce("Select an employee to load payroll data.");
      return;
    }
    setLoaded(true);
    setRows(seedRows());
    announce(`Payroll data loaded for ${employee?.name}.`);
  }

  function handleReset() {
    setRows(seedRows());
    announce("Rows reset to loaded values.");
  }

  function updateCell(id: string, field: EditableField, value: string) {
    const n = Number(value);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: Number.isFinite(n) ? n : 0 } : r)));
  }
  function updateRemarks(id: string, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, remarks: value } : r)));
  }

  function addRow() {
    const last = rows[rows.length - 1];
    const idx = last ? MONTHS.indexOf(last.month) : -1;
    const nextMonth = MONTHS[(idx + 1) % 12];
    const nextYear = last ? (idx === 11 ? last.year + 1 : last.year) : 2026;
    setRows((prev) => [...prev, seedRow(nextMonth, nextYear)]);
  }
  function duplicateRow(id: string) {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], id: `r-${Math.random().toString(36).slice(2, 9)}` };
      return [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)];
    });
  }
  function deleteRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const totals = useMemo(() => {
    const t: Record<EditableField, number> & { diffBasic: number; diffDA: number; diffHRA: number; totalDiff: number; diffCPF: number; diffBC: number } = {
      wpa: 0, wp: 0, hpl: 0, totalDays: 0,
      dueBasic: 0, dueDA: 0, dueHRA: 0, dueCPF: 0, dueBC: 0,
      drawnBasic: 0, drawnDA: 0, drawnHRA: 0, drawnCPF: 0, drawnBC: 0, drawnArrear: 0, drawnMisc: 0, drawnBCArrear: 0,
      adjBasic: 0, adjDA: 0, adjHRA: 0, adjCPF: 0, adjBC: 0,
      diffBasic: 0, diffDA: 0, diffHRA: 0, totalDiff: 0, diffCPF: 0, diffBC: 0,
    };
    rows.forEach((r) => {
      EDITABLE_FIELDS.forEach((f) => {
        t[f] += r[f];
      });
      const d = diffOf(r);
      t.diffBasic += d.diffBasic;
      t.diffDA += d.diffDA;
      t.diffHRA += d.diffHRA;
      t.totalDiff += d.totalDiff;
      t.diffCPF += d.diffCPF;
      t.diffBC += d.diffBC;
    });
    return t;
  }, [rows]);

  /* pagination over rows */
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = rows.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const end = Math.min(safePage * rowsPerPage, rows.length);
  const pageRows = rows.slice(start - 1, end);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader routeKey="retired-seventh-pay-arrear" />

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)] sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <FilterSelect label="Department" value={department} onChange={setDepartment} options={DEPARTMENTS} />
          <FilterSelect label="Sub Department" value={subDepartment} onChange={setSubDepartment} options={SUB_DEPARTMENTS} />
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">Employee</label>
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full rounded-[9px] border-[1.5px] border-border bg-white px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-primary">
              <option value="">Choose Employee</option>
              {EMPLOYEE_DIRECTORY.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} — {e.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full rounded-[9px] border-[1.5px] border-border bg-white px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full rounded-[9px] border-[1.5px] border-border bg-white px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-primary" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={handleLoad} className="flex items-center gap-2 rounded-[9px] bg-primary px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-primary-dark">
            <Icon name="seventh-pay" className="h-4 w-4" />
            Load Payroll Data
          </button>
          <button type="button" onClick={handleReset} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
            Reset
          </button>
          <button type="button" onClick={() => announce("Returning to previous screen.")} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
            Back
          </button>
          <button type="button" onClick={() => announce("Report generated.")} className="rounded-[9px] border-[1.5px] border-primary/40 bg-primary-tint px-5 py-2.5 text-[13.5px] font-semibold text-primary hover:bg-primary-tint/70">
            Show Report
          </button>
        </div>
      </div>

      {loaded && (
        <div className="pb-20">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[15px] font-semibold text-ink">Monthly Pay Comparison</h2>
            <div className="flex flex-wrap items-center gap-1.5">
              <ToolbarButton icon="allowance" label="Add New Row" onClick={addRow} />
              <ToolbarButton icon="chevron" label="Expand All" onClick={() => setExpanded(true)} />
              <ToolbarButton icon="x-circle" label="Collapse All" onClick={() => setExpanded(false)} />
              <ToolbarButton icon="salary-slip" label="Export Excel" onClick={() => announce("Exporting to Excel…")} />
              <ToolbarButton icon="salary-slip" label="Export PDF" onClick={() => announce("Exporting to PDF…")} />
              <ToolbarButton icon="settings" label="Settings" onClick={() => announce("Settings aren't available in this preview.")} />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
            <div className="max-h-[600px] overflow-auto">
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="sticky top-0 z-20">
                    <th rowSpan={2} className="sticky left-0 z-30 border-b border-border-soft bg-border-soft/90 px-3 py-2.5 text-left text-[10px] font-semibold tracking-[0.03em] text-muted uppercase backdrop-blur">
                      Month
                    </th>
                    <GroupTh label="Attendance of Employee" span={4} color="#14487A" />
                    <GroupTh label="Seventh Pay Due" span={5} color="#2E6DA4" />
                    {expanded && <GroupTh label="Sixth Pay Drawn" span={8} color="#4A6FA5" />}
                    {expanded && <GroupTh label="Adjustment Due to Arrear Drawn & Recovery" span={5} color="#6C7A99" />}
                    <GroupTh label="Difference" span={6} color="#0D3157" />
                    <th rowSpan={2} className="border-b border-border-soft bg-border-soft/90 px-3 py-2.5 text-left text-[10px] font-semibold tracking-[0.03em] text-muted uppercase">
                      Remarks
                    </th>
                    <th rowSpan={2} className="border-b border-border-soft bg-border-soft/90 px-3 py-2.5 text-left text-[10px] font-semibold tracking-[0.03em] text-muted uppercase">
                      Actions
                    </th>
                  </tr>
                  <tr className="sticky top-[33px] z-20">
                    <SubTh>WPA</SubTh>
                    <SubTh>WP</SubTh>
                    <SubTh>HPL</SubTh>
                    <SubTh>Total Days</SubTh>
                    <SubTh>Due Basic</SubTh>
                    <SubTh>Due DA</SubTh>
                    <SubTh>Due HRA</SubTh>
                    <SubTh>Due CPF</SubTh>
                    <SubTh>Due BC</SubTh>
                    {expanded && (
                      <>
                        <SubTh>Drawn Basic</SubTh>
                        <SubTh>Drawn DA</SubTh>
                        <SubTh>Drawn HRA</SubTh>
                        <SubTh>Drawn CPF</SubTh>
                        <SubTh>Drawn BC</SubTh>
                        <SubTh>Drawn Arrear</SubTh>
                        <SubTh>Drawn Misc</SubTh>
                        <SubTh>Drawn BC Arrear</SubTh>
                      </>
                    )}
                    {expanded && (
                      <>
                        <SubTh>Adj. Basic</SubTh>
                        <SubTh>Adj. DA</SubTh>
                        <SubTh>Adj. HRA</SubTh>
                        <SubTh>Adj. CPF</SubTh>
                        <SubTh>Adj. BC</SubTh>
                      </>
                    )}
                    <SubTh auto>Diff. Basic</SubTh>
                    <SubTh auto>Diff. DA</SubTh>
                    <SubTh auto>Diff. HRA</SubTh>
                    <SubTh auto>Total Diff.</SubTh>
                    <SubTh auto>Diff. CPF</SubTh>
                    <SubTh auto>Diff. BC</SubTh>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r, i) => {
                    const d = diffOf(r);
                    return (
                      <tr key={r.id} className={`transition-colors hover:bg-primary-tint/40 ${i % 2 === 1 ? "bg-canvas/60" : "bg-surface"}`}>
                        <td className="sticky left-0 z-10 border-b border-border-soft bg-inherit px-3 py-2 font-semibold whitespace-nowrap text-ink">
                          {r.month} {r.year}
                        </td>
                        <EditCell row={r} field="wpa" onChange={updateCell} />
                        <EditCell row={r} field="wp" onChange={updateCell} />
                        <EditCell row={r} field="hpl" onChange={updateCell} />
                        <EditCell row={r} field="totalDays" onChange={updateCell} />
                        <EditCell row={r} field="dueBasic" onChange={updateCell} width={78} />
                        <EditCell row={r} field="dueDA" onChange={updateCell} width={78} />
                        <EditCell row={r} field="dueHRA" onChange={updateCell} width={78} />
                        <EditCell row={r} field="dueCPF" onChange={updateCell} />
                        <EditCell row={r} field="dueBC" onChange={updateCell} />
                        {expanded && (
                          <>
                            <EditCell row={r} field="drawnBasic" onChange={updateCell} width={78} />
                            <EditCell row={r} field="drawnDA" onChange={updateCell} width={78} />
                            <EditCell row={r} field="drawnHRA" onChange={updateCell} width={78} />
                            <EditCell row={r} field="drawnCPF" onChange={updateCell} />
                            <EditCell row={r} field="drawnBC" onChange={updateCell} />
                            <EditCell row={r} field="drawnArrear" onChange={updateCell} />
                            <EditCell row={r} field="drawnMisc" onChange={updateCell} />
                            <EditCell row={r} field="drawnBCArrear" onChange={updateCell} />
                          </>
                        )}
                        {expanded && (
                          <>
                            <EditCell row={r} field="adjBasic" onChange={updateCell} width={70} />
                            <EditCell row={r} field="adjDA" onChange={updateCell} width={70} />
                            <EditCell row={r} field="adjHRA" onChange={updateCell} width={70} />
                            <EditCell row={r} field="adjCPF" onChange={updateCell} />
                            <EditCell row={r} field="adjBC" onChange={updateCell} />
                          </>
                        )}
                        <td className="border-b border-border-soft bg-primary-tint/40 px-2.5 py-2 text-right whitespace-nowrap text-primary">{inr(d.diffBasic)}</td>
                        <td className="border-b border-border-soft bg-primary-tint/40 px-2.5 py-2 text-right whitespace-nowrap text-primary">{inr(d.diffDA)}</td>
                        <td className="border-b border-border-soft bg-primary-tint/40 px-2.5 py-2 text-right whitespace-nowrap text-primary">{inr(d.diffHRA)}</td>
                        <td className="border-b border-border-soft bg-primary-tint/70 px-2.5 py-2 text-right font-semibold whitespace-nowrap text-primary">{inr(d.totalDiff)}</td>
                        <td className="border-b border-border-soft bg-primary-tint/40 px-2.5 py-2 text-right whitespace-nowrap text-primary">{inr(d.diffCPF)}</td>
                        <td className="border-b border-border-soft bg-primary-tint/40 px-2.5 py-2 text-right whitespace-nowrap text-primary">{inr(d.diffBC)}</td>
                        <td className="border-b border-border-soft px-2 py-2">
                          <input
                            value={r.remarks}
                            onChange={(e) => updateRemarks(r.id, e.target.value)}
                            placeholder="Remark…"
                            className="w-[110px] rounded-[6px] border-[1.5px] border-border bg-white px-2 py-1.5 text-[12px] text-ink outline-none focus:border-primary"
                          />
                        </td>
                        <td className="border-b border-border-soft px-2 py-2">
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => duplicateRow(r.id)} title="Duplicate" aria-label={`Duplicate row for ${r.month}`} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink">
                              <Icon name="allowance" className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" onClick={() => deleteRow(r.id)} title="Delete" aria-label={`Delete row for ${r.month}`} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-danger/8 hover:text-danger">
                              <Icon name="x-circle" className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-border-soft/70 font-semibold">
                    <td className="sticky left-0 z-10 bg-border-soft px-3 py-2.5 whitespace-nowrap text-ink">Total</td>
                    <TotalCell value={totals.wpa} />
                    <TotalCell value={totals.wp} />
                    <TotalCell value={totals.hpl} />
                    <TotalCell value={totals.totalDays} />
                    <TotalCell value={totals.dueBasic} />
                    <TotalCell value={totals.dueDA} />
                    <TotalCell value={totals.dueHRA} />
                    <TotalCell value={totals.dueCPF} />
                    <TotalCell value={totals.dueBC} />
                    {expanded && (
                      <>
                        <TotalCell value={totals.drawnBasic} />
                        <TotalCell value={totals.drawnDA} />
                        <TotalCell value={totals.drawnHRA} />
                        <TotalCell value={totals.drawnCPF} />
                        <TotalCell value={totals.drawnBC} />
                        <TotalCell value={totals.drawnArrear} />
                        <TotalCell value={totals.drawnMisc} />
                        <TotalCell value={totals.drawnBCArrear} />
                      </>
                    )}
                    {expanded && (
                      <>
                        <TotalCell value={totals.adjBasic} />
                        <TotalCell value={totals.adjDA} />
                        <TotalCell value={totals.adjHRA} />
                        <TotalCell value={totals.adjCPF} />
                        <TotalCell value={totals.adjBC} />
                      </>
                    )}
                    <TotalCell value={totals.diffBasic} tone />
                    <TotalCell value={totals.diffDA} tone />
                    <TotalCell value={totals.diffHRA} tone />
                    <TotalCell value={totals.totalDiff} tone />
                    <TotalCell value={totals.diffCPF} tone />
                    <TotalCell value={totals.diffBC} tone />
                    <td />
                    <td />
                  </tr>
                </tfoot>
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
              total={rows.length}
              itemLabel="rows"
            />
          </div>

          <button
            type="button"
            onClick={addRow}
            className="mt-3 flex items-center gap-2 rounded-[9px] border-[1.5px] border-dashed border-border px-4 py-2.5 text-[13px] font-semibold text-muted hover:border-primary/40 hover:text-primary"
          >
            <Icon name="allowance" className="h-4 w-4" />
            Add New Row (Next Month)
          </button>

          {/* Sticky bottom action bar */}
          <div className="sticky bottom-0 z-20 mt-6 flex flex-wrap items-center justify-center gap-2.5 rounded-xl border border-border bg-surface/95 p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur">
            <button type="button" onClick={() => announce("Cancelled.")} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
              Cancel
            </button>
            <button type="button" onClick={handleReset} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
              Reset
            </button>
            <button type="button" onClick={() => announce("Arrears recalculated.")} className="rounded-[9px] border-[1.5px] border-primary/40 bg-primary-tint px-5 py-2.5 text-[13.5px] font-semibold text-primary hover:bg-primary-tint/70">
              Calculate
            </button>
            <button type="button" onClick={() => announce("7th Pay arrear data saved.")} className="flex items-center gap-2 rounded-[9px] bg-accent px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-accent-dark">
              <Icon name="bill-create" className="h-4 w-4" />
              Save
            </button>
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
    <button type="button" onClick={onClick} className="flex h-9 items-center gap-1.5 rounded-[9px] border-[1.5px] border-border px-3 text-[12.5px] font-semibold text-ink transition-colors hover:border-muted-2">
      <Icon name={icon} className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function GroupTh({ label, span, color }: { label: string; span: number; color: string }) {
  return (
    <th colSpan={span} className="border-b px-3 py-1.5 text-center text-[10px] font-bold tracking-[0.03em] text-white uppercase" style={{ backgroundColor: color, borderColor: color }}>
      {label}
    </th>
  );
}

function SubTh({ children, auto }: { children: React.ReactNode; auto?: boolean }) {
  return (
    <th className={`border-b border-border-soft px-2.5 py-2 text-right text-[10px] font-semibold tracking-[0.02em] whitespace-nowrap uppercase ${auto ? "bg-primary-tint text-primary" : "bg-border-soft/60 text-muted"}`}>
      {children}
    </th>
  );
}

function EditCell({
  row,
  field,
  onChange,
  width = 60,
}: {
  row: Row;
  field: EditableField;
  onChange: (id: string, field: EditableField, value: string) => void;
  width?: number;
}) {
  return (
    <td className="border-b border-border-soft px-1.5 py-1.5">
      <input
        type="number"
        value={row[field]}
        onChange={(e) => onChange(row.id, field, e.target.value)}
        style={{ width }}
        className="rounded-[6px] border-[1.5px] border-border bg-white px-1.5 py-1.5 text-right text-[11.5px] text-ink outline-none focus:border-primary"
      />
    </td>
  );
}

function TotalCell({ value, tone }: { value: number; tone?: boolean }) {
  return <td className={`px-2.5 py-2.5 text-right whitespace-nowrap ${tone ? "text-primary" : "text-ink"}`}>{inr(value)}</td>;
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import { DateField, Toast } from "@/components/form/Field";
import SearchableSelect from "@/components/SearchableSelect";
import StatusBadge from "@/components/StatusBadge";
import DataTablePagination from "@/components/DataTablePagination";
import { EMPLOYEE_DIRECTORY, type DirectoryEmployee } from "@/lib/employee-directory";

const DEPARTMENTS = ["Mumbai Board", "Konkan Board", "Pune Board", "Nagpur Board", "Nashik Board"];
const BILL_MONTHS = ["April 2026", "May 2026", "June 2026", "July 2026"];

type CalcType = "Amount" | "Percentage";

type Card = {
  id: string;
  type: string;
  calcType: CalcType;
  value: string;
  effectiveFrom: string;
};

type TransactionRow = {
  id: string;
  type: string;
  calcType: CalcType;
  amount: number;
  effectiveFrom: string;
  effectiveTo: string;
  createdOn: string;
  status: "Active" | "Pending" | "Stopped";
};

function statusTone(status: TransactionRow["status"]) {
  if (status === "Active") return "success" as const;
  if (status === "Stopped") return "danger" as const;
  return "warning" as const;
}

/** Mock pay-level/basic-pay derivation for the read-only panel. */
function payDetails(e: DirectoryEmployee) {
  const seed = Number(e.id) % 10;
  const payLevel = `Level ${3 + (seed % 6)}`;
  const basicPay = 30000 + seed * 1200;
  return { payLevel, basicPay };
}

function newCard(): Card {
  return { id: `c-${Math.random().toString(36).slice(2, 9)}`, type: "", calcType: "Amount", value: "", effectiveFrom: "" };
}

function makeHistory(typeOptions: string[]): TransactionRow[] {
  return [
    { id: "H-1", type: typeOptions[0], calcType: "Amount", amount: 1500, effectiveFrom: "2026-04-01", effectiveTo: "—", createdOn: "2026-03-28", status: "Active" },
    { id: "H-2", type: typeOptions[1], calcType: "Percentage", amount: 1770, effectiveFrom: "2026-01-01", effectiveTo: "2026-03-31", createdOn: "2025-12-20", status: "Stopped" },
    { id: "H-3", type: typeOptions[2], calcType: "Amount", amount: 800, effectiveFrom: "2026-06-01", effectiveTo: "—", createdOn: "2026-05-25", status: "Pending" },
    { id: "H-4", type: typeOptions[0], calcType: "Amount", amount: 1500, effectiveFrom: "2025-10-01", effectiveTo: "2026-03-31", createdOn: "2025-09-18", status: "Stopped" },
  ];
}

export default function AllowanceDeductionForm({
  mode,
  typeOptions,
  navGroup,
}: {
  mode: "Allowance" | "Deduction";
  typeOptions: string[];
  navGroup: string;
}) {
  const plural = mode === "Allowance" ? "Allowances" : "Deductions";
  const routeKey = mode === "Allowance" ? "allowance" : "deduction";
  const HISTORY = useMemo(() => makeHistory(typeOptions), [typeOptions]);

  const [department, setDepartment] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [billMonth, setBillMonth] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const employee = EMPLOYEE_DIRECTORY.find((e) => e.id === employeeId) ?? null;
  const pay = employee ? payDetails(employee) : null;

  const [cards, setCards] = useState<Card[]>([]);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function announce(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  function addCard() {
    setCards((prev) => [...prev, newCard()]);
  }
  function removeCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }
  function updateCard(id: string, patch: Partial<Card>) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function resetAll() {
    setCards([]);
  }
  function handleCancel() {
    setEmployeeId("");
    setCards([]);
  }
  function handleSave() {
    announce(`${plural} saved for ${employee?.name}.`);
  }
  function handleSaveContinue() {
    announce(`${plural} saved. Ready for the next entry.`);
    setCards([]);
  }

  const cardAmount = (c: Card) => {
    const n = Number(c.value) || 0;
    if (c.calcType === "Amount") return n;
    return pay ? (n / 100) * pay.basicPay : 0;
  };

  const totalAmount = cards.reduce((sum, c) => sum + cardAmount(c), 0);
  const amountTrend = cards.map(cardAmount);
  const effectiveDates = cards.map((c) => c.effectiveFrom).filter(Boolean).sort();
  const earliestEffective = effectiveDates[0];
  const hasMultipleEffectiveDates = new Set(effectiveDates).size > 1;

  /* ---------------- History table ---------------- */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState<"type" | "effectiveFrom">("effectiveFrom");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return HISTORY.filter((r) => {
      const matchesSearch = q === "" || r.type.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      return a[sortKey] > b[sortKey] ? dir : a[sortKey] < b[sortKey] ? -dir : 0;
    });
  }, [HISTORY, search, statusFilter, sortKey, sortDir]);

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
      <PageHeader
        routeKey={routeKey}
        group={navGroup}
        title={`Assign ${plural}`}
        subtitle={`Search for an employee and assign one or more ${mode.toLowerCase()}s to their pay sheet.`}
      />

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)] sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect label="Department" value={department} onChange={setDepartment} options={DEPARTMENTS} />
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">Bill Number</label>
            <input
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              placeholder="e.g. BILL/2026/0417"
              className="w-full rounded-[9px] border-[1.5px] border-border bg-white px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-primary"
            />
          </div>
          <FilterSelect label="Bill Month" value={billMonth} onChange={setBillMonth} options={BILL_MONTHS} />
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">Employee Search</label>
            <select
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setCards([]);
              }}
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
        </div>
      </div>

      <div className={employee ? "" : "pointer-events-none opacity-40"}>
        {/* Employee Details */}
        {employee && pay && (
          <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-border bg-surface px-4 py-3.5 shadow-[0_1px_2px_rgba(22,35,28,0.04)] sm:grid-cols-4 lg:grid-cols-7">
            <ReadOnlyStat label="Employee ID" value={employee.id} />
            <ReadOnlyStat label="Employee Name" value={employee.name} />
            <ReadOnlyStat label="Designation" value={employee.designation} />
            <ReadOnlyStat label="Department" value={employee.department} />
            <ReadOnlyStat label="Pay Level" value={pay.payLevel} />
            <ReadOnlyStat label="Basic Pay" value={`₹${pay.basicPay.toLocaleString("en-IN")}`} />
            <ReadOnlyStat label="Current Bill Month" value={billMonth || "—"} />
          </div>
        )}

        {/* Allowance/Deduction Details — dynamic cards */}
        <div className="mb-5 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)] sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-ink">{mode} Details</h2>
            <button
              type="button"
              onClick={addCard}
              className="flex items-center gap-1.5 rounded-[8px] bg-accent px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-accent-dark"
            >
              <Icon name="allowance" className="h-3.5 w-3.5" />
              Add {mode}
            </button>
          </div>

          {cards.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-canvas px-4 py-8 text-center text-[13px] text-muted">
              No {mode.toLowerCase()}s added yet. Click <span className="font-medium text-ink">Add {mode}</span> to begin.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {cards.map((c, i) => (
                <div key={c.id} className="relative rounded-xl border border-border bg-canvas p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11.5px] font-semibold text-muted-2 uppercase">
                      {mode} #{i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCard(c.id)}
                      aria-label={`Remove ${mode.toLowerCase()} ${i + 1}`}
                      title="Remove"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-danger/8 hover:text-danger"
                    >
                      <Icon name="x-circle" className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <SearchableSelect
                        label={`${mode} Type`}
                        required
                        value={c.type}
                        onChange={(v) => updateCard(c.id, { type: v })}
                        options={typeOptions}
                        placeholder={`Search ${mode.toLowerCase()} type…`}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">Calculation Type</label>
                      <div className="flex h-[42px] items-center gap-4">
                        {(["Amount", "Percentage"] as CalcType[]).map((t) => (
                          <label key={t} className="flex items-center gap-1.5 text-[13px] text-ink">
                            <input
                              type="radio"
                              name={`calc-${c.id}`}
                              checked={c.calcType === t}
                              onChange={() => updateCard(c.id, { calcType: t })}
                              className="h-4 w-4 accent-accent"
                            />
                            {t}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">
                        {c.calcType === "Amount" ? "Amount (₹)" : "Percentage (%)"}
                      </label>
                      <input
                        type="number"
                        value={c.value}
                        onChange={(e) => updateCard(c.id, { value: e.target.value })}
                        placeholder={c.calcType === "Amount" ? "e.g. 1500" : "e.g. 5"}
                        className="w-full rounded-[9px] border-[1.5px] border-border bg-white px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-primary"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <DateField label="Effective From" value={c.effectiveFrom} onChange={(v) => updateCard(c.id, { effectiveFrom: v })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <AmountKpiCard
            label={`Total ${mode} Amount`}
            amount={totalAmount}
            trend={amountTrend}
            chip="chip-1"
          />
          <CountKpiCard
            label={`Total ${plural} Added`}
            count={cards.length}
            subtitle={`${plural} entries configured`}
            icon={mode === "Allowance" ? "allowance" : "deduction"}
            chip="chip-2"
          />
          <EffectiveDateKpiCard
            date={earliestEffective}
            multiple={hasMultipleEffectiveDates}
            chip="chip-3"
          />
        </div>

        {/* Actions */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2.5">
          <button type="button" onClick={handleCancel} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
            Cancel
          </button>
          <button type="button" onClick={resetAll} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
            Reset
          </button>
          <button type="button" onClick={handleSaveContinue} className="rounded-[9px] border-[1.5px] border-primary/40 bg-primary-tint px-5 py-2.5 text-[13.5px] font-semibold text-primary hover:bg-primary-tint/70">
            Save &amp; Continue
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-[9px] bg-accent px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-accent-dark"
          >
            <Icon name="bill-create" className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      {/* Previous Transactions */}
      <div>
        <h2 className="disp mb-3 text-[16px] font-semibold text-ink">Previous {plural} Transactions</h2>

        <div className="mb-3 rounded-xl border border-border bg-surface p-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr]">
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
                placeholder={`Search ${mode.toLowerCase()} type…`}
                className="h-9.5 w-full rounded-[9px] border-[1.5px] border-border bg-white pr-3 pl-9 text-[13px] text-ink placeholder:text-muted-2 focus:border-primary focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9.5 rounded-[9px] border-[1.5px] border-border bg-white px-3 text-[13px] text-ink focus:border-primary focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Stopped</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
          <div className="max-h-[480px] overflow-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="sticky top-0 z-10 border-b border-border-soft bg-border-soft/70 backdrop-blur">
                  <Th>Sr. No.</Th>
                  <SortableTh label={`${mode} Type`} active={sortKey === "type"} dir={sortDir} onClick={() => toggleSort("type")} />
                  <Th>Calculation Type</Th>
                  <Th>Amount</Th>
                  <SortableTh label="Effective From" active={sortKey === "effectiveFrom"} dir={sortDir} onClick={() => toggleSort("effectiveFrom")} />
                  <Th>Effective To</Th>
                  <Th>Created On</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-muted">
                      No {mode.toLowerCase()} transactions match the current filters.
                    </td>
                  </tr>
                )}
                {pageRows.map((r, i) => (
                  <tr key={r.id} className={`border-b border-border-soft transition-colors last:border-0 hover:bg-primary-tint/50 ${i % 2 === 1 ? "bg-canvas/60" : "bg-surface"}`}>
                    <td className="px-3.5 py-2.5 text-muted">{start + i}</td>
                    <td className="px-3.5 py-2.5 font-medium text-ink">{r.type}</td>
                    <td className="px-3.5 py-2.5 text-muted">{r.calcType}</td>
                    <td className="px-3.5 py-2.5 text-ink">₹{r.amount.toLocaleString("en-IN")}</td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">{r.effectiveFrom}</td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">{r.effectiveTo}</td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-muted">{r.createdOn}</td>
                    <td className="px-3.5 py-2.5">
                      <StatusBadge label={r.status} tone={statusTone(r.status)} />
                    </td>
                    <td className="px-3.5 py-2.5">
                      <button
                        type="button"
                        onClick={() => announce(`Opening ${r.type} for editing…`)}
                        title="Edit"
                        aria-label={`Edit ${r.type}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
                      >
                        <Icon name="pencil" className="h-4 w-4" />
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
            itemLabel={`${mode.toLowerCase()} records`}
          />
        </div>
      </div>

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

function ReadOnlyStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold tracking-[0.03em] text-muted-2 uppercase">{label}</div>
      <div className="mt-0.5 truncate text-[13px] font-medium text-ink">{value}</div>
    </div>
  );
}

/* ---------------- Allowance Details KPI cards ---------------- */

type ChipTone = "chip-1" | "chip-2" | "chip-3" | "chip-4";

const CHIP_CLS: Record<ChipTone, { text: string; bg: string; iconBg: string; border: string }> = {
  "chip-1": { text: "text-chip-1", bg: "bg-chip-1-tint", iconBg: "from-chip-1 to-chip-1/70", border: "bg-chip-1" },
  "chip-2": { text: "text-chip-2", bg: "bg-chip-2-tint", iconBg: "from-chip-2 to-chip-2/70", border: "bg-chip-2" },
  "chip-3": { text: "text-chip-3", bg: "bg-chip-3-tint", iconBg: "from-chip-3 to-chip-3/70", border: "bg-chip-3" },
  "chip-4": { text: "text-chip-4", bg: "bg-chip-4-tint", iconBg: "from-chip-4 to-chip-4/70", border: "bg-chip-4" },
};

/** Animates a numeric value toward `target` whenever it changes. */
function useCountUp(target: number, duration = 500) {
  const [value, setValue] = useState(target);
  const prevTarget = useRef(target);
  useEffect(() => {
    const from = prevTarget.current;
    prevTarget.current = target;
    if (from === target) return;
    const steps = 20;
    const stepMs = duration / steps;
    let step = 0;
    const id = setInterval(() => {
      step += 1;
      const progress = Math.min(1, step / steps);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (target - from) * eased);
      if (progress >= 1) clearInterval(id);
    }, stepMs);
    return () => clearInterval(id);
  }, [target, duration]);
  return value;
}

/** Brief expanding-circle click feedback, themed via the card's chip color. */
function useRipple() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  function onClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 500);
  }
  return { ripples, onClick };
}

function RippleLayer({ ripples, color }: { ripples: { id: number; x: number; y: number }[]; color: string }) {
  return (
    <>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-[kpi-ripple_500ms_ease-out]"
          style={{ left: r.x, top: r.y, backgroundColor: color, borderRadius: "9999px" }}
        />
      ))}
    </>
  );
}

function KpiShell({
  chip,
  icon,
  iconAnimation = "group-hover:rotate-6",
  children,
}: {
  chip: ChipTone;
  icon: string;
  iconAnimation?: string;
  children: React.ReactNode;
}) {
  const cls = CHIP_CLS[chip];
  const { ripples, onClick } = useRipple();
  return (
    <div
      onClick={onClick}
      className={`group relative flex cursor-default items-start gap-3.5 overflow-hidden rounded-xl border border-border ${cls.bg} px-4 py-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)] transition-all duration-250 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_12px_28px_-10px_rgba(22,35,28,0.22)]`}
    >
      <span className={`absolute inset-x-0 top-0 h-[3px] ${cls.border}`} aria-hidden="true" />
      <RippleLayer ripples={ripples} color="rgba(255,255,255,0.6)" />
      <span
        className={`relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${cls.iconBg} text-white shadow-[0_6px_14px_-4px_rgba(0,0,0,0.35)] transition-transform duration-300 ${iconAnimation}`}
      >
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function AmountKpiCard({ label, amount, trend, chip }: { label: string; amount: number; trend: number[]; chip: ChipTone }) {
  const animated = useCountUp(amount);
  const cls = CHIP_CLS[chip];

  const points = trend.length >= 2 ? trend : trend.length === 1 ? [0, trend[0]] : [0, 0];
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const path = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * 60;
      const y = 20 - ((v - min) / range) * 18;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <KpiShell chip={chip} icon="money">
      <div className={`disp text-[21px] leading-tight font-bold text-ink transition-colors`}>
        ₹{Math.round(animated).toLocaleString("en-IN")}
      </div>
      <div className="mt-0.5 text-[11.5px] font-semibold text-ink/70">{label}</div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-[10.5px] text-muted">Across all active allowances</span>
        {trend.length > 0 && (
          <svg viewBox="0 0 60 20" className={`h-4 w-12 flex-shrink-0 ${cls.text}`} preserveAspectRatio="none">
            <path d={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </KpiShell>
  );
}

function CountKpiCard({
  label,
  count,
  subtitle,
  icon,
  chip,
}: {
  label: string;
  count: number;
  subtitle: string;
  icon: string;
  chip: ChipTone;
}) {
  const animated = useCountUp(count);
  const cls = CHIP_CLS[chip];
  const target = 8;
  const pct = Math.min(1, count / target);
  const circumference = 2 * Math.PI * 9;

  return (
    <KpiShell chip={chip} icon={icon} iconAnimation="group-hover:animate-[kpi-pulse_600ms_ease-in-out]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="disp text-[21px] leading-tight font-bold text-ink">{Math.round(animated)}</div>
          <div className="mt-0.5 text-[11.5px] font-semibold text-ink/70">{label}</div>
          <div className="mt-1 text-[10.5px] text-muted">{subtitle}</div>
        </div>
        <svg viewBox="0 0 24 24" className={`h-6 w-6 flex-shrink-0 -rotate-90 ${cls.text}`}>
          <circle cx="12" cy="12" r="9" fill="none" stroke="var(--border-soft)" strokeWidth="3" />
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
            className="transition-all duration-700 ease-out"
          />
        </svg>
      </div>
    </KpiShell>
  );
}

function relativeDateLabel(iso: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return "Starts Today";
  if (diffDays > 0) return `Starts in ${diffDays} Day${diffDays === 1 ? "" : "s"}`;
  return `Active Since ${Math.abs(diffDays)} Day${Math.abs(diffDays) === 1 ? "" : "s"}`;
}

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function EffectiveDateKpiCard({ date, multiple, chip }: { date: string | undefined; multiple: boolean; chip: ChipTone }) {
  return (
    <KpiShell chip={chip} icon="leave-balance">
      {date ? (
        <>
          <div className="disp text-[17px] leading-tight font-bold text-ink">{formatDisplayDate(date)}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-ink/70">
            {multiple ? (
              <span className="group/tt relative inline-flex items-center gap-1">
                Earliest Effective Date
                <Icon name="help" className="h-3 w-3 text-muted-2" />
                <span className="pointer-events-none absolute bottom-full left-0 mb-1.5 w-max max-w-[200px] rounded-[7px] bg-ink px-2.5 py-1.5 text-[10.5px] font-normal text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/tt:opacity-100">
                  The selected allowances have different effective dates — this is the earliest one.
                </span>
              </span>
            ) : (
              "Effective From Date"
            )}
          </div>
          <div className="mt-1 text-[10.5px] text-muted">{relativeDateLabel(date)}</div>
        </>
      ) : (
        <>
          <div className="disp text-[17px] leading-tight font-bold text-muted-2">—</div>
          <div className="mt-0.5 text-[11.5px] font-semibold text-ink/70">Effective From Date</div>
          <div className="mt-1 text-[10.5px] text-muted">No allowances added yet</div>
        </>
      )}
    </KpiShell>
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

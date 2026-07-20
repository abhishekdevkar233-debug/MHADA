"use client";

import { useMemo, useRef, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import { Toast } from "@/components/form/Field";
import SearchableSelect from "@/components/SearchableSelect";
import { EMPLOYEE_DIRECTORY } from "@/lib/employee-directory";

const YEARS = ["2026", "2025", "2024"];
const MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
const BILL_TYPES = ["Regular", "Arrears", "Supplementary"];
const BILL_NUMBERS = ["BILL/2026/0417", "BILL/2026/0398", "BILL/2026/0372", "BILL/2026/0355", "BILL/2026/0341"];

type Stage = "idle" | "confirm" | "processing" | "done";

const PROCESS_STEPS = [
  "Preparing employee salary details…",
  "Calculating deductions…",
  "Generating report…",
];

function seedAmount(billNumber: string) {
  const seed = billNumber.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return 4200000 + (seed % 40) * 15000;
}

export default function BillProcessing() {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [billType, setBillType] = useState("");
  const [billNumber, setBillNumber] = useState("");

  const [stage, setStage] = useState<Stage>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function announce(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }

  const canProcess = Boolean(year && month && billType && billNumber);

  const summary = useMemo(() => {
    if (!billNumber) return null;
    return {
      totalEmployees: EMPLOYEE_DIRECTORY.length * 47,
      status: "Ready to Process",
      createdDate: "12 Jun 2026",
      estimatedAmount: seedAmount(billNumber),
    };
  }, [billNumber]);

  const rows = useMemo(() => EMPLOYEE_DIRECTORY.slice(0, 6), []);

  function handleReset() {
    setYear("");
    setMonth("");
    setBillType("");
    setBillNumber("");
    setStage("idle");
  }

  function handleCancel() {
    announce("Bill processing cancelled.");
    handleReset();
  }

  function openConfirm() {
    if (!canProcess) return;
    setStage("confirm");
  }

  function startProcessing() {
    setStage("processing");
    setStepIndex(0);
    let i = 0;
    const advance = () => {
      i += 1;
      if (i < PROCESS_STEPS.length) {
        setStepIndex(i);
        stepTimer.current = setTimeout(advance, 900);
      } else {
        setStage("done");
        setZoom(100);
        announce("Payroll Bill Processed Successfully.");
      }
    };
    stepTimer.current = setTimeout(advance, 900);
  }

  const processedAt = useMemo(() => {
    if (stage !== "done") return null;
    const d = new Date();
    return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }, [stage]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        routeKey="bill-process"
        group="Payroll Process"
        title="Bill Processing"
        subtitle="Process an existing payroll bill and generate the final payroll output."
      />

      {/* Bill Selection Card */}
      <div className="mb-5 rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
        <h2 className="mb-4 text-[14.5px] font-semibold text-ink">Bill Selection</h2>

        <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
          <FilterSelect label="Payroll Year" value={year} onChange={setYear} options={YEARS} />
          <FilterSelect label="Payroll Month" value={month} onChange={setMonth} options={MONTHS} />
          <FilterSelect label="Bill Type" value={billType} onChange={setBillType} options={BILL_TYPES} />
          <SearchableSelect
            label="Bill Number"
            required
            value={billNumber}
            onChange={setBillNumber}
            options={BILL_NUMBERS}
            placeholder="Search bill number…"
          />
        </div>

        {/* Payroll Summary */}
        <div className="mt-5 border-t border-border-soft pt-4">
          <h3 className="mb-3 text-[12px] font-semibold tracking-[0.02em] text-muted-2 uppercase">
            Payroll Summary
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryItem
              icon="employee"
              label="Total Employees"
              value={summary ? summary.totalEmployees.toLocaleString("en-IN") : "—"}
            />
            <SummaryItem
              icon="attendance"
              label="Bill Status"
              value={summary ? summary.status : "—"}
            />
            <SummaryItem
              icon="leave-balance"
              label="Bill Created Date"
              value={summary ? summary.createdDate : "—"}
            />
            <SummaryItem
              icon="money"
              label="Estimated Payroll Amount"
              value={summary ? `₹${summary.estimatedAmount.toLocaleString("en-IN")}` : "—"}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5 border-t border-border-soft pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2"
          >
            Reset
          </button>
          <button
            type="button"
            disabled={!canProcess}
            onClick={openConfirm}
            className="flex items-center gap-2 rounded-[9px] bg-primary px-6 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-border disabled:text-muted-2"
          >
            <Icon name="bill-process" className="h-4 w-4" />
            Process Bill
          </button>
        </div>
      </div>

      {/* Processing state */}
      {stage === "processing" && (
        <div className="mb-5 rounded-xl border border-border bg-surface p-8 text-center shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-tint">
            <CircularProgress size={24} thickness={4.5} sx={{ color: "var(--primary)" }} />
          </div>
          <h2 className="disp mt-4 text-[16px] font-semibold text-ink">Processing Payroll…</h2>
          <div className="mx-auto mt-5 max-w-sm space-y-2.5 text-left">
            {PROCESS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2.5 text-[13px]">
                {i < stepIndex ? (
                  <Icon name="attendance" className="h-4 w-4 flex-shrink-0 text-success" />
                ) : i === stepIndex ? (
                  <CircularProgress size={16} thickness={5} sx={{ color: "var(--primary)", flexShrink: 0 }} />
                ) : (
                  <span className="h-4 w-4 flex-shrink-0 rounded-full border-[1.5px] border-border" />
                )}
                <span className={i <= stepIndex ? "text-ink" : "text-muted-2"}>{step}</span>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-5 h-1.5 max-w-sm overflow-hidden rounded-full bg-border-soft">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${((stepIndex + 1) / PROCESS_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Success + Result Card */}
      {stage === "done" && (
        <>
          <div className="mb-5 rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success/10 text-success">
                <Icon name="attendance" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-[15px] font-semibold text-ink">Bill Processed</h2>
                <p className="text-[12px] text-muted">The payroll report has been generated below.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ResultItem label="Bill Number" value={billNumber} />
              <ResultItem label="Payroll Period" value={`${month} ${year}`} />
              <ResultItem label="Bill Type" value={billType} />
              <ResultItem label="Employees Processed" value={summary ? summary.totalEmployees.toLocaleString("en-IN") : "—"} />
              <ResultItem label="Processing Date & Time" value={processedAt ?? "—"} />
              <ResultItem
                label="Status"
                value={
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-[12px] font-semibold text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Processed
                  </span>
                }
              />
            </div>
          </div>

          {/* PDF Preview */}
          <div className="mb-5 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
              <h3 className="text-[14px] font-semibold text-ink">Generated Report</h3>
              <div className="flex flex-wrap items-center gap-1.5">
                <PreviewToolButton icon="x-circle" label="Zoom Out" onClick={() => setZoom((z) => Math.max(50, z - 10))} />
                <span className="w-11 text-center text-[12px] font-semibold text-muted">{zoom}%</span>
                <PreviewToolButton icon="allowance" label="Zoom In" onClick={() => setZoom((z) => Math.min(150, z + 10))} />
                <span className="mx-1 h-6 w-px bg-border" />
                <PreviewToolButton icon="chevron-double-left" label="Open in New Tab" onClick={() => window.open("", "_blank")} />
                <PreviewToolButton icon="printer" label="Print" onClick={() => window.print()} />
                <PreviewToolButton icon="salary-slip" label="Download PDF" onClick={() => announce("PDF download isn't available in this preview.")} />
              </div>
            </div>

            <div className="overflow-auto rounded-xl border border-border bg-canvas p-6">
              <div
                className="mx-auto origin-top rounded-[4px] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.12)] transition-transform"
                style={{ width: 820, transform: `scale(${zoom / 100})` }}
              >
                <div className="flex items-center justify-between border-b border-border-soft pb-4">
                  <div>
                    <div className="disp text-[15px] font-bold text-ink">Maharashtra Housing &amp; Area Development Authority</div>
                    <div className="text-[11.5px] text-muted">Payroll Bill Report</div>
                  </div>
                  <span className="rounded-full bg-primary-tint px-3 py-1 text-[11px] font-semibold text-primary">
                    {billNumber}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12px] sm:grid-cols-4">
                  <SlipField label="Bill Type" value={billType} />
                  <SlipField label="Payroll Period" value={`${month} ${year}`} />
                  <SlipField label="Employees" value={String(summary?.totalEmployees ?? "—")} />
                  <SlipField label="Generated" value={processedAt ?? "—"} />
                </div>

                <table className="mt-4 w-full border border-border-soft text-[11.5px]">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th className="px-2.5 py-1.5 text-left">Emp. ID</th>
                      <th className="px-2.5 py-1.5 text-left">Employee Name</th>
                      <th className="px-2.5 py-1.5 text-left">Designation</th>
                      <th className="px-2.5 py-1.5 text-right">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.id} className={i % 2 === 1 ? "bg-canvas" : ""}>
                        <td className="border-t border-border-soft px-2.5 py-1.5 font-mono">{r.id}</td>
                        <td className="border-t border-border-soft px-2.5 py-1.5">{r.name}</td>
                        <td className="border-t border-border-soft px-2.5 py-1.5">{r.designation}</td>
                        <td className="border-t border-border-soft px-2.5 py-1.5 text-right">
                          {(30000 + i * 1500).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-6 flex items-end justify-between text-[11px] text-muted">
                  <span>Generated on {new Date().toISOString().slice(0, 10)}</span>
                  <span className="border-t border-ink pt-1 text-center">Authorised Signatory</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirmation dialog */}
      {stage === "confirm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
            <h3 className="text-[16px] font-semibold text-ink">Process Payroll Bill?</h3>
            <p className="mt-1.5 text-[13px] text-muted">
              You are about to process the selected payroll bill. Once processed, the payroll
              report will be generated.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setStage("idle")}
                className="flex-1 rounded-[9px] border-[1.5px] border-border py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={startProcessing}
                className="flex-1 rounded-[9px] bg-primary py-2.5 text-[13.5px] font-semibold text-white hover:bg-primary-dark"
              >
                Process Bill
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
      <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">
        {label}
        <span className="ml-0.5 text-danger">*</span>
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-[9px] border-[1.5px] border-border bg-white px-3 py-2.5 pr-9 text-[13.5px] text-ink outline-none focus:border-primary"
        >
          <option value="" disabled>
            Choose One
          </option>
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

function SummaryItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[9px] bg-canvas px-3.5 py-2.5">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="truncate text-[11px] text-muted-2">{label}</div>
        <div className="truncate text-[13.5px] font-semibold text-ink">{value}</div>
      </div>
    </div>
  );
}

function ResultItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[9px] bg-canvas px-3.5 py-2.5">
      <div className="text-[11px] text-muted-2">{label}</div>
      <div className="mt-0.5 text-[13.5px] font-semibold text-ink">{value}</div>
    </div>
  );
}

function PreviewToolButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="flex h-8 items-center gap-1.5 rounded-[7px] px-2.5 text-[12px] font-semibold text-ink hover:bg-canvas"
    >
      <Icon name={icon} className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function SlipField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import { Toast } from "@/components/form/Field";
import { EMPLOYEE_DIRECTORY } from "@/lib/employee-directory";

const YEARS = ["2026", "2025", "2024"];
const MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
const BILL_TYPES = ["Regular", "Arrears", "Supplementary"];
const BILL_NUMBERS = ["BILL/2026/0417", "BILL/2026/0398", "BILL/2026/0372"];

function seedBillRows() {
  return EMPLOYEE_DIRECTORY.slice(0, 6).map((e, i) => {
    const basic = 30000 + i * 1500;
    const gross = Math.round(basic * 1.9);
    const deductions = Math.round(basic * 0.22);
    return { ...e, basic, gross, deductions, net: gross - deductions };
  });
}

export default function SalaryBill() {
  const [year, setYear] = useState(YEARS[0]);
  const [month, setMonth] = useState("June");
  const [billType, setBillType] = useState(BILL_TYPES[0]);
  const [billNumber, setBillNumber] = useState(BILL_NUMBERS[0]);
  const [shown, setShown] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [fullScreen, setFullScreen] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function announce(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  const rows = useMemo(() => seedBillRows(), []);
  const totalEarnings = rows.reduce((s, r) => s + r.gross, 0);
  const totalDeductions = rows.reduce((s, r) => s + r.deductions, 0);
  const netPay = totalEarnings - totalDeductions;

  function handleGenerate() {
    setShown(true);
    setZoom(100);
    announce("Bill generated.");
  }
  function handleReset() {
    setYear(YEARS[0]);
    setMonth("June");
    setBillType(BILL_TYPES[0]);
    setBillNumber(BILL_NUMBERS[0]);
    setShown(false);
    setFullScreen(false);
  }
  function handleClose() {
    setShown(false);
    setFullScreen(false);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader routeKey="bill-create" title="Employee Bills" />

      {/* Bill Selection */}
      <div className="mb-5 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect label="Year" value={year} onChange={setYear} options={YEARS} />
            <FilterSelect label="Month" value={month} onChange={setMonth} options={MONTHS} />
            <FilterSelect label="Bill Type" value={billType} onChange={setBillType} options={BILL_TYPES} />
            <FilterSelect label="Bill Number" value={billNumber} onChange={setBillNumber} options={BILL_NUMBERS} />
          </div>
          <div className="flex flex-shrink-0 items-center gap-2.5">
            <button type="button" onClick={handleReset} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
              Reset
            </button>
            <button type="button" onClick={handleGenerate} className="flex items-center gap-2 rounded-[9px] bg-primary px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-primary-dark">
              <Icon name="bill-create" className="h-4 w-4" />
              Generate Bill
            </button>
          </div>
        </div>
      </div>

      {shown && (
        <div className={fullScreen ? "fixed inset-0 z-50 overflow-auto bg-canvas p-6" : ""}>
          {/* Toolbar */}
          <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-surface p-2.5 shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
            <PreviewToolButton icon="x-circle" label="Zoom Out" onClick={() => setZoom((z) => Math.max(50, z - 10))} />
            <span className="w-11 text-center text-[12px] font-semibold text-muted">{zoom}%</span>
            <PreviewToolButton icon="allowance" label="Zoom In" onClick={() => setZoom((z) => Math.min(150, z + 10))} />
            <span className="mx-1 h-6 w-px bg-border" />
            <PreviewToolButton icon="printer" label="Print" onClick={() => window.print()} />
            <PreviewToolButton icon="salary-slip" label="Download PDF" onClick={() => announce("PDF download isn't available in this preview.")} />
            <PreviewToolButton icon="chevron-double-left" label="Full Screen" onClick={() => setFullScreen((v) => !v)} />
          </div>

          {/* Bill Preview */}
          <div className="mb-4 overflow-auto rounded-xl border border-border bg-canvas p-6">
            <div
              className="mx-auto origin-top rounded-[4px] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.12)] transition-transform"
              style={{ width: 820, transform: `scale(${zoom / 100})` }}
            >
              <div className="flex items-center gap-3 border-b border-border-soft pb-4">
                <Image src="/mhada-emblem.png" alt="MHADA" width={476} height={498} className="h-11 w-11 object-contain" />
                <div>
                  <div className="disp text-[15px] font-bold text-ink">Maharashtra Housing &amp; Area Development Authority</div>
                  <div className="text-[11.5px] text-muted">Salary Bill</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12px] sm:grid-cols-4">
                <SlipField label="Department" value="Mumbai Board" />
                <SlipField label="Bill Type" value={billType} />
                <SlipField label="Bill Number" value={billNumber} />
                <SlipField label="Year / Month" value={`${month} ${year}`} />
              </div>

              <table className="mt-4 w-full border border-border-soft text-[11.5px]">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="px-2.5 py-1.5 text-left">Emp. ID</th>
                    <th className="px-2.5 py-1.5 text-left">Employee Name</th>
                    <th className="px-2.5 py-1.5 text-left">Designation</th>
                    <th className="px-2.5 py-1.5 text-right">Gross Earnings</th>
                    <th className="px-2.5 py-1.5 text-right">Deductions</th>
                    <th className="px-2.5 py-1.5 text-right">Net Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 1 ? "bg-canvas" : ""}>
                      <td className="border-t border-border-soft px-2.5 py-1.5 font-mono">{r.id}</td>
                      <td className="border-t border-border-soft px-2.5 py-1.5">{r.name}</td>
                      <td className="border-t border-border-soft px-2.5 py-1.5">{r.designation}</td>
                      <td className="border-t border-border-soft px-2.5 py-1.5 text-right">{r.gross.toLocaleString("en-IN")}</td>
                      <td className="border-t border-border-soft px-2.5 py-1.5 text-right">{r.deductions.toLocaleString("en-IN")}</td>
                      <td className="border-t border-border-soft px-2.5 py-1.5 text-right font-semibold">{r.net.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <TotalBox label="Total Earnings" value={totalEarnings} />
                <TotalBox label="Total Deductions" value={totalDeductions} />
                <TotalBox label="Net Pay" value={netPay} highlight />
              </div>

              <div className="mt-6 flex items-end justify-between text-[11px] text-muted">
                <span>Generated on {new Date().toISOString().slice(0, 10)}</span>
                <span className="border-t border-ink pt-1 text-center">Authorised Signatory</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <button type="button" onClick={handleClose} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
              Close
            </button>
            <button type="button" onClick={() => announce("PDF download isn't available in this preview.")} className="rounded-[9px] border-[1.5px] border-border px-5 py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2">
              Download PDF
            </button>
            <button type="button" onClick={() => window.print()} className="flex items-center gap-2 rounded-[9px] bg-accent px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-accent-dark">
              <Icon name="printer" className="h-4 w-4" />
              Print
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

function PreviewToolButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} title={label} className="flex h-8 items-center gap-1.5 rounded-[7px] px-2.5 text-[12px] font-semibold text-ink hover:bg-canvas">
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

function TotalBox({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-[8px] px-3.5 py-2.5 ${highlight ? "bg-primary-tint" : "bg-canvas"}`}>
      <div className={`text-[10.5px] font-semibold tracking-[0.02em] uppercase ${highlight ? "text-primary" : "text-muted-2"}`}>{label}</div>
      <div className={`disp mt-0.5 text-[15px] font-bold ${highlight ? "text-primary" : "text-ink"}`}>₹{value.toLocaleString("en-IN")}</div>
    </div>
  );
}

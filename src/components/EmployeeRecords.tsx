"use client";

import { useRef, useState } from "react";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import {
  Label,
  TextField,
  DateField,
  SelectField,
  CheckField,
  RadioField,
  MultiCheckList,
  SectionTitle,
  Toast,
  inputCls,
} from "@/components/form/Field";

/* ============================== Data ============================== */

type Employee = {
  no: string;
  name: string;
  status: "FilledUp" | "Pending";
  department: string;
};

const DEPARTMENTS = ["Mumbai Board", "Konkan Board", "Pune Board", "Nagpur Board", "Nashik Board"];

const EMPLOYEES: Employee[] = [
  { no: "71011", name: "BHAGWAN MARUTI SAWANT", status: "FilledUp", department: "Mumbai Board" },
  { no: "69459", name: "KALPANA NANDAN PAWAR", status: "FilledUp", department: "Konkan Board" },
  { no: "69809", name: "SHRI YASHWANT GANPAT GOSAVI", status: "FilledUp", department: "Pune Board" },
  { no: "69540", name: "AKALPITA MOHAN LAD", status: "FilledUp", department: "Mumbai Board" },
  { no: "69789", name: "SHUBHADA MADHUKAR TODANKAR", status: "FilledUp", department: "Nagpur Board" },
  { no: "36539", name: "MR. RAMAKANT BHALCHANDRA MEHER", status: "FilledUp", department: "Nashik Board" },
  { no: "69330", name: "MADHURI SACHIN ZELE", status: "FilledUp", department: "Mumbai Board" },
  { no: "69923", name: "GANESH NARAYAN KHAIRNAR", status: "FilledUp", department: "Pune Board" },
  { no: "69539", name: "PRASHANT GUNDERAO BRAHMAWALE", status: "FilledUp", department: "Konkan Board" },
  { no: "69752", name: "SHRI. ABDUL RAHEMAN. ABDUL RAZZAK", status: "FilledUp", department: "Mumbai Board" },
  { no: "37071", name: "SUNIL RANGRAO PATIL", status: "FilledUp", department: "Nashik Board" },
  { no: "69987", name: "KASHINATH UKHAJI DUDHE", status: "FilledUp", department: "Nagpur Board" },
  { no: "69166", name: "MR. SUHAS GOPINATH PATIL", status: "FilledUp", department: "Mumbai Board" },
  { no: "69916", name: "SHRIKANT DEVIDAS WALHE", status: "FilledUp", department: "Pune Board" },
  { no: "70392", name: "Ranjit Surendra Dikkar", status: "FilledUp", department: "Konkan Board" },
  { no: "41111", name: "PENTAYYA TIPAYYA KOPUL", status: "FilledUp", department: "Mumbai Board" },
  { no: "32222", name: "CHAKSHUPAL DIGAMBAR GHADLE", status: "FilledUp", department: "Nashik Board" },
  { no: "71077", name: "New Applicant", status: "Pending", department: "Mumbai Board" },
];

const CITIES = ["Mumbai", "Thane", "Pune", "Nashik", "Nagpur", "Kolhapur"];
const RELIGIONS = ["Hindu", "Muslim", "Christian", "Buddhist", "Jain", "Sikh", "Other"];
const CASTE_CATEGORIES = ["Open", "OBC", "SC", "ST", "VJNT", "SBC"];
const LANGUAGES = ["Not Applicable", "English", "Urdu", "Kannada", "Gujarati", "Konkani", "Sindhi", "Punjabi", "Tamil", "Telugu"];
const QUALIFICATIONS = [
  "Literate",
  "Illiterate",
  "1st Pass",
  "2nd Pass",
  "3rd Pass",
  "4th Pass",
  "5th Pass",
  "6th Pass",
  "7th Pass",
  "8th Pass",
  "10th Pass (SSC)",
  "12th Pass (HSC)",
  "Graduate",
  "Post Graduate",
];
const APPOINTMENT_TYPES = ["Direct Service", "Promotion", "Transfer", "Compassionate Appointment"];
const RESERVATION_TYPES = ["Not Applicable", "Ex-Serviceman", "Project Affected", "Sports Quota"];
const SOCIAL_RESERVATION = ["Open", "Scheduled Caste 1", "Scheduled Tribe 1", "OBC 1", "VJNT 1"];
const DESIGNATIONS = ["46 Branch Engineer", "Junior Engineer", "Assistant Engineer", "Section Officer", "Clerk", "Superintendent"];
const PAY_SCALES = ["0-1000000-0", "Level 1", "Level 3", "Level 6", "Level 8", "Level 10"];
const CADRE_STATUS = ["Permanent", "Temporary", "Probation", "Officiating"];
const BANK_NAMES = ["Bank of Maharashtra", "State Bank of India", "Bank of India", "Union Bank of India"];
const BRANCHES = ["01 Bandra East", "02 Andheri West", "03 Dadar", "04 Pune Camp"];
const DISABILITY_TYPES = ["Not Applicable", "Visual", "Hearing", "Locomotor", "Other"];

const STEPS = [
  "Personal & Official",
  "Appointment & Salary",
  "Character & Legal",
  "Languages, Education & Photo",
  "Caste Details",
];

/* ============================== Main component ============================== */

export default function EmployeeRecords() {
  const [mode, setMode] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Employee | null>(null);
  const [step, setStep] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function announce(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  function openAdd() {
    setEditing(null);
    setStep(0);
    setMode("form");
  }

  function openEdit(emp: Employee) {
    setEditing(emp);
    setStep(0);
    setMode("form");
  }

  function closeForm() {
    setMode("list");
    setEditing(null);
    setStep(0);
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      announce(editing ? "Employee record updated successfully." : "Employee record saved successfully.");
      closeForm();
    }
  }

  const total = EMPLOYEES.length;
  const filledUp = EMPLOYEES.filter((e) => e.status === "FilledUp").length;
  const pending = total - filledUp;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          routeKey="employee-records"
          subtitle="Add a new employee or update an existing service record across five sections of the service book."
          bare
        />
        {mode === "list" && (
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 rounded-[9px] bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            <Icon name="allowance" className="h-4 w-4" />
            Add New Employee
          </button>
        )}
      </div>

      {mode === "list" ? (
        <ListView total={total} filledUp={filledUp} pending={pending} onEdit={openEdit} onViewReport={(e) => announce(`Opening report for ${e.name}…`)} />
      ) : (
        <FormView
          key={editing?.no ?? "new"}
          editing={editing}
          step={step}
          setStep={setStep}
          onNext={next}
          onCancel={closeForm}
          onSaveDraft={() => announce("Draft saved.")}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}

/* ============================== List view ============================== */

const ROWS_PER_PAGE_OPTIONS = [10, 12, 25, 50];
const STATUS_OPTIONS: Array<"All" | "FilledUp" | "Pending"> = ["All", "FilledUp", "Pending"];

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "primary" | "success" | "warning";
  icon: string;
}) {
  const toneCls =
    tone === "success"
      ? "bg-success-tint text-success"
      : tone === "warning"
        ? "bg-warning-tint text-warning"
        : "bg-primary-tint text-primary";
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-border bg-surface px-5 py-5">
      <span className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${toneCls}`}>
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <div>
        <div className="disp text-[22px] leading-none font-semibold text-ink">{value}</div>
        <div className="mt-1.5 text-[12px] font-medium text-muted">{label}</div>
      </div>
    </div>
  );
}

function ListView({
  total,
  filledUp,
  pending,
  onEdit,
  onViewReport,
}: {
  total: number;
  filledUp: number;
  pending: number;
  onEdit: (e: Employee) => void;
  onViewReport: (e: Employee) => void;
}) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState<"All" | "FilledUp" | "Pending">("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const hasFilters = search.trim() !== "" || department !== "All" || status !== "All";

  const filtered = EMPLOYEES.filter((e) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = q === "" || e.name.toLowerCase().includes(q) || e.no.includes(q);
    const matchesDept = department === "All" || e.department === department;
    const matchesStatus = status === "All" || e.status === status;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = filtered.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const end = Math.min(safePage * rowsPerPage, filtered.length);
  const pageRows = filtered.slice(start - 1, end);

  function updateFilter(fn: () => void) {
    fn();
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setDepartment("All");
    setStatus("All");
    setPage(1);
  }

  return (
    <div>
      {/* Summary stat cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total Employees" value={total} tone="primary" icon="employee" />
        <StatCard label="Filled Up" value={filledUp} tone="success" icon="attendance" />
        <StatCard label="Pending" value={pending} tone="warning" icon="bell" />
      </div>

      {/* Filter bar */}
      <div className="mb-4 rounded-xl border border-border bg-surface p-3.5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-2">
              <Icon name="search" className="h-4 w-4" />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => updateFilter(() => setSearch(e.target.value))}
              placeholder="Search Employee (Name / Employee ID)"
              aria-label="Search Employee"
              className="h-9.5 w-full rounded-[9px] border-[1.5px] border-border bg-white pr-3 pl-9 text-[13px] text-ink placeholder:text-muted-2 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={department}
              onChange={(e) => updateFilter(() => setDepartment(e.target.value))}
              aria-label="Department Filter"
              className="h-9.5 w-full appearance-none rounded-[9px] border-[1.5px] border-border bg-white px-3 pr-9 text-[13px] text-ink focus:border-primary focus:outline-none"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-2">
              <Icon name="chevron" className="h-3.5 w-3.5 rotate-90" />
            </span>
          </div>

          <div className="relative">
            <select
              value={status}
              onChange={(e) => updateFilter(() => setStatus(e.target.value as typeof status))}
              aria-label="Status Filter"
              className="h-9.5 w-full appearance-none rounded-[9px] border-[1.5px] border-border bg-white px-3 pr-9 text-[13px] text-ink focus:border-primary focus:outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All Statuses" : s === "FilledUp" ? "Filled Up" : "Pending"}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-2">
              <Icon name="chevron" className="h-3.5 w-3.5 rotate-90" />
            </span>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasFilters}
            className="flex h-9.5 items-center justify-center gap-1.5 rounded-[9px] border-[1.5px] border-border px-3.5 text-[13px] font-semibold text-ink transition-colors hover:border-muted-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="x-circle" className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
        <div className="max-h-[600px] overflow-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-border-soft bg-border-soft/70 backdrop-blur">
                <th className="w-16 px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-muted uppercase">Sr. No.</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-muted uppercase">Applicant Name</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-muted uppercase">Department</th>
                <th className="w-32 px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-muted uppercase">Status</th>
                <th className="w-28 px-4 py-3 text-left text-[11px] font-semibold tracking-[0.04em] text-muted uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-[13px] text-muted">
                    No employees match the current filters.
                  </td>
                </tr>
              )}
              {pageRows.map((e, i) => (
                <tr
                  key={e.no}
                  className={`border-b border-border-soft transition-colors last:border-0 hover:bg-primary-tint/50 ${
                    i % 2 === 1 ? "bg-canvas/60" : "bg-surface"
                  }`}
                >
                  <td className="px-4 py-3 text-muted">{start + i}</td>
                  <td className="px-4 py-3 font-medium text-ink">
                    <span className="mr-1.5 font-mono text-[12px] text-muted-2">{e.no}</span>
                    {e.name}
                  </td>
                  <td className="px-4 py-3 text-muted">{e.department}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        e.status === "FilledUp"
                          ? "bg-primary-tint text-primary"
                          : "bg-accent-tint text-accent-dark"
                      }`}
                    >
                      {e.status === "FilledUp" ? "Filled Up" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onEdit(e)}
                        title="Edit"
                        aria-label={`Edit ${e.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary-tint"
                      >
                        <Icon name="pencil" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onViewReport(e)}
                        title="View Report"
                        aria-label={`View report for ${e.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-canvas hover:text-ink"
                      >
                        <Icon name="eye" className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-soft px-4 py-3">
          <div className="text-[12.5px] text-muted">
            {filtered.length === 0
              ? "No employees to show"
              : `Showing ${start}–${end} of ${filtered.length} Employees`}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[12.5px] text-muted">
              Rows per page
              <div className="relative">
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  aria-label="Rows Per Page"
                  className="h-8 appearance-none rounded-[7px] border-[1.5px] border-border bg-white py-0 pr-6 pl-2 text-[12.5px] text-ink focus:border-primary focus:outline-none"
                >
                  {ROWS_PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-muted-2">
                  <Icon name="chevron" className="h-3 w-3 rotate-90" />
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex h-8 items-center gap-1 rounded-[7px] border-[1.5px] border-border px-2.5 text-[12.5px] font-semibold text-ink transition-colors hover:border-muted-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="chevron" className="h-3.5 w-3.5 rotate-180" />
                Previous
              </button>

              <div className="mx-1 flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (n) =>
                      totalPages <= 7 ||
                      n === 1 ||
                      n === totalPages ||
                      Math.abs(n - safePage) <= 1,
                  )
                  .reduce<number[]>((acc, n) => {
                    if (acc.length > 0 && n - acc[acc.length - 1] > 1) acc.push(-1);
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, idx) =>
                    n === -1 ? (
                      <span key={`gap-${idx}`} className="px-1 text-muted-2">
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        aria-current={n === safePage ? "page" : undefined}
                        className={`flex h-8 w-8 items-center justify-center rounded-[7px] text-[12.5px] font-semibold transition-colors ${
                          n === safePage
                            ? "bg-primary text-white"
                            : "text-ink hover:bg-canvas"
                        }`}
                      >
                        {n}
                      </button>
                    ),
                  )}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex h-8 items-center gap-1 rounded-[7px] border-[1.5px] border-border px-2.5 text-[12.5px] font-semibold text-ink transition-colors hover:border-muted-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <Icon name="chevron" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== Form (wizard) view ============================== */

function FormView({
  editing,
  step,
  setStep,
  onNext,
  onCancel,
  onSaveDraft,
}: {
  editing: Employee | null;
  step: number;
  setStep: (n: number) => void;
  onNext: () => void;
  onCancel: () => void;
  onSaveDraft: () => void;
}) {
  const isLast = step === STEPS.length - 1;

  return (
    <div>
      <button
        type="button"
        onClick={onCancel}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink"
      >
        <Icon name="chevron" className="h-4 w-4 rotate-180" />
        Back to employee list
      </button>

      <div className="rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(22,35,28,0.04)] sm:p-6">
        <div className="mb-1 text-[13px] font-semibold text-accent-dark">
          {editing ? `Editing ${editing.name} · ${editing.no}` : "New Employee"}
        </div>

        {/* Stepper */}
        <div className="mb-7 flex items-start overflow-x-auto pb-1">
          {STEPS.map((label, i) => {
            const state = i < step ? "done" : i === step ? "active" : "upcoming";
            return (
              <div key={label} className="relative flex min-w-[125px] flex-1 flex-col items-center">
                {i < STEPS.length - 1 && (
                  <span
                    className={`absolute top-4 left-[calc(50%+18px)] right-[calc(-50%+18px)] h-0.5 ${
                      i < step ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => i <= step && setStep(i)}
                  disabled={i > step}
                  className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-[13px] font-bold transition-colors ${
                    state === "done"
                      ? "border-primary bg-primary text-white"
                      : state === "active"
                        ? "border-accent bg-accent text-white"
                        : "border-border bg-white text-muted-2"
                  }`}
                >
                  {i < step ? <Icon name="attendance" className="h-4 w-4" /> : i + 1}
                </button>
                <span className={`mt-2 max-w-[120px] text-center text-[11.5px] font-semibold ${i === step ? "text-ink" : "text-muted"}`}>
                  {label}
                </span>
                <span className="text-[10.5px] text-muted-2">Page {i + 1}</span>
              </div>
            );
          })}
        </div>

        <StepPersonal editing={editing} hidden={step !== 0} />
        <StepAppointment hidden={step !== 1} />
        <StepCharacter hidden={step !== 2} />
        <StepLanguagesEducation hidden={step !== 3} />
        <StepCaste hidden={step !== 4} />

        <div className="mt-6 flex items-center gap-2.5 border-t border-border-soft pt-5">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            className="rounded-[9px] border-[1.5px] border-border px-4 py-2.5 text-[13.5px] font-semibold text-ink transition-colors hover:border-muted-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onSaveDraft}
            className="rounded-[9px] border-[1.5px] border-border px-4 py-2.5 text-[13.5px] font-semibold text-ink transition-colors hover:border-muted-2"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={onNext}
            className="rounded-[9px] bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            {isLast ? "Save Record" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page 1: Personal & Official Information ---------- */
function StepPersonal({ editing, hidden }: { editing: Employee | null; hidden: boolean }) {
  return (
    <div className={hidden ? "hidden" : ""}>
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Find Employee" placeholder="Search existing employee…" />
        <TextField label="Employee No." disabled defaultValue={editing?.no ?? "Auto-generated"} />
      </div>

      <SectionTitle>Name</SectionTitle>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextField label="Employee Name (Marathi) — Last Name" required />
        <TextField label="First Name" required />
        <TextField label="Middle Name" required />
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextField label="Employee Name (English) — Last Name" required defaultValue={editing ? editing.name.split(" ").slice(-1)[0] : undefined} />
        <TextField label="First Name" required defaultValue={editing ? editing.name.split(" ")[0] : undefined} />
        <TextField label="Middle Name" required />
      </div>
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Mother's Full Name" required />
        <TextField label="Gender" required />
      </div>

      <SectionTitle>Address</SectionTitle>
      <div className="mb-4 grid grid-cols-1 gap-4">
        <TextField label="Current Address" required span={3} />
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField label="City" required options={CITIES} />
        <TextField label="Pin Code" />
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4">
        <TextField label="Permanent Address" required span={3} />
      </div>
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField label="City" required options={CITIES} />
        <TextField label="Pin Code" required />
      </div>

      <SectionTitle>Personal Details</SectionTitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RadioField label="Gender" required options={["Male", "Female"]} />
        <DateField label="Date of Birth" required />
        <TextField label="Mobile No." />
        <TextField label="Contact No." />
        <TextField label="Birth Place" required />
        <TextField label="Birth Mark" required />
        <TextField label="Height" required />
        <TextField label="Email ID" />
        <SelectField label="Blood Group" options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
        <SelectField label="Mother Tongue" required options={["Marathi", "Hindi", "English", "Gujarati", "Urdu"]} />
        <SelectField label="Religion" required options={RELIGIONS} />
        <SelectField label="Local / Ectopic" required options={["Local", "Ectopic"]} />
        <SelectField label="Caste" required options={["None", "Category 1", "Category 2", "Category 3"]} />
        <TextField label="Caste Category" required />
        <TextField label="Employment No." />
        <SelectField label="Employment Office" options={["Mumbai Employment Exchange", "Pune Employment Exchange", "Nagpur Employment Exchange"]} />
        <TextField label="Aadhaar Card No." />
        <TextField label="Election Card No." />
        <TextField label="Accident Insurance Membership No." span={2} />
      </div>
    </div>
  );
}

/* ---------- Page 2: Appointment & Salary ---------- */
function StepAppointment({ hidden }: { hidden: boolean }) {
  return (
    <div className={hidden ? "hidden" : ""}>
      <SectionTitle>Appointment Details</SectionTitle>
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField label="Type of Appointment" required options={APPOINTMENT_TYPES} defaultValue="Direct Service" />
        <SelectField label="Parallel Reservation Type" options={RESERVATION_TYPES} />
        <TextField label="Appointment Order Number" required defaultValue="WBP/ESTT/310" />
        <DateField label="Order Date" required defaultValue="1986-01-27" />
        <SelectField label="Social Reservation Type" required options={SOCIAL_RESERVATION} defaultValue="Scheduled Caste 1" />
        <SelectField label="Post / Designation" required options={DESIGNATIONS} defaultValue="46 Branch Engineer" />
        <DateField label="Joining Date" required defaultValue="1986-01-27" />
        <SelectField label="Department" disabled options={["0002 Mumbai Housing & Area Development Board"]} defaultValue="0002 Mumbai Housing & Area Development Board" />
        <SelectField label="Sub-Department" disabled options={["1 Chief Officer"]} defaultValue="1 Chief Officer" />
        <SelectField label="Secretary Sub-Division" required options={["1 Chief Officer", "2 Deputy Officer"]} defaultValue="1 Chief Officer" />
      </div>

      <SectionTitle>Disability</SectionTitle>
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CheckField label="Is Disabled?" />
        <SelectField label="Disability Type" disabled options={DISABILITY_TYPES} defaultValue="Not Applicable" />
        <TextField label="Disability Percentage" suffix="%" />
        <CheckField label="Any Other Disability?" />
      </div>

      <SectionTitle>Pay Details</SectionTitle>
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField label="Pay Scale" required options={PAY_SCALES} defaultValue="0-1000000-0" />
        <TextField label="Grade Pay" required defaultValue="2400" />
        <TextField label="Current Basic Pay" disabled defaultValue="8550" />
        <div className="sm:col-span-2 lg:col-span-1">
          <Label>Old Basic Pay</Label>
          <div className="flex gap-2">
            <input className={inputCls} defaultValue="7000" />
            <button
              type="button"
              className="flex-shrink-0 rounded-[9px] bg-accent-tint px-3 text-[12px] font-semibold whitespace-nowrap text-accent-dark hover:bg-accent-tint/70"
            >
              CTA Rule
            </button>
          </div>
        </div>
        <DateField label="Increment Date" required defaultValue="2021-07-01" />
        <DateField label="Retirement Date" required defaultValue="2024-05-31" />
        <SelectField label="Cadre Status" required options={CADRE_STATUS} defaultValue="Permanent" />
        <TextField label="PAN Number" defaultValue="AAZPM3029L" />
      </div>

      <SectionTitle>Bank Details</SectionTitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField label="Bank Name" required options={BANK_NAMES} defaultValue="Bank of Maharashtra" />
        <SelectField label="Branch Name" required options={BRANCHES} defaultValue="01 Bandra East" />
        <TextField label="Account Number" required defaultValue="20045365522" />
      </div>
    </div>
  );
}

/* ---------- Page 3: Character & Legal ---------- */
function StepCharacter({ hidden }: { hidden: boolean }) {
  return (
    <div className={hidden ? "hidden" : "grid grid-cols-1 gap-4 sm:grid-cols-2"}>
      <CheckField label="Prior Character Verification Report Submitted?" />
      <TextField label="Prior Character Verification Order No." />
      <TextField label="Prior Character Verification Order Date" />
      <CheckField label="Work Certificate Issued?" />
      <TextField label="Work Certificate Order No." disabled />
      <TextField label="Work Certificate Order Date" disabled />
      <CheckField label="Departmental Enquiry Ongoing?" defaultChecked />
      <TextField label="Departmental Enquiry Order No." defaultValue="C.O./D.E./A-3/3187/99" />
      <DateField label="Departmental Enquiry Order Date" defaultValue="1999-06-09" />
      <div />
      <CheckField label="Court Case Filed Regarding Appointment?" />
      <TextField label="Court Case Remark" />
      <CheckField label="Regularization Done?" />
      <TextField label="Regularization Order No." />
      <TextField label="Regularization Order Date" />
      <TextField label="Remark" />
    </div>
  );
}

/* ---------- Page 4: Languages, Education & Photo ---------- */
function StepLanguagesEducation({ hidden }: { hidden: boolean }) {
  return (
    <div className={hidden ? "hidden" : ""}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <MultiCheckList label="Known Languages" options={LANGUAGES} />
        <MultiCheckList label="Educational Qualification" required options={QUALIFICATIONS} />
      </div>

      <div className="mt-6">
        <Label>Photograph</Label>
        <div className="flex flex-wrap items-start gap-5">
          <div className="flex h-28 w-28 flex-shrink-0 flex-col items-center justify-center rounded-xl border-[1.5px] border-dashed border-border bg-border-soft text-center text-[11px] font-medium text-muted-2">
            NO IMAGE
            <br />
            AVAILABLE
          </div>
          <div>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-[8px] border-[1.5px] border-border px-3.5 py-2 text-[12.5px] font-semibold text-ink hover:border-muted-2">
                Choose File
              </button>
              <button type="button" className="rounded-[8px] bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-primary-dark">
                Upload
              </button>
            </div>
            <p className="mt-2 text-[11.5px] font-medium text-danger">
              Upload passport size photo of less than 1MB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page 5: Caste Details ---------- */
function StepCaste({ hidden }: { hidden: boolean }) {
  return (
    <div className={hidden ? "hidden" : ""}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TextField label="Caste" placeholder="Caste" />
        <SelectField label="Category" options={CASTE_CATEGORIES} defaultValue="Open" />
        <TextField label="Caste Certificate No." placeholder="Certificate number" />
        <TextField label="Validity Certificate No." placeholder="Validity certificate number" />
      </div>
      <div className="mt-4 rounded-[9px] bg-border-soft px-4 py-3 text-[12.5px] text-muted">
        This is the final section. Review all entries, then click{" "}
        <span className="font-semibold text-ink">Save Record</span> to write this
        record to the employee master.
      </div>
    </div>
  );
}

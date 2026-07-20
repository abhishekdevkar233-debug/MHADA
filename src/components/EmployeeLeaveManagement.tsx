"use client";

import { useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import {
  SectionTitle,
  TextField,
  TextAreaField,
  DateField,
  SelectField,
  RadioField,
  Toast,
} from "@/components/form/Field";
import EmployeeSearchCard from "@/components/EmployeeSearchCard";
import type { DirectoryEmployee } from "@/lib/employee-directory";

const LEAVE_TYPES = ["Casual Leave", "Sick Leave", "Earned Leave", "Half Pay Leave", "Maternity Leave", "Compensatory Leave"];
const SESSIONS = ["Full Day", "First Half", "Second Half"];

type LeaveStatus = "Draft" | "Pending Approval" | "Sanctioned";

function statusBadgeCls(status: LeaveStatus) {
  if (status === "Sanctioned") return "bg-primary-tint text-primary";
  if (status === "Pending Approval") return "bg-accent-tint text-accent-dark";
  return "bg-border-soft text-muted";
}

export default function EmployeeLeaveManagement() {
  const [employee, setEmployee] = useState<DirectoryEmployee | null>(null);

  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [session, setSession] = useState("Full Day");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<LeaveStatus>("Draft");

  const [orderNo, setOrderNo] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [approvalRemarks, setApprovalRemarks] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function announce(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  const isSingleDay = fromDate !== "" && fromDate === toDate;

  const totalDays = useMemo(() => {
    if (!fromDate || !toDate) return null;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (to < from) return null;
    const days = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
    if (days === 1 && session !== "Full Day") return 0.5;
    return days;
  }, [fromDate, toDate, session]);

  function validateLeaveDetails() {
    const next: Record<string, string> = {};
    if (!leaveType) next.leaveType = "Select a leave type.";
    if (!fromDate) next.fromDate = "From date is required.";
    if (!toDate) next.toDate = "To date is required.";
    if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
      next.toDate = "To date cannot be before the from date.";
    }
    if (!reason.trim()) next.reason = "Reason for leave is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const leaveDetailsValid =
    Boolean(leaveType && fromDate && toDate && reason.trim()) &&
    !(fromDate && toDate && new Date(toDate) < new Date(fromDate));

  const approvalEnabled = Boolean(employee) && leaveDetailsValid;

  function resetLeaveForm() {
    setLeaveType("");
    setFromDate("");
    setToDate("");
    setSession("Full Day");
    setReason("");
    setStatus("Draft");
    setOrderNo("");
    setOrderDate("");
    setApprovalRemarks("");
    setErrors({});
  }

  function handleSelectEmployee(e: DirectoryEmployee | null) {
    setEmployee(e);
    resetLeaveForm();
  }

  function handleCancel() {
    setEmployee(null);
    resetLeaveForm();
  }

  function handleSave() {
    if (!validateLeaveDetails()) return;
    setStatus((s) => (s === "Draft" ? "Pending Approval" : s));
    announce(`Leave request saved for ${employee?.name}.`);
  }

  function requestApproval() {
    if (!validateLeaveDetails()) return;
    if (!orderNo.trim() || !orderDate) {
      setErrors((e) => ({
        ...e,
        orderNo: orderNo.trim() ? undefined : "Order number is required to sanction.",
        orderDate: orderDate ? undefined : "Order date is required to sanction.",
      }) as Record<string, string>);
      return;
    }
    setConfirmOpen(true);
  }

  function confirmApproval() {
    setStatus("Sanctioned");
    setConfirmOpen(false);
    announce(`Leave sanctioned for ${employee?.name}.`);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          routeKey="employee-leave"
          subtitle="Record a leave request, sanction it, and log the order reference — all in one place."
          bare
        />
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold ${statusBadgeCls(status)}`}>
          {status}
        </span>
      </div>

      {/* Employee Information */}
      <div className="mb-5">
        <EmployeeSearchCard employee={employee} onSelect={handleSelectEmployee} required />
      </div>

      <div className={employee ? "space-y-5" : "pointer-events-none space-y-5 opacity-40"}>
        {/* Leave Details */}
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <SectionTitle>Leave Details</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField
              label="Leave Type"
              required
              options={LEAVE_TYPES}
              value={leaveType}
              onChange={setLeaveType}
            />
            <DateField label="From Date" required value={fromDate} onChange={setFromDate} error={errors.fromDate} />
            <DateField
              label="To Date"
              required
              value={toDate}
              onChange={setToDate}
              min={fromDate || undefined}
              error={errors.toDate}
            />
            <TextField label="Total Leave Days" disabled value={totalDays !== null ? String(totalDays) : ""} placeholder="Auto-calculated" />
            <RadioField label="Session" options={SESSIONS} value={session} onChange={setSession} />
            <div className="sm:col-span-2 lg:col-span-3">
              <TextAreaField label="Reason for Leave" required value={reason} onChange={setReason} placeholder="Brief reason for the leave request…" />
              {errors.reason && <p className="mt-1 text-[11.5px] font-medium text-danger">{errors.reason}</p>}
            </div>
          </div>
          {!isSingleDay && fromDate && toDate && (
            <p className="mt-3 text-[11.5px] text-muted-2">
              Session applies only to single-day leave requests.
            </p>
          )}
        </div>

        {/* Approval Information */}
        <div className={`rounded-xl border border-border bg-surface p-4 sm:p-5 ${!approvalEnabled ? "opacity-50" : ""}`}>
          <SectionTitle>Approval Information</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField
              label="Order Number"
              value={orderNo}
              onChange={setOrderNo}
              disabled={!approvalEnabled}
              placeholder="e.g. MHADA/LV/2026/0341"
              error={errors.orderNo}
            />
            <DateField label="Order Date" value={orderDate} onChange={setOrderDate} disabled={!approvalEnabled} error={errors.orderDate} />
            <TextField
              label="Remarks"
              value={approvalRemarks}
              onChange={setApprovalRemarks}
              disabled={!approvalEnabled}
              placeholder="Optional approval remark"
            />
          </div>
          <button
            type="button"
            onClick={requestApproval}
            disabled={!approvalEnabled || status === "Sanctioned"}
            className="mt-4 flex items-center gap-2 rounded-[9px] bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="attendance" className="h-4 w-4" />
            {status === "Sanctioned" ? "Sanctioned" : "Sanction / Approve Leave"}
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={resetLeaveForm}
            className="rounded-[9px] border-[1.5px] border-border px-4 py-2.5 text-[13.5px] font-semibold text-ink transition-colors hover:border-muted-2"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-[9px] border-[1.5px] border-border px-4 py-2.5 text-[13.5px] font-semibold text-ink transition-colors hover:border-muted-2"
          >
            Cancel
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-[9px] bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            Save
          </button>
        </div>
      </div>

      {!employee && (
        <p className="mt-3 text-center text-[12.5px] text-muted-2">
          Select an employee above to begin a leave request.
        </p>
      )}

      {/* Confirmation dialog before approval */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
            <h3 className="text-[16px] font-semibold text-ink">Sanction this leave?</h3>
            <p className="mt-1.5 text-[13px] text-muted">
              {employee?.name} will be marked on{" "}
              <span className="font-medium text-ink">
                {leaveType} · {totalDays} day{totalDays === 1 ? "" : "s"}
              </span>{" "}
              ({fromDate} to {toDate}). This action records order{" "}
              <span className="font-medium text-ink">{orderNo}</span>.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-[9px] border-[1.5px] border-border py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmApproval}
                className="flex-1 rounded-[9px] bg-primary py-2.5 text-[13.5px] font-semibold text-white hover:bg-primary-dark"
              >
                Confirm Sanction
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} />
    </div>
  );
}

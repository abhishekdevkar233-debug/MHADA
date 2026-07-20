"use client";

/**
 * Shared form field kit for the MHADA payroll screens — extracted from
 * Employee Records so every screen (Employee Records, Leave Balance
 * Correction, Employee Leave Management, …) renders the same inputs,
 * spacing, and validation styling.
 */

export const inputCls =
  "w-full rounded-[9px] border-[1.5px] border-border bg-white px-3 py-2.5 text-[13.5px] text-ink outline-none transition-colors focus:border-primary disabled:bg-border-soft disabled:text-muted";

export function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">
      {children}
      {required && <span className="ml-0.5 text-danger">*</span>}
    </label>
  );
}

export function TextField({
  label,
  required,
  disabled,
  value,
  defaultValue,
  onChange,
  placeholder,
  span = 1,
  suffix,
  error,
  type = "text",
}: {
  label: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  span?: 1 | 2 | 3;
  suffix?: string;
  error?: string;
  type?: string;
}) {
  const props = onChange
    ? { value: value ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value) }
    : { defaultValue };
  return (
    <div className={span === 3 ? "sm:col-span-2 lg:col-span-3" : span === 2 ? "sm:col-span-2" : ""}>
      <Label required={required}>{label}</Label>
      {suffix ? (
        <div className="relative">
          <input
            type={type}
            className={`${inputCls} pr-9 ${error ? "border-danger" : ""}`}
            disabled={disabled}
            placeholder={placeholder}
            {...props}
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[12px] text-muted-2">
            {suffix}
          </span>
        </div>
      ) : (
        <input
          type={type}
          className={`${inputCls} ${error ? "border-danger" : ""}`}
          disabled={disabled}
          placeholder={placeholder}
          {...props}
        />
      )}
      {error && <p className="mt-1 text-[11.5px] font-medium text-danger">{error}</p>}
    </div>
  );
}

export function TextAreaField({
  label,
  required,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <textarea
        rows={rows}
        className={inputCls}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}

export function DateField({
  label,
  required,
  value,
  defaultValue,
  onChange,
  min,
  disabled,
  error,
}: {
  label: string;
  required?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  min?: string;
  disabled?: boolean;
  error?: string;
}) {
  const props = onChange
    ? { value: value ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value) }
    : { defaultValue };
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input
        type="date"
        className={`${inputCls} ${error ? "border-danger" : ""}`}
        min={min}
        disabled={disabled}
        {...props}
      />
      {error && <p className="mt-1 text-[11.5px] font-medium text-danger">{error}</p>}
    </div>
  );
}

export function SelectField({
  label,
  required,
  disabled,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Choose One",
}: {
  label: string;
  required?: boolean;
  disabled?: boolean;
  options: string[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}) {
  const props = onChange
    ? { value: value ?? "", onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value) }
    : { defaultValue: defaultValue ?? "" };
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="relative">
        <select className={`${inputCls} appearance-none pr-9`} disabled={disabled} {...props}>
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-2">
          <ChevronDownIcon />
        </span>
      </div>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M9 6l6 6-6 6" transform="rotate(90 12 12)" />
    </svg>
  );
}

export function CheckField({
  label,
  defaultChecked,
  checked,
  onChange,
}: {
  label: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const props = onChange
    ? { checked: checked ?? false, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked) }
    : { defaultChecked };
  return (
    <div className="flex items-center gap-2 pt-6">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-border text-accent accent-accent"
        id={label}
        {...props}
      />
      <label htmlFor={label} className="text-[12.5px] font-medium text-ink">
        {label}
      </label>
    </div>
  );
}

export function RadioField({
  label,
  required,
  options,
  value,
  defaultValue,
  onChange,
}: {
  label: string;
  required?: boolean;
  options: string[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  const name = label.replace(/\s+/g, "-");
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="flex h-[42px] items-center gap-5">
        {options.map((o) => (
          <label key={o} className="flex items-center gap-1.5 text-[13.5px] text-ink">
            <input
              type="radio"
              name={name}
              checked={value !== undefined ? o === value : undefined}
              defaultChecked={value === undefined ? o === defaultValue : undefined}
              onChange={() => onChange?.(o)}
              className="h-4 w-4 accent-accent"
            />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

export function MultiCheckList({
  label,
  required,
  options,
}: {
  label: string;
  required?: boolean;
  options: string[];
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="max-h-[168px] w-full overflow-y-auto rounded-[9px] border-[1.5px] border-border bg-white p-2.5">
        {options.map((o) => (
          <label
            key={o}
            className="flex items-center gap-2 rounded-md px-1.5 py-1 text-[13px] text-ink hover:bg-canvas"
          >
            <input type="checkbox" className="h-3.5 w-3.5 accent-accent" />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-[8px] bg-primary-tint px-3.5 py-2 text-[12.5px] font-semibold text-primary">
      {children}
    </div>
  );
}

export function Toast({ message }: { message: string | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-[10px] bg-ink px-[22px] py-[13px] text-[13.5px] font-medium text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-all duration-300 ${
        message ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"
      }`}
    >
      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-accent" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

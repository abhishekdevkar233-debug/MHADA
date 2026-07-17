type IconProps = {
  name: string;
  className?: string;
};

/**
 * Minimal stroke icon set used across the payroll shell.
 * All icons share a 24x24 viewBox and inherit color via currentColor.
 */
const PATHS: Record<string, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  employee: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </>
  ),
  "leave-balance": (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9h17M8 3v4M16 3v4M9 14.5l2 2 3.5-4" />
    </>
  ),
  "leave-assign": (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9h17M8 3v4M16 3v4M12 12v5M9.5 14.5h5" />
    </>
  ),
  "special-deduction": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8 12h8" />
    </>
  ),
  attendance: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M8 12l3 3 5-6" />
    </>
  ),
  "pay-change": (
    <>
      <path d="M4 8h13l-3-3M20 16H7l3 3" />
    </>
  ),
  allowance: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  deduction: (
    <>
      <path d="M5 12h14" />
    </>
  ),
  "income-tax": (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 8c2.5 0 3.5 3 0 3h6M9 11h3.5c2.5 0 2.5 4-1 4M9 15h5" />
    </>
  ),
  "da-arrears": (
    <>
      <path d="M4 17l5-5 3 3 7-8M15 7h5v5" />
    </>
  ),
  "seventh-pay": (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="M8.5 13.5L7 21l5-2.5L17 21l-1.5-7.5M10 9h4M12 7v4" />
    </>
  ),
  "bill-create": (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4M9 12h6M9 16h4" />
    </>
  ),
  "bill-process": (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </>
  ),
  "bill-report": (
    <>
      <path d="M4 20h16" />
      <rect x="6" y="11" width="3" height="6" rx="0.5" />
      <rect x="11" y="7" width="3" height="10" rx="0.5" />
      <rect x="16" y="13" width="3" height="4" rx="0.5" />
    </>
  ),
  "salary-slip": (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 2.5h6v3H9zM9 11h6M9 15h4" />
    </>
  ),
  "deduction-report": (
    <>
      <path d="M12 3a9 9 0 109 9h-9z" />
      <path d="M12 3v9h9" />
    </>
  ),
  retirement: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="M8.5 13.5L7 21l5-2.5L17 21l-1.5-7.5" />
    </>
  ),
  transfer: (
    <>
      <path d="M4 8h13l-3-3M20 16H7l3 3" />
    </>
  ),
  "user-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.5 18.5a6 6 0 0111 0" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-2.9 1.2v.1a2 2 0 11-4 0v-.1a1.7 1.7 0 00-2.9-1.2l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00-1.2-2.9H2a2 2 0 110-4h.1a1.7 1.7 0 001.2-2.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3h.1a1.7 1.7 0 001-1.6V2a2 2 0 114 0v.1a1.7 1.7 0 001 1.6h.1a1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9v.1a1.7 1.7 0 001.6 1H22a2 2 0 110 4h-.1a1.7 1.7 0 00-1.6 1z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 8h10M18 8h2M4 16h2M10 16h10" />
      <circle cx="16" cy="8" r="2" />
      <circle cx="8" cy="16" r="2" />
    </>
  ),
  printer: (
    <>
      <path d="M6 9V3h12v6M6 18H4v-6a2 2 0 012-2h12a2 2 0 012 2v6h-2" />
      <rect x="7" y="15" width="10" height="6" rx="1" />
    </>
  ),
  money: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9v6M18 9v6" />
    </>
  ),
  logout: (
    <>
      <path d="M15 4h3a1 1 0 011 1v14a1 1 0 01-1 1h-3M10 12h9M16 8l3 4-3 4" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12M18 6L6 18" />
    </>
  ),
  chevron: (
    <>
      <path d="M9 6l6 6-6 6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0112 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5M9.5 19a2.5 2.5 0 005 0" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 013.9-2c1.3.9 1 2.5-.4 3.4-.7.5-1 .9-1 1.6" />
      <path d="M12 16.5h.01" />
    </>
  ),
  pencil: (
    <>
      <path d="M14.5 4.5l5 5L8 21H3v-5z" />
      <path d="M12.5 6.5l5 5" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  "chevron-double-left": (
    <>
      <path d="M18 6l-6 6 6 6M11 6l-6 6 6 6" />
    </>
  ),
  filter: (
    <>
      <path d="M4 5h16M7 12h10M10.5 19h3" />
    </>
  ),
  "x-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
    </>
  ),
};

export default function Icon({ name, className }: IconProps) {
  const content = PATHS[name] ?? PATHS.dashboard;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {content}
    </svg>
  );
}

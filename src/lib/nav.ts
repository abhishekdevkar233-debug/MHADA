export type NavLeaf = {
  key: string;
  label: string;
  dv: string;
  href: string;
  /** Screen isn't built yet — hidden from the sidebar/dashboard UI, but the route stays intact. */
  hidden?: boolean;
};

export type NavMenu = {
  key: string;
  label: string;
  dv: string;
  icon: string;
  children: NavLeaf[];
  /** Temporarily hidden from the sidebar/dashboard UI, but routes and data stay intact. */
  hidden?: boolean;
};

/**
 * The 8 top-level menus of the MHADA Payroll Management system, matching the
 * legacy application's menu bar exactly, as provided by the client.
 * English labels are the authoritative "Recommended English" translations
 * given alongside the Marathi originals. UI renders English only for now —
 * the `dv` (Devanagari) values are kept for a future bilingual toggle.
 *
 * Reports (Ink-Jet) and Reports (Dot-Matrix) mirror the same report set
 * (same reports, two print drivers) — Dot-Matrix wasn't itemized separately
 * by the client, so it's mirrored 1:1 from Ink-Jet with a `dm-` key prefix.
 */
export const NAV: NavMenu[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    dv: "डॅशबोर्ड",
    icon: "dashboard",
    children: [],
  },
  {
    // No screens in this menu are built yet — hidden from the UI, routes/data stay intact.
    hidden: true,
    key: "user",
    label: "User",
    dv: "युजर",
    icon: "user-circle",
    children: [
      { key: "payroll-processing", label: "Payroll Processing", dv: "पगार काढावयाची", href: "/payroll-processing" },
    ],
  },
  {
    key: "setup",
    label: "Setup",
    dv: "सेटअप",
    icon: "settings",
    children: [
      { key: "salary-info", label: "Employee Salary Information", dv: "कर्मचारी वेतनासंबंधी माहिती", href: "/salary-info", hidden: true },
      { key: "work-details", label: "Work & Service Information", dv: "कामकाज विषयक माहिती भरणे", href: "/work-details", hidden: true },
      { key: "leave-setup", label: "Employee Leave Information", dv: "कर्मचारी रजा माहिती", href: "/leave-setup" },
      { key: "employee-records", label: "Employee Information Correction", dv: "कर्मचारी माहिती दुरुस्ती", href: "/employee-records" },
      { key: "seventh-pay-master", label: "7th Pay Basic Master", dv: "7th Pay Basic Master", href: "/seventh-pay-master", hidden: true },
    ],
  },
  {
    key: "admin-setup",
    label: "Administration Setup",
    dv: "प्रशासन सेटअप",
    icon: "shield",
    children: [
      { key: "retirement", label: "Employee Retirement Information", dv: "कर्मचारी सेवानिवृत्ती माहिती", href: "/retirement" },
      { key: "employee-promotion", label: "Employee Promotion Information", dv: "कर्मचारी बढतीची माहिती", href: "/employee-promotion" },
      { key: "district-adjustment", label: "Employee District Adjustment", dv: "कर्मचारी जिल्हा समायोजित करणे", href: "/district-adjustment", hidden: true },
    ],
  },
  {
    key: "operations",
    label: "Operations",
    dv: "संचालन",
    icon: "sliders",
    children: [
      { key: "seventh-pay-diff", label: "Employee 7th Pay Difference", dv: "कर्मचारी सातवा वेतन फरक", href: "/seventh-pay-diff", hidden: true },
      { key: "retired-seventh-pay-arrear", label: "Retired 7th Pay Arrear Calculation", dv: "Retired 7th Pay Arrear Calculation", href: "/retired-seventh-pay-arrear" },
      { key: "recovery-management", label: "Recovery Management", dv: "वसूली", href: "/recovery-management", hidden: true },
      { key: "lic-management", label: "LIC Management", dv: "एल आय सी", href: "/lic-management", hidden: true },
      { key: "employee-leave", label: "Employee Leave Management", dv: "कर्मचारी रजा", href: "/employee-leave" },
      { key: "special-deduction", label: "Special Deduction", dv: "विशेष वजाती", href: "/special-deduction" },
      { key: "bank-society-recovery", label: "Bank & Cooperative Society Recovery", dv: "बँक/सहकारी पतसंस्था वसूली", href: "/bank-society-recovery", hidden: true },
      { key: "attendance", label: "Employee Attendance", dv: "कर्मचारी हजेरी", href: "/attendance" },
      { key: "pay-change", label: "Salary Component Changes", dv: "पगारपत्र परिवर्तन", href: "/pay-change", hidden: true },
      { key: "one-time-deduction", label: "One-Time Deduction", dv: "एक वेळ वजाती", href: "/one-time-deduction", hidden: true },
      { key: "salary-increment", label: "Employee Salary Increment", dv: "कर्मचारी विविध वेतनवाढ", href: "/salary-increment", hidden: true },
      { key: "leave-balance", label: "Leave Balance Correction", dv: "शिल्लक रजा दुरुस्ती", href: "/leave-balance" },
      { key: "allowance", label: "Assign Allowances", dv: "भत्ते लागू करणे", href: "/allowance" },
      { key: "deduction", label: "Assign Deductions", dv: "कपात लागू करणे", href: "/deduction" },
      { key: "upload-allowances-deductions", label: "Upload Allowances & Deductions", dv: "Upload Allowances and Deductions", href: "/upload-allowances-deductions", hidden: true },
      { key: "da-arrears", label: "Dearness Allowance (DA) Arrear", dv: "महागाई भत्ता फरक", href: "/da-arrears" },
      { key: "retired-da-arrear", label: "Retired Employee DA Arrear", dv: "सेवानिवृत्तांना महागाई भत्ता फरक", href: "/retired-da-arrear", hidden: true },
      { key: "hra", label: "House Rent Allowance (HRA)", dv: "घरभाडे", href: "/hra", hidden: true },
      { key: "gis-correction", label: "GIS Number Correction", dv: "जी.आय.एस. क्रमांक दुरुस्त करणे", href: "/gis-correction", hidden: true },
      { key: "board-id-arrears", label: "Board ID Card Previous Arrears", dv: "मंडळ ओळखपत्र मागील थकबाकी", href: "/board-id-arrears", hidden: true },
      { key: "loan-installment", label: "Loan Installment Modification", dv: "कर्ज हप्ते बदल", href: "/loan-installment", hidden: true },
      { key: "income-tax", label: "Income Tax Forecast", dv: "आयकर पूर्वानुमान", href: "/income-tax" },
      { key: "lpc", label: "Last Pay Certificate (LPC)", dv: "LPC", href: "/lpc", hidden: true },
      { key: "auto-increment-installment", label: "Automatic Increment Installment", dv: "Increase Installment Auto", href: "/auto-increment-installment", hidden: true },
      { key: "retired-deputation", label: "Retired / Deputation", dv: "Retired / Deputation", href: "/retired-deputation", hidden: true },
      { key: "grade-pay-arrear", label: "Grade Pay Arrear", dv: "Grade Pay Arrear", href: "/grade-pay-arrear", hidden: true },
    ],
  },
  {
    key: "salary-process",
    label: "Salary Process",
    dv: "पगार प्रक्रिया",
    icon: "bill-create",
    children: [
      { key: "bill-create", label: "Salary Bill", dv: "बिल", href: "/bill-create" },
      { key: "bill-process", label: "Bill Processing", dv: "बिल प्रक्रिया", href: "/bill-process" },
    ],
  },
  {
    key: "report-inkjet",
    label: "Reports — Ink-Jet",
    dv: "अहवाल (इंक-जेट प्रिंट)",
    icon: "printer",
    children: [
      { key: "ij-salary-bill", label: "Salary Bill", dv: "बिल", href: "/ij-salary-bill", hidden: true },
      { key: "ij-pay-slip", label: "Pay Slip", dv: "पगार पत्र", href: "/ij-pay-slip" },
      { key: "ij-survey-allowance", label: "Survey Allowance Report", dv: "सर्वे भत्ता अहवाल", href: "/ij-survey-allowance", hidden: true },
      { key: "ij-bank-account-details", label: "Bank Account Details", dv: "बँक खाते विवरण", href: "/ij-bank-account-details", hidden: true },
      { key: "ij-employee-leave-info", label: "Employee Leave Information", dv: "कर्मचारी सुट्टी माहिती", href: "/ij-employee-leave-info", hidden: true },
      { key: "ij-annual-increment-report", label: "Annual Salary Increment Report", dv: "वार्षिक वेतनवाढ अहवाल", href: "/ij-annual-increment-report", hidden: true },
      { key: "ij-bank-society-deduction-report", label: "Bank & Cooperative Society Deduction Report", dv: "बँक व सभागृह अनुदान", href: "/ij-bank-society-deduction-report", hidden: true },
      { key: "ij-income-tax-statement", label: "Income Tax Statement", dv: "Income Tax Statement", href: "/ij-income-tax-statement", hidden: true },
      { key: "ij-payroll-register", label: "Payroll Register Report", dv: "प्रचलन पत्रक अहवाल", href: "/ij-payroll-register", hidden: true },
      { key: "ij-attendance-report", label: "Attendance Report", dv: "उपस्थिती अहवाल", href: "/ij-attendance-report", hidden: true },
      { key: "ij-pension-verification", label: "Pension Verification Report", dv: "पेन्शन तपासणी यादी", href: "/ij-pension-verification", hidden: true },
      { key: "ij-dept-salary-verification", label: "Department-wise Salary Verification", dv: "विभागानुसार वेतन तपासणी", href: "/ij-dept-salary-verification", hidden: true },
      { key: "ij-dept-arrear-verification", label: "Department-wise Arrear Verification", dv: "विभागानुसार बकाया तपासणी", href: "/ij-dept-arrear-verification", hidden: true },
      { key: "ij-recovery-list", label: "Recovery List", dv: "बजावी वसूली यादी", href: "/ij-recovery-list", hidden: true },
      { key: "ij-salary-slip-report", label: "Salary Slip Report", dv: "पगार स्लीप अहवाल", href: "/ij-salary-slip-report", hidden: true },
      { key: "ij-all-deductions-report", label: "All Deductions Report", dv: "सर्व वजाती अहवाल", href: "/ij-all-deductions-report" },
      { key: "ij-bank-bill-details", label: "Bank Bill Details", dv: "बँक बिल विवरण", href: "/ij-bank-bill-details", hidden: true },
      { key: "ij-gis-deduction-report", label: "GIS Deduction Report", dv: "GIS वजाती अहवाल", href: "/ij-gis-deduction-report", hidden: true },
      { key: "ij-maintenance-allowance-deduction-report", label: "Maintenance Allowance Deduction Report", dv: "देखभाल भत्ता वजाती अहवाल", href: "/ij-maintenance-allowance-deduction-report", hidden: true },
      { key: "ij-income-tax-forecast", label: "Income Tax Forecast", dv: "आयकर पूर्वानुमान", href: "/ij-income-tax-forecast", hidden: true },
      { key: "ij-form16-report", label: "Form 16 Report", dv: "Form 16 Report", href: "/ij-form16-report", hidden: true },
      { key: "ij-biometric-dashboard", label: "Biometric Dashboard", dv: "Biometric Dashboard", href: "/ij-biometric-dashboard", hidden: true },
    ],
  },
  {
    // Mirrors Reports — Ink-Jet 1:1 (same reports, Dot-Matrix print driver).
    // Temporarily hidden from the UI per client request — code/routes stay intact.
    hidden: true,
    key: "report-dotmatrix",
    label: "Reports — Dot-Matrix",
    dv: "अहवाल (डॉट-मॅट्रिक्स प्रिंट)",
    icon: "printer",
    children: [
      { key: "dm-salary-bill", label: "Salary Bill", dv: "बिल", href: "/dm-salary-bill" },
      { key: "dm-pay-slip", label: "Pay Slip", dv: "पगार पत्र", href: "/dm-pay-slip" },
      { key: "dm-survey-allowance", label: "Survey Allowance Report", dv: "सर्वे भत्ता अहवाल", href: "/dm-survey-allowance" },
      { key: "dm-bank-account-details", label: "Bank Account Details", dv: "बँक खाते विवरण", href: "/dm-bank-account-details" },
      { key: "dm-employee-leave-info", label: "Employee Leave Information", dv: "कर्मचारी सुट्टी माहिती", href: "/dm-employee-leave-info" },
      { key: "dm-annual-increment-report", label: "Annual Salary Increment Report", dv: "वार्षिक वेतनवाढ अहवाल", href: "/dm-annual-increment-report" },
      { key: "dm-bank-society-deduction-report", label: "Bank & Cooperative Society Deduction Report", dv: "बँक व सभागृह अनुदान", href: "/dm-bank-society-deduction-report" },
      { key: "dm-income-tax-statement", label: "Income Tax Statement", dv: "Income Tax Statement", href: "/dm-income-tax-statement" },
      { key: "dm-payroll-register", label: "Payroll Register Report", dv: "प्रचलन पत्रक अहवाल", href: "/dm-payroll-register" },
      { key: "dm-attendance-report", label: "Attendance Report", dv: "उपस्थिती अहवाल", href: "/dm-attendance-report" },
      { key: "dm-pension-verification", label: "Pension Verification Report", dv: "पेन्शन तपासणी यादी", href: "/dm-pension-verification" },
      { key: "dm-dept-salary-verification", label: "Department-wise Salary Verification", dv: "विभागानुसार वेतन तपासणी", href: "/dm-dept-salary-verification" },
      { key: "dm-dept-arrear-verification", label: "Department-wise Arrear Verification", dv: "विभागानुसार बकाया तपासणी", href: "/dm-dept-arrear-verification" },
      { key: "dm-recovery-list", label: "Recovery List", dv: "बजावी वसूली यादी", href: "/dm-recovery-list" },
      { key: "dm-salary-slip-report", label: "Salary Slip Report", dv: "पगार स्लीप अहवाल", href: "/dm-salary-slip-report" },
      { key: "dm-all-deductions-report", label: "All Deductions Report", dv: "सर्व वजाती अहवाल", href: "/dm-all-deductions-report" },
      { key: "dm-bank-bill-details", label: "Bank Bill Details", dv: "बँक बिल विवरण", href: "/dm-bank-bill-details" },
      { key: "dm-gis-deduction-report", label: "GIS Deduction Report", dv: "GIS वजाती अहवाल", href: "/dm-gis-deduction-report" },
      { key: "dm-maintenance-allowance-deduction-report", label: "Maintenance Allowance Deduction Report", dv: "देखभाल भत्ता वजाती अहवाल", href: "/dm-maintenance-allowance-deduction-report" },
      { key: "dm-income-tax-forecast", label: "Income Tax Forecast", dv: "आयकर पूर्वानुमान", href: "/dm-income-tax-forecast" },
      { key: "dm-form16-report", label: "Form 16 Report", dv: "Form 16 Report", href: "/dm-form16-report" },
      { key: "dm-biometric-dashboard", label: "Biometric Dashboard", dv: "Biometric Dashboard", href: "/dm-biometric-dashboard" },
    ],
  },
  {
    // No screens in this menu are built yet — hidden from the UI, routes/data stay intact.
    hidden: true,
    key: "remuneration",
    label: "Remuneration",
    dv: "मानधन",
    icon: "money",
    children: [
      { key: "honorarium-employee-info", label: "Honorarium Employee Information", dv: "मानधन कर्मचारी माहिती", href: "/honorarium-employee-info" },
      { key: "honorarium-employee-leave", label: "Honorarium Employee Leave", dv: "मानधन कर्मचारी रजा", href: "/honorarium-employee-leave" },
      { key: "honorarium-attendance", label: "Honorarium Employee Attendance", dv: "मानधन कर्मचारी हजेरी", href: "/honorarium-attendance" },
      { key: "honorarium-bill", label: "Honorarium Bill", dv: "मानधन बिल", href: "/honorarium-bill" },
      { key: "honorarium-bill-processing", label: "Honorarium Bill Processing", dv: "मानधन बिल प्रक्रिया", href: "/honorarium-bill-processing" },
      { key: "honorarium-bill-report", label: "Honorarium Bill Report", dv: "मानधन बिल अहवाल", href: "/honorarium-bill-report" },
      { key: "honorarium-maintenance-deduction-report", label: "Honorarium Maintenance Deduction Report", dv: "मानधन देखभाल वजाती अहवाल", href: "/honorarium-maintenance-deduction-report" },
      { key: "honorarium-misc-deduction-report", label: "Honorarium Miscellaneous Deduction Report", dv: "मानधन विविध वजाती अहवाल", href: "/honorarium-misc-deduction-report" },
      { key: "honorarium-bank-account-details", label: "Honorarium Bank Account Details", dv: "मानधन बँक खाते विवरण", href: "/honorarium-bank-account-details" },
    ],
  },
];

const LEAF_BY_KEY: Record<string, { item: NavLeaf; menu: NavMenu }> = {};
const MENU_BY_KEY: Record<string, NavMenu> = {};
for (const menu of NAV) {
  MENU_BY_KEY[menu.key] = menu;
  for (const item of menu.children) {
    LEAF_BY_KEY[item.key] = { item, menu };
  }
}

export function findByKey(key: string) {
  return LEAF_BY_KEY[key];
}

export type ResolvedRoute = {
  title: string;
  titleDv: string;
  group: string;
  groupDv: string;
  icon: string;
};

/** Resolve a URL key to a leaf screen, or a childless top menu. */
export function findRoute(key: string): ResolvedRoute | undefined {
  const leaf = LEAF_BY_KEY[key];
  if (leaf) {
    return {
      title: leaf.item.label,
      titleDv: leaf.item.dv,
      group: leaf.menu.label,
      groupDv: leaf.menu.dv,
      icon: leaf.menu.icon,
    };
  }
  const menu = MENU_BY_KEY[key];
  if (menu && menu.children.length === 0) {
    return { title: menu.label, titleDv: menu.dv, group: menu.label, groupDv: menu.dv, icon: menu.icon };
  }
  return undefined;
}

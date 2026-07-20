import AllowanceDeductionForm from "@/components/AllowanceDeductionForm";

const DEDUCTION_TYPES = [
  "Society Loan",
  "Advance Recovery",
  "Professional Tax",
  "GIS",
  "CPF Recovery",
  "Court Order Recovery",
  "Bank Loan Recovery",
  "Festival Advance",
];

export default function DeductionPage() {
  return <AllowanceDeductionForm mode="Deduction" typeOptions={DEDUCTION_TYPES} navGroup="Operations" />;
}

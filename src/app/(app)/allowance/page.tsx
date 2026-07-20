import AllowanceDeductionForm from "@/components/AllowanceDeductionForm";

const ALLOWANCE_TYPES = [
  "Travel Allowance",
  "House Rent Allowance",
  "Medical Allowance",
  "Conveyance Allowance",
  "Special Allowance",
  "Uniform Allowance",
  "Washing Allowance",
  "City Compensatory Allowance",
];

export default function AllowancePage() {
  return <AllowanceDeductionForm mode="Allowance" typeOptions={ALLOWANCE_TYPES} navGroup="Operations" />;
}

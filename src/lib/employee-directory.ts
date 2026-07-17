export type DirectoryEmployee = {
  id: string;
  name: string;
  department: string;
  designation: string;
};

/**
 * Shared employee directory for search-driven screens (Leave Balance
 * Correction, Employee Leave Management, …). Independent of the Employee
 * Records module's own dataset, which tracks record-completion status
 * rather than department/designation.
 */
export const EMPLOYEE_DIRECTORY: DirectoryEmployee[] = [
  { id: "71011", name: "Bhagwan Maruti Sawant", department: "Mumbai Board", designation: "Junior Engineer" },
  { id: "69459", name: "Kalpana Nandan Pawar", department: "Konkan Board", designation: "Accountant" },
  { id: "69809", name: "Shri Yashwant Ganpat Gosavi", department: "Pune Board", designation: "Section Officer" },
  { id: "69540", name: "Akalpita Mohan Lad", department: "Mumbai Board", designation: "Clerk" },
  { id: "69789", name: "Shubhada Madhukar Todankar", department: "Nagpur Board", designation: "Assistant Engineer" },
  { id: "36539", name: "Ramakant Bhalchandra Meher", department: "Nashik Board", designation: "Superintendent" },
  { id: "69330", name: "Madhuri Sachin Zele", department: "Mumbai Board", designation: "Stenographer" },
  { id: "69923", name: "Ganesh Narayan Khairnar", department: "Pune Board", designation: "Junior Engineer" },
  { id: "69539", name: "Prashant Gunderao Brahmawale", department: "Konkan Board", designation: "Accountant" },
  { id: "69752", name: "Abdul Raheman Abdul Razzak", department: "Mumbai Board", designation: "Section Officer" },
  { id: "37071", name: "Sunil Rangrao Patil", department: "Nashik Board", designation: "Clerk" },
  { id: "69166", name: "Suhas Gopinath Patil", department: "Mumbai Board", designation: "Assistant Engineer" },
];

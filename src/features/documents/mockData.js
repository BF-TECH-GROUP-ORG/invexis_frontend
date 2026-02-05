

const mockData = [
  // 2024 Data ------------------------------------------------
  {
    id: "1",
    name: "Invoice #001",
    description: "Workshop materials",
    status: "Workshop",
    type: "Invoice",
    date: "2024-05-24", // May 2024
    amount: 5000,
    tags: ["urgent", "paid"],
    assignee: "John Doe",
    version: "v1.2",
    size: "2.4 MB",
    fileUrl: "/documents/invoice-001.pdf",
    uploadedBy: "Admin",
    lastModified: "2024-01-24",
    category: "Finance",
    priority: "high",
    attachments: 2,
    images: [{ label: "Company Logo", url: "https://via.placeholder.com/150x50?text=Acme+Corp" }],
    activity: [{ date: "2024-05-24", action: "Invoice generated", user: "System", isInternal: false }]
  },
  {
    id: "6",
    name: "Contract - Vendor",
    description: "Supply agreement",
    status: "Archived",
    type: "Agreement",
    date: "2024-02-15", // Feb 2024
    amount: 25000,
    tags: ["vendor", "supply"],
    assignee: "Jane Smith",
    version: "v1.0",
    size: "4.3 MB",
    fileUrl: "/documents/contract-vendor.pdf",
    uploadedBy: "Procurement",
    lastModified: "2024-02-15",
    category: "Procurement",
    priority: "low",
    attachments: 2,
    images: [{ label: "Signature", url: "https://via.placeholder.com/150x50?text=Signed" }],
    activity: [{ date: "2024-02-15", action: "Signed", user: "Admin", isInternal: false }]
  },

  // 2023 Data ------------------------------------------------
  {
    id: "2",
    name: "Agreement - ACME",
    description: "Partnership",
    status: "Financial",
    type: "Agreement",
    date: "2023-12-22", // Dec 2023
    amount: 12000,
    tags: ["contract", "partnership"],
    assignee: "Jane Smith",
    version: "v2.0",
    size: "1.8 MB",
    fileUrl: "/documents/agreement-acme.pdf",
    uploadedBy: "Manager",
    lastModified: "2023-12-22",
    category: "Legal",
    priority: "medium",
    attachments: 1
  },
  {
    id: "3",
    name: "Policy - HR",
    description: "Employee terms",
    status: "Financial",
    type: "Policy",
    date: "2023-05-16", // May 2023
    amount: 8000,
    tags: ["important", "hr"],
    assignee: "Mike Johnson",
    version: "v1.0",
    size: "3.2 MB",
    fileUrl: "/documents/policy-hr.pdf",
    uploadedBy: "HR Department",
    lastModified: "2023-11-16",
    category: "Human Resources",
    priority: "high",
    attachments: 3
  },
  {
    id: "4",
    name: "Annual Report 2023",
    description: "Full year results",
    status: "Workshop",
    type: "Report",
    date: "2023-05-10", // May 2023
    amount: 45000,
    tags: ["annual", "report"],
    assignee: "Sarah Wilson",
    version: "v3.1",
    size: "5.6 MB",
    fileUrl: "/documents/annual-report.pdf",
    uploadedBy: "Finance Team",
    lastModified: "2023-09-10",
    category: "Reports",
    priority: "high",
    attachments: 5
  },

  // 2022 Data ------------------------------------------------
  {
    id: "5",
    name: "Budget Q2 2022",
    description: "Financial planning",
    status: "Financial",
    type: "Report",
    date: "2022-07-11", // July 2022
    amount: 12000,
    tags: ["quarterly", "budget"],
    assignee: "John Doe",
    version: "v1.5",
    size: "2.1 MB",
    fileUrl: "/documents/budget-q2.pdf",
    uploadedBy: "Finance",
    lastModified: "2022-07-11",
    category: "Finance",
    priority: "medium",
    attachments: 1
  },
];

export default mockData;
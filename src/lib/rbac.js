// Central RBAC mapping for path prefixes -> allowed roles
// Add or update entries here when new role-based restrictions are required.

export const ROLE_PERMISSIONS = [
  // Company-level / admin features
  { prefix: "/inventory/companies", roles: ["company_admin"], departments: ["management"] },
  { prefix: "/inventory/workers", roles: ["company_admin"], departments: ["management"] },
  { prefix: "/inventory/logs", roles: ["company_admin"], departments: [] },
  { prefix: "/inventory/audit", roles: ["company_admin"], departments: [] },

  // Manager features
  { prefix: "/inventory/products", roles: ["company_admin"], departments: ["management", "sales"] },
  { prefix: "/inventory/categories", roles: ["company_admin"], departments: ["management", "sales"] },
  { prefix: "/inventory/warehouses", roles: ["company_admin"], departments: ["management", "sales"] },
  { prefix: "/inventory/alerts", roles: ["company_admin"], departments: ["management", "sales"] },
  { prefix: "/inventory/reports", roles: ["company_admin"], departments: ["management"] },
  { prefix: "/inventory/report", roles: ["company_admin"], departments: ["management"] },
  { prefix: "/inventory/analytics", roles: ["company_admin"], departments: ["management"] },
  { prefix: "/inventory/overview", roles: ["company_admin"], departments: ["management", "sales"] },
  { prefix: "/inventory/Overview", roles: ["company_admin"], departments: ["management", "sales"] },
  { prefix: "/inventory/stock", roles: ["company_admin"], departments: ["management", "sales"] },

  // Sales and other features
  { prefix: "/inventory/sales", roles: ["company_admin"], departments: ["management", "sales"] },
  { prefix: "/inventory/ecommerce", roles: ["company_admin"], departments: ["management"] },
  { prefix: "/inventory/billing", roles: ["company_admin"], departments: ["management"] },
  { prefix: "/inventory/debts", roles: ["company_admin"], departments: ["management", "sales"] },
  { prefix: "/inventory/documents", roles: ["company_admin"], departments: ["management"] },
  { prefix: "/inventory/announcements", roles: ["company_admin"], departments: ["management", "sales"] },
  { prefix: "/inventory/notifications", roles: ["company_admin"], departments: ["management", "sales"] },
  { prefix: "/inventory/dashboard", roles: ["company_admin"], departments: ["management", "sales"] },
];

export function getAllowedRolesForPath(path) {
  // return null if no restriction applies
  const matches = ROLE_PERMISSIONS.filter((r) => path.startsWith(r.prefix));
  if (!matches || matches.length === 0) return null;

  const roles = new Set();
  const departments = new Set();

  matches.forEach((m) => {
    if (m.roles) m.roles.forEach((r) => roles.add(r));
    if (m.departments) m.departments.forEach((d) => departments.add(d));
  });

  return {
    roles: Array.from(roles),
    departments: Array.from(departments),
  };
}

export const ROLES = ["company_admin", "manager", "sales_manager"];

// CommonJS fallback for lightweight tests / node scripts that use require()
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ROLE_PERMISSIONS, getAllowedRolesForPath, ROLES };
}

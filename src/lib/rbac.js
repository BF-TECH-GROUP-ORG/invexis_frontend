// Central RBAC mapping for path prefixes -> allowed roles
// Add or update entries here when new role-based restrictions are required.

export const ROLE_PERMISSIONS = [
  // Company-level / admin features
  { prefix: "/inventory/companies", roles: ["company_admin"] },
  { prefix: "/inventory/workers", roles: ["company_admin"] },
  { prefix: "/inventory/logs", roles: ["company_admin"] },
  { prefix: "/inventory/audit", roles: ["company_admin"] },

  // Manager features
  { prefix: "/inventory/products", roles: ["manager", "company_admin"] },
  { prefix: "/inventory/categories", roles: ["manager", "company_admin"] },
  { prefix: "/inventory/warehouses", roles: ["manager", "company_admin"] },
  { prefix: "/inventory/alerts", roles: ["manager", "company_admin"] },
  { prefix: "/inventory/reports", roles: ["manager", "company_admin"] },
  { prefix: "/inventory/analytics", roles: ["manager", "company_admin"] },
  { prefix: "/inventory/overview", roles: ["manager", "company_admin"] },
  { prefix: "/inventory/Overview", roles: ["manager", "company_admin"] },

  // Sales manager features
  { prefix: "/inventory/sales", roles: ["sales_manager", "company_admin"] },
  { prefix: "/inventory/ecommerce", roles: ["sales_manager", "company_admin"] },
  { prefix: "/inventory/billing", roles: ["sales_manager", "company_admin"] },
  { prefix: "/inventory/debts", roles: ["sales_manager", "company_admin"] },
];

export function getAllowedRolesForPath(path) {
  // return null if no restriction applies
  const matches = ROLE_PERMISSIONS.filter((r) => path.startsWith(r.prefix));
  if (!matches || matches.length === 0) return null;
  // merge roles
  const roles = new Set();
  matches.forEach((m) => m.roles.forEach((r) => roles.add(r)));
  return Array.from(roles);
}

export const ROLES = ["company_admin", "manager", "sales_manager"];

// CommonJS fallback for lightweight tests / node scripts that use require()
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ROLE_PERMISSIONS, getAllowedRolesForPath, ROLES };
}

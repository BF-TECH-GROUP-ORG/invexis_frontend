// User roles hierarchy
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',      // InvexIs administrators
  ADMIN: 'admin',                   // Company/Shop owner
  MANAGER: 'manager',               // Shop manager
  SELLER: 'seller',                 // Regular shop employee
  VIEWER: 'viewer',                 // Read-only access
};

// Permissions for each module
export const PERMISSIONS = {
  categories: {
    view: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.SELLER, USER_ROLES.VIEWER],
    create: [USER_ROLES.SUPER_ADMIN],  // ONLY SUPER ADMIN
    update: [USER_ROLES.SUPER_ADMIN],  // ONLY SUPER ADMIN
    delete: [USER_ROLES.SUPER_ADMIN],  // ONLY SUPER ADMIN
    assign: [USER_ROLES.SUPER_ADMIN],  // Assign to companies
  },
  products: {
    view: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.SELLER],
    create: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    update: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    delete: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
  },
  warehouses: {
    view: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    create: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
    update: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
    delete: [USER_ROLES.SUPER_ADMIN],
  },
  reports: {
    view: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    export: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
  },
  alerts: {
    view: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.SELLER],
    resolve: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    delete: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
  },
};

// Check if user has permission
export const hasPermission = (userRole, module, action) => {
  if (!PERMISSIONS[module] || !PERMISSIONS[module][action]) {
    return false;
  }
  return PERMISSIONS[module][action].includes(userRole);
};

// Check if user is super admin
export const isSuperAdmin = (userRole) => {
  return userRole === USER_ROLES.SUPER_ADMIN;
};

// Check if user can manage categories
export const canManageCategories = (userRole) => {
  return userRole === USER_ROLES.SUPER_ADMIN;
};
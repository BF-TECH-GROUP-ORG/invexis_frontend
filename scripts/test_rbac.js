// Quick script to validate RBAC mapping helpers
const { getAllowedRolesForPath } = require("../src/lib/rbac");

const tests = [
  { path: "/inventory/companies", expect: ["company_admin"] },
  { path: "/inventory/logs", expect: ["company_admin"] },
  { path: "/inventory/products", expectContains: "manager" },
  { path: "/inventory/analytics", expectContains: "manager" },
];

let ok = true;
for (const t of tests) {
  const roles = getAllowedRolesForPath(t.path);
  if (t.expect) {
    const exp = JSON.stringify(t.expect.sort());
    const got = JSON.stringify((roles || []).sort());
    if (exp !== got) {
      console.error(`FAIL ${t.path}: expected ${exp}, got ${got}`);
      ok = false;
    } else {
      console.log(`OK   ${t.path} => ${got}`);
    }
  } else if (t.expectContains) {
    if (!roles || !roles.includes(t.expectContains)) {
      console.error(
        `FAIL ${t.path}: expected roles to include ${t.expectContains}, got ${roles}`
      );
      ok = false;
    } else {
      console.log(`OK   ${t.path} includes ${t.expectContains}`);
    }
  }
}

if (!ok) process.exit(2);
console.log("RBAC quick checks passed.");

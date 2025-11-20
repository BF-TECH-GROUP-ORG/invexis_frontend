"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import {
  LayoutDashboard,
  BarChart3,
  FileSpreadsheet,
  Users,
  Package,
  ShoppingBag,
  Wallet,
  ShoppingCart,
  Receipt,
  UserCheck,
  FileText,
  AlertCircle,
  Menu,
  ChevronDown,
} from "lucide-react";

/* STATIC NAV ITEMS */
const navItems = [
  // OVERVIEW
  { title: "Dashboard", icon: <LayoutDashboard size={22} />, path: "/inventory/dashboard" },
  { title: "Analytics", icon: <BarChart3 size={22} />, path: "/inventory/analytics" },
  { title: "Reports", icon: <FileSpreadsheet size={22} />, path: "/inventory/reports" },

  // MANAGEMENT
  {
    title: "Staff & Branches",
    icon: <Users size={22} />,
    children: [
      { title: "Staff List", path: "/inventory/workers/list" },
      { title: "Branches", path: "/inventory/companies" },
      { title: "Worker Profile", path: "/inventory/users/profile" },
    ],
  },
  {
    title: "Inventory",
    icon: <Package size={22} />,
    children: [
      { title: "Product List", path: "/inventory/products/list" },
      { title: "Product Details", path: "/inventory/products/details" },
    ],
  },

  // SALES → NO CHILDREN
  {
    title: "Sales",
    icon: <ShoppingBag size={22} />,
    path: "/inventory/sales",
  },

  {
    title: "Debts",
    icon: <Wallet size={22} />,
    children: [
      { title: "Debts List", path: "/inventory/Debts/list" },
      { title: "Debts Details", path: "/inventory/Debts/details" },
    ],
  },
  {
    title: "E-commerce",
    icon: <ShoppingCart size={22} />,
    children: [
      { title: "Orders", path: "/inventory/orders/list" },
      { title: "Products", path: "/inventory/products/ecommerce" },
    ],
  },
  {
    title: "Billing & Payments",
    icon: <Receipt size={22} />,
    children: [
      { title: "Invoices", path: "/inventory/billing/invoices" },
      { title: "Payments", path: "/inventory/billing/payments" },
    ],
  },
  {
    title: "Debt Manager",
    icon: <UserCheck size={22} />,
    children: [
      { title: "Customer Debts", path: "/inventory/debts/customers" },
      { title: "Supplier Debts", path: "/inventory/debts/suppliers" },
    ],
  },
  {
    title: "Documents",
    icon: <FileText size={22} />,
    children: [
      { title: "Invoices", path: "/inventory/invoices/list" },
      { title: "Payment History", path: "/inventory/invoices/details" },
    ],
  },
  {
    title: "Announcements",
    icon: <AlertCircle size={22} />,
    children: [
      { title: "List", path: "/inventory/announcements/list" },
      { title: "Create / Details", path: "/inventory/announcements/details" },
    ],
  },
];

export default function SideBar({ expanded: controlledExpanded, setExpanded: setControlledExpanded }) {
  const pathname = usePathname();
  const locale = useLocale();

  const [expandedInternal, setExpandedInternal] = useState(true);
  const [openMenus, setOpenMenus] = useState([]);
  const [hoverMenu, setHoverMenu] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0 });

  const expanded = typeof controlledExpanded === "boolean" ? controlledExpanded : expandedInternal;

  const setExpanded = useCallback(
    (v) => {
      if (typeof controlledExpanded === "boolean") setControlledExpanded(v);
      else {
        setExpandedInternal(v);
        localStorage.setItem("sidebar-expanded", String(v));
      }
    },
    [controlledExpanded, setControlledExpanded]
  );

  const isActive = useCallback(
    (path) =>
      pathname === `/${locale}${path}` ||
      pathname.startsWith(`/${locale}${path}/`),
    [pathname, locale]
  );

  /* hover prefetch */
  const handleHoverEnter = useCallback(
    (e, item) => {
      if (!expanded && item.children) {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoverMenu(item.title);
        setHoverPosition({ top: rect.top + window.scrollY });
      }
    },
    [expanded]
  );

  const handleHoverLeave = () => !expanded && setHoverMenu(null);

  /* Auto-open active parent */
  useEffect(() => {
    const activeParents = navItems
      .filter((item) => item.children?.some((child) => isActive(child.path)))
      .map((item) => item.title);
    setOpenMenus(activeParents);
  }, [pathname, isActive]);

  return (
    <>
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-30 bg-white border-r transition-all duration-300 ${expanded ? "w-64" : "w-16"}`}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-5 border-b">
          <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu size={22} />
          </button>

          <div className={`overflow-hidden transition-all ${expanded ? "w-40" : "w-0"}`}>
            <span className="text-xl font-bold text-gray-900">
              INVEX<span className="text-orange-500 font-extrabold">iS</span>
            </span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-8">
          
          {/* OVERVIEW */}
          <section>
            <h3 className={`text-xs font-semibold text-gray-500 uppercase mb-2 ${expanded ? "" : "opacity-0"}`}>
              Overview
            </h3>

            {navItems.slice(0, 3).map((item) => (
              <Link
                key={item.title}
                href={`/${locale}${item.path}`}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                  isActive(item.path)
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-50"
                }`}
              >
                {item.icon}
                {expanded && <span>{item.title}</span>}
              </Link>
            ))}
          </section>

          {/* MANAGEMENT */}
          <section>
            <h3 className={`text-xs font-semibold text-gray-500 uppercase mb-2 ${expanded ? "" : "opacity-0"}`}>
              Management
            </h3>

            {navItems.slice(3).map((item) => {
              const parentActive = item.children?.some((c) => isActive(c.path));

              /* =========================
                 RENDER PARENT ITEM
              ========================== */
              return (
                <div key={item.title} onMouseEnter={(e) => handleHoverEnter(e, item)} onMouseLeave={handleHoverLeave}>
                  
                  {/* Single-item (Sales) */}
                  {!item.children && (
                    <Link
                      href={`/${locale}${item.path}`}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                        isActive(item.path)
                          ? "bg-orange-500 text-white"
                          : "text-gray-700 hover:bg-orange-50"
                      }`}
                    >
                      {item.icon}
                      {expanded && <span>{item.title}</span>}
                    </Link>
                  )}

                  {/* Parent Dropdown */}
                  {item.children && (
                    <>
                      <div
                        onClick={() =>
                          expanded &&
                          setOpenMenus((prev) =>
                            prev.includes(item.title)
                              ? prev.filter((x) => x !== item.title)
                              : [...prev, item.title]
                          )
                        }
                        className={`relative flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition ${
                          parentActive
                            ? "bg-orange-50 text-orange-700 border border-orange-200"
                            : "text-gray-700 hover:bg-orange-50"
                        }`}
                      >
                        {parentActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full"></span>
                        )}

                        <div className="flex items-center gap-3">
                          {item.icon}
                          {expanded && <span>{item.title}</span>}
                        </div>

                        {expanded && <ChevronDown size={18} className={`${openMenus.includes(item.title) ? "rotate-180" : ""}`} />}
                      </div>

                      {/* Children → FIXED WITH SAFE CHECK */}
                      {expanded && item.children && openMenus.includes(item.title) && (
                        <div className="ml-10 mt-2 border-l-2 border-orange-200 pl-4 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.title}
                              href={`/${locale}${child.path}`}
                              className={`block px-3 py-2 text-sm rounded-md transition ${
                                isActive(child.path)
                                  ? "bg-orange-500 text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </section>
        </nav>
      </aside>

      {/* HOVER MENU */}
      {hoverMenu &&
        createPortal(
          <div
            style={{ top: hoverPosition.top, left: 80 }}
            className="fixed w-56 bg-white rounded-lg shadow-xl border py-3 z-50"
          >
            <div className="px-4 pb-2 border-b font-semibold text-gray-800">{hoverMenu}</div>

            <div className="mt-2">
              {navItems
                .find((i) => i.title === hoverMenu)
                ?.children?.map((child) => (
                  <Link
                    key={child.title}
                    href={`/${locale}${child.path}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {child.title}
                  </Link>
                ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

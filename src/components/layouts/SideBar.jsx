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
  MoreVertical,
  X,
} from "lucide-react";

/* STATIC NAV ITEMS */
const navItems = [
  // OVERVIEW
  {
    title: "Dashboard",
    icon: <LayoutDashboard size={22} />,
    path: "/inventory/dashboard",
    prefetch: true,
  },
  {
    title: "Analytics",
    icon: <BarChart3 size={22} />,
    path: "/inventory/analytics",
    prefetch: true,
  },
  {
    title: "Reports",
    icon: <FileSpreadsheet size={22} />,
    path: "/inventory/reports",
    prefetch: true,
  },

  // MANAGEMENT
  {
    title: "Staff & Branches",
    icon: <Users size={22} />,
    children: [
      { title: "Staff List", path: "/inventory/workers/list", prefetch: true },
      { title: "Branches", path: "/inventory/companies", prefetch: true },
    ],
  },
  {
    title: "Inventory",
    icon: <Package size={22} />,
    children: [
      { title: "Product List", path: "/inventory/products/list", prefetch: true },
      { title: "Product Details", path: "/inventory/products/details", prefetch: true },
    ],
  },

  // SALES → NO CHILDREN
  {
    title: "Sales",
    icon: <ShoppingBag size={22} />,
    path: "/inventory/sales",
    prefetch: true,
  },

  {
    title: "Debts",
    icon: <Wallet size={22} />,
    children: [
      { title: "Debts List", path: "/inventory/debts", prefetch: true },
      { title: "Debts Details", path: "/inventory/Debts/details", prefetch: true },
    ],
  },
  {
    title: "E-commerce",
    icon: <ShoppingCart size={22} />,
    children: [
      { title: "Overview", path: "/inventory/ecommerce/overview", prefetch: true },

      // PRODUCTS
      { title: "Product List", path: "/inventory/ecommerce/products", prefetch: true },
      { title: "Inventory Management", path: "/inventory/ecommerce/inventory_management", prefetch: true },
      { title: "Customer Management", path: "/inventory/ecommerce/customer_management", prefetch: true },
      { title: "Order Management", path: "/inventory/ecommerce/order_management", prefetch: true },
      { title: "Payments & Finance", path: "/inventory/ecommerce/payments_and_finance", prefetch: true },
      { title: "Shipping & Logistics", path: "/inventory/ecommerce/shippint_and_logistics", prefetch: true },
      { title: "Marketing Management", path: "/inventory/ecommerce/marketing_management", prefetch: true },
      { title: "Reviews", path: "/inventory/ecommerce/reveiews", prefetch: true },
    ],
  },
  {
    title: "Billing & Payments",
    icon: <Receipt size={22} />,
    children: [
      { title: "Invoices", path: "/inventory/billing/invoices", prefetch: true },
      { title: "Payments", path: "/inventory/billing/payments", prefetch: true },
    ],
  },
  {
    title: "Debt Manager",
    icon: <UserCheck size={22} />,
    children: [
      { title: "Customer Debts", path: "/inventory/debts/customers", prefetch: true },
      { title: "Supplier Debts", path: "/inventory/debts/suppliers", prefetch: true },
    ],
  },
  {
    title: "Documents",
    icon: <FileText size={22} />,
    children: [
      { title: "Invoices", path: "/inventory/invoices/list", prefetch: true },
      { title: "Payment History", path: "/inventory/invoices/details", prefetch: true },
    ],
  },
  {
    title: "Announcements",
    icon: <AlertCircle size={22} />,
    children: [
      { title: "List", path: "/inventory/announcements/list", prefetch: true },
      { title: "Create / Details", path: "/inventory/announcements/details", prefetch: true },
    ],
  },
];

export default function SideBar({ expanded: controlledExpanded, setExpanded: setControlledExpanded, onMobileChange }) {
  const pathname = usePathname();
  const locale = useLocale();

  const [expandedInternal, setExpandedInternal] = useState(true);
  const [openMenus, setOpenMenus] = useState([]);
  const [hoverMenu, setHoverMenu] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const expanded =
    typeof controlledExpanded === "boolean"
      ? controlledExpanded
      : expandedInternal;

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

  /* Set mounted state */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* Mobile detection */
  useEffect(() => {
    if (!mounted) return;

    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Notify parent component of mobile state change
      if (onMobileChange) {
        onMobileChange(mobile);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [mounted, onMobileChange]);

  return (
    <>
      {/* MOBILE VIEW */}
      {isMobile ? (
        <>
          {/* BOTTOM NAVIGATION BAR */}
          <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t shadow-lg rounded-t-3xl px-6 py-4 md:hidden">
            <div className="flex items-center justify-around max-w-md mx-auto">
              {/* Dashboard */}
              <Link
                href={`/${locale}/inventory/dashboard`}
                className="flex flex-col items-center gap-1 group"
              >
                <div className={`p-3 rounded-xl transition ${isActive("/inventory/dashboard")
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}>
                  <LayoutDashboard size={24} />
                </div>
                {isActive("/inventory/dashboard") && (
                  <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                )}
              </Link>

              {/* Analytics */}
              <Link
                href={`/${locale}/inventory/analytics`}
                className="flex flex-col items-center gap-1 group"
              >
                <div className={`p-3 rounded-xl transition ${isActive("/inventory/analytics")
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}>
                  <BarChart3 size={24} />
                </div>
                {isActive("/inventory/analytics") && (
                  <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                )}
              </Link>

              {/* Reports */}
              <Link
                href={`/${locale}/inventory/reports`}
                className="flex flex-col items-center gap-1 group"
              >
                <div className={`p-3 rounded-xl transition ${isActive("/inventory/reports")
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}>
                  <FileSpreadsheet size={24} />
                </div>
                {isActive("/inventory/reports") && (
                  <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                )}
              </Link>

              {/* More */}
              <button
                onClick={() => setMoreModalOpen(true)}
                className="flex flex-col items-center gap-1"
              >
                <div className={`p-3 rounded-xl transition ${moreModalOpen
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}>
                  <MoreVertical size={24} />
                </div>
              </button>
            </div>
          </nav>

          {/* SLIDE-UP MODAL */}
          {moreModalOpen && (
            <>
              {/* Backdrop */}
              <div
                onClick={() => setMoreModalOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
              ></div>

              {/* Modal Content */}
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-slideUp max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-white">
                  <h2 className="text-lg font-bold text-gray-800">Management</h2>
                  <button
                    onClick={() => setMoreModalOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                  >
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="overflow-y-auto max-h-[calc(80vh-80px)] px-4 py-6 space-y-2">
                  {navItems.slice(3).map((item) => {
                    const parentActive = item.children?.some((c) => isActive(c.path));

                    return (
                      <div key={item.title} className="space-y-1">
                        {/* Single Item (Sales) */}
                        {!item.children && (
                          <Link
                            href={`/${locale}${item.path}`}
                            onClick={() => setMoreModalOpen(false)}
                            className={`flex items-center gap-4 px-4 py-4 rounded-xl transition ${isActive(item.path)
                              ? "bg-orange-500 text-white shadow-lg"
                              : "text-gray-700 hover:bg-orange-50"
                              }`}
                          >
                            {item.icon}
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        )}

                        {/* Parent with Children */}
                        {item.children && (
                          <div>
                            <div
                              onClick={() =>
                                setOpenMenus((prev) =>
                                  prev.includes(item.title)
                                    ? prev.filter((x) => x !== item.title)
                                    : [...prev, item.title]
                                )
                              }
                              className={`flex items-center justify-between px-4 py-4 rounded-xl cursor-pointer transition ${parentActive
                                ? "bg-orange-50 text-orange-700 border border-orange-200"
                                : "text-gray-700 hover:bg-orange-50"
                                }`}
                            >
                              <div className="flex items-center gap-4">
                                {item.icon}
                                <span className="font-medium">{item.title}</span>
                              </div>
                              <ChevronDown
                                size={20}
                                className={`transition-transform ${openMenus.includes(item.title) ? "rotate-180" : ""
                                  }`}
                              />
                            </div>

                            {/* Children Links */}
                            {openMenus.includes(item.title) && item.children && (
                              <div className="ml-12 mt-2 space-y-1">
                                {item.children.map((child) => (
                                  <Link
                                    key={child.title}
                                    href={`/${locale}${child.path}`}
                                    onClick={() => setMoreModalOpen(false)}
                                    className={`block px-4 py-3 text-sm rounded-lg transition ${isActive(child.path)
                                      ? "bg-orange-500 text-white"
                                      : "text-gray-600 hover:bg-gray-100"
                                      }`}
                                  >
                                    {child.title}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      ) : null}

      {/* DESKTOP VIEW - ORIGINAL SIDEBAR */}
      {/* Hidden on mobile, visible on md and up */}
      <aside
        className={`hidden md:block fixed overflow-auto inset-y-0 left-0 z-30 bg-white border-r transition-all duration-300 ${
          expanded ? "w-64" : "w-16"
}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-5 border-b">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={22} />
          </button>

          <div
            className={`overflow-auto transition-all ${
              expanded ? "w-40" : "w-0"
            }`}
          >
            <span className="text-xl font-bold text-gray-900">
              INVEX<span className="text-orange-500 font-extrabold">iS</span>
            </span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-8">
          {/* OVERVIEW */}
          <section>
            <h3
              className={`text-xs font-semibold text-gray-500 uppercase mb-2 ${
                expanded ? "" : "opacity-0"
              }`}
            >
              Overview
            </h3>

            {navItems.slice(0, 3).map((item) => (
              <Link
                key={item.title}
                href={`/${locale}${item.path}`}
                prefetch={item.prefetch}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${isActive(item.path)
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
            <h3
              className={`text-xs font-semibold text-gray-500 uppercase mb-2 ${
                expanded ? "" : "opacity-0"
              }`}
            >
              Management
            </h3>

            {navItems.slice(3).map((item) => {
              const parentActive = item.children?.some((c) => isActive(c.path));

              return (
                <div
                  key={item.title}
                  onMouseEnter={(e) => handleHoverEnter(e, item)}
                  onMouseLeave={handleHoverLeave}
                >
                  {/* Single-item (Sales) */}
                  {!item.children && (
                    <Link
                      href={`/${locale}${item.path}`}
                      prefetch={item.prefetch}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${isActive(item.path)
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
                        className={`relative flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition ${parentActive
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

                        {expanded && (
                          <ChevronDown
                            size={18}
                            className={`${
                              openMenus.includes(item.title) ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </div>

                      {/* Children → FIXED WITH SAFE CHECK */}
                      {expanded &&
                        item.children &&
                        openMenus.includes(item.title) && (
                          <div className="ml-10 mt-2 border-l-2 border-orange-200 pl-4 space-y-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.title}
                                href={`/${locale}${child.path}`}
                                prefetch={child.prefetch}
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
            <div className="px-4 pb-2 border-b font-semibold text-gray-800">
              {hoverMenu}
            </div>

            <div className="mt-2">
              {navItems
                .find((i) => i.title === hoverMenu)
                ?.children?.map((child) => (
                  <Link
                    key={child.title}
                    href={`/${locale}${child.path}`}
                    prefetch={child.prefetch}
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

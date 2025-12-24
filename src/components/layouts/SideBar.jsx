"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  Package,
  ShoppingBag,
  Wallet,
  Receipt,
  FileText,
  Menu,
  ChevronDown,
  MoreVertical,
  X,
  Bell,
} from "lucide-react";
import { useSession } from "next-auth/react";

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
    title: "Notifications",
    icon: <Bell size={22} />,
    path: "/inventory/notifications",
    prefetch: true,
  },
  {
    title: "Reports",
    icon: <FileSpreadsheet size={22} />,
    path: "/inventory/reports",
    roles: ["manager", "company_admin"],
    prefetch: true,
  },

  // MANAGEMENT
  {
    title: "Staff & Shops",
    icon: <Users size={22} />,
    roles: ["company_admin"],
    children: [
      { title: "Staff List", path: "/inventory/workers/list", prefetch: true },
      { title: "Shops", path: "/inventory/companies", prefetch: true },
    ],
  },
  {
    title: "Inventory",
    icon: <Package size={22} />,
    roles: ["manager", "company_admin"],
    children: [
      { title: "Overview", path: "/inventory/Overview", prefetch: true },
      { title: "Products", path: "/inventory/products", prefetch: true },
      { title: "Categories", path: "/inventory/categories", prefetch: true },
      { title: "Reports", path: "/inventory/report", prefetch: true },
      { title: "Stock settings", path: "/inventory/stock", prefetch: true },

    ],
  },

  // SALES → WITH CHILDREN
  {
    title: "Sales",
    icon: <ShoppingBag size={22} />,
    roles: ["sales_manager", "company_admin"],
    children: [
      { title: "Sales History", path: "/inventory/sales/history", prefetch: true },
      { title: "Stock-out", path: "/inventory/sales/sellProduct/sale", prefetch: true },
      // { title: "Reports", path: "/inventory/sales/reports", prefetch: true },
    ],
  },

  {
    title: "Debts",
    icon: <Wallet size={22} />,
    path: "/inventory/debts",
    roles: ["sales_manager", "company_admin"],
    prefetch: true,
  },
  {
    title: "Billing & Payments",
    icon: <Receipt size={22} />,
    roles: ["sales_manager", "company_admin"],
    children: [
      {
        title: "Invoices",
        path: "/inventory/billing/invoices",
        prefetch: true,
      },
      {
        title: "Payments",
        path: "/inventory/billing/payments",
        prefetch: true,
      },
      {
        title: "Transactions",
        path: "/inventory/billing/transactions",
        prefetch: true,
      }
    ],
  },
  {
    title: "Documents",
    icon: <FileText size={22} />,
    path: "/inventory/documents",
    roles: ["manager", "company_admin"],
    prefetch: true,
  },
  // company_admin-only logs link
  {
    title: "Logs & Audits",
    icon: <FileSpreadsheet size={22} />,
    path: "/inventory/logs",
    roles: ["company_admin"],
    prefetch: true,
  },
];

export default function SideBar({
  expanded: controlledExpanded,
  setExpanded: setControlledExpanded,
  onMobileChange,
}) {
  const pathname = usePathname();
  const locale = useLocale();

  const [expandedInternal, setExpandedInternal] = useState(true);
  const [openMenus, setOpenMenus] = useState([]);
  const [hoverMenu, setHoverMenu] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect theme
  useEffect(() => {
    if (!mounted) return;
    const checkTheme = () => {
      const darkMode = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(darkMode);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [mounted]);

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

  const { data: session } = useSession();
  const user = session?.user;
  const userRole = user?.role;
  const assignedDepartments = user?.assignedDepartments || [];

  const visibleFor = (item) => {
    if (!item) return false;

    // Admin: role is company_admin OR no assigned departments
    if (userRole === "company_admin" || assignedDepartments.length === 0) {
      return true;
    }

    const itemTitle = item.title.trim();
    const itemPath = item.path || "";
    const isManager = assignedDepartments.includes("management");
    const isWorker = assignedDepartments.includes("sales");

    // Features for Worker (Sales)
    const workerFeatures = [
      "Dashboard",
      "Inventory",
      "Sales",
      "Sales History",
      "Stock-out",
      "Debts",
      "Notifications",
      "Overview",
      "Products",
      "Categories",
      "Debts List",
      "Debts Details",
      "Debts Analytics",
    ];

    // Paths that workers are NOT allowed to see even if the parent is allowed
    const workerBlockedPaths = [
      "/inventory/report",
      "/inventory/stock",
    ];

    if (isWorker) {
      if (workerBlockedPaths.some(p => itemPath.startsWith(p))) return false;
      return workerFeatures.includes(itemTitle);
    }

    // Features for Manager (Management)
    if (isManager) {
      const managerFeatures = [
        ...workerFeatures,
        "Staff & Shops",
        "Billing & Payments",
        "E-commerce",
        "Analytics",
        "Reports",
        "Documents",
      ];
      return managerFeatures.includes(itemTitle);
    }

    return false;
  };

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
                prefetch={true}
                className="flex flex-col items-center gap-1 group"
              >
                <div
                  className={`p-3 rounded-xl transition ${isActive("/inventory/dashboard")
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <LayoutDashboard size={24} />
                </div>
                {isActive("/inventory/dashboard") && (
                  <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                )}
              </Link>

              {/* Notifications */}
              <Link
                href={`/${locale}/inventory/notifications`}
                prefetch={true}
                className="flex flex-col items-center gap-1 group"
              >
                <div
                  className={`p-3 rounded-xl transition ${isActive("/inventory/notifications")
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <Bell size={24} />
                </div>
                {isActive("/inventory/notifications") && (
                  <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                )}
              </Link>

              {/* Reports */}
              {visibleFor(navItems[2]) && (
                <Link
                  href={`/${locale}/inventory/reports`}
                  prefetch={true}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div
                    className={`p-3 rounded-xl transition ${isActive("/inventory/reports")
                      ? "bg-orange-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <FileSpreadsheet size={24} />
                  </div>
                  {isActive("/inventory/reports") && (
                    <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                  )}
                </Link>
              )}

              {/* More */}
              <button
                onClick={() => setMoreModalOpen(true)}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`p-3 rounded-xl transition ${moreModalOpen
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
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
                <div className="flex items-center justify-between px-6 py-4 border-b bg-linear-to-r from-orange-50 to-white">
                  <h2 className="text-lg font-bold text-gray-800">
                    Management
                  </h2>
                  <button
                    onClick={() => setMoreModalOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                  >
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="overflow-y-auto max-h-[calc(80vh-80px)] px-4 py-6 space-y-2">
                  {navItems
                    .slice(3)
                    .filter(visibleFor)
                    .map((item) => {
                      const parentActive = item.children?.some((c) =>
                        isActive(c.path)
                      );

                      return (
                        <div key={item.title} className="space-y-1">
                          {/* Single Item (Sales) */}
                          {!item.children && (
                            <Link
                              href={`/${locale}${item.path}`}
                              prefetch={item.prefetch}
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
                                  <span className="font-medium">
                                    {item.title}
                                  </span>
                                </div>
                                <ChevronDown
                                  size={20}
                                  className={`transition-transform ${openMenus.includes(item.title)
                                    ? "rotate-180"
                                    : ""
                                    }`}
                                />
                              </div>

                              {/* Children Links */}
                              {openMenus.includes(item.title) &&
                                item.children && (
                                  <div className="ml-12 mt-2 space-y-1">
                                    {item.children
                                      .filter(visibleFor)
                                      .map((child) => (
                                        <Link
                                          key={child.title}
                                          href={`/${locale}${child.path}`}
                                          prefetch={child.prefetch}
                                          onClick={() =>
                                            setMoreModalOpen(false)
                                          }
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
        className={`hidden md:block fixed inset-y-0  left-0 z-30 bg-white border-r transition-all duration-300 ${expanded ? "w-64" : "w-16"
          }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          {expanded ? (
            // Only burger icon when expanded
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={22} />
            </button>
          ) : (
            // Logo when collapsed
            <div className="flex items-center justify-center w-full">
              <img
                src={isDarkMode ? "/images/Invexix Logo-Dark Mode.png" : "/images/Invexix Logo-Light Mode.png"}
                alt="Invexis"
                className="h-8 w-8 object-contain transition-all duration-300"
              />
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className={`flex-1 overflow-y-auto  py-4 pb-20 space-y-6 ${expanded ? "px-3" : "px-2"}`}>
          {/* OVERVIEW */}
          <section>
            <h3
              className={`text-xs font-semibold text-gray-500 uppercase mb-2 ${expanded ? "" : "opacity-0"
                }`}
            >
              Overview
            </h3>

            {navItems
              .slice(0, 3)
              .filter(visibleFor)
              .map((item) => (
                <Link
                  key={item.title}
                  href={`/${locale}${item.path}`}
                  prefetch={item.prefetch}
                  className={`flex items-center gap-3 px-3 py-3  transition ${isActive(item.path)
                    ? "bg-orange-50  border-l-2 border-orange-500 text-orange-500"
                    : "text-gray-700 hover:bg-orange-50"
                    }`}
                >
                  {item.icon}
                  {expanded && <span>{item.title}</span>}
                </Link>
              ))}
          </section>

          {/* MANAGEMENT */}
          <section className="">
            <h3
              className={`text-xs font-semibold text-gray-500 uppercase mb-2 ${expanded ? "" : "opacity-0"
                }`}
            >
              Management
            </h3>

            {navItems
              .slice(3)
              .filter(visibleFor)
              .map((item) => {
                const parentActive = item.children?.some((c) =>
                  isActive(c.path)
                );

                return (
                  <div
                    key={item.title}
                    onMouseEnter={(e) => handleHoverEnter(e, item)}
                    onMouseLeave={handleHoverLeave}
                  >
                    {/* Single-item (Sales) */}
                    {!item.children && visibleFor(item) && (
                      <Link
                        href={`/${locale}${item.path}`}
                        prefetch={item.prefetch}
                        className={`flex items-center gap-3 px-3 py-3  transition ${isActive(item.path)
                          ? "bg-orange-50  border-l-2 border-orange-500 text-orange-500"
                          : "text-gray-700 hover:bg-orange-50"
                          }`}
                      >
                        {item.icon}
                        {expanded && <span>{item.title}</span>}
                      </Link>
                    )}

                    {/* Parent Dropdown */}
                    {item.children &&
                      item.children.filter(visibleFor).length > 0 && (
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
                            className={`relative flex items-center justify-between px-3 py-3  cursor-pointer transition ${parentActive
                              ? " bg-gray-200 rounded-xl text-black font-bold"
                              : "text-gray-700 hover:bg-orange-50"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              {item.icon}
                              {expanded && <span>{item.title}</span>}
                            </div>

                            {expanded && (
                              <ChevronDown
                                size={18}
                                className={`${openMenus.includes(item.title)
                                  ? "rotate-180"
                                  : ""
                                  }`}
                              />
                            )}
                          </div>

                          {/* Children → FIXED WITH SAFE CHECK */}
                          {expanded &&
                            item.children &&
                            openMenus.includes(item.title) && (
                              <div className="ml-10 mt-2  border-l px-3">
                                {item.children.filter(visibleFor).map((child) => (
                                  <Link
                                    key={child.title}
                                    href={`/${locale}${child.path}`}
                                    prefetch={child.prefetch}
                                    className={`block px-3 py-2 text-sm  transition ${isActive(child.path)
                                      ? "bg-gray-200 rounded-lg text-black font-bold"
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

        {/* TOGGLE BUTTON - Bottom Right */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="absolute bottom-[54px] right-0 translate-x-1/2 z-40 p-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-full shadow-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-110 group"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
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
                ?.children?.filter(visibleFor)
                .map((child) => (
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

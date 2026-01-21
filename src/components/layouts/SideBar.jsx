"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
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
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/providers/NotificationProvider";
import AnalyticsService from "@/services/analyticsService";
import { getSalesHistory } from "@/services/salesService";
import { getWorkersByCompanyId } from "@/services/workersService";
import { getBranches } from "@/services/branches";
import dayjs from "dayjs";

/* STATIC NAV ITEMS TEMPLATE - will be replaced with translations in component */
const getNavItems = (t) => [
  // OVERVIEW
  {
    title: t("sidebar.dashboard"),
    icon: <LayoutDashboard size={22} />,
    path: "/inventory/dashboard",
    prefetch: true,
  },
  {
    title: t("sidebar.notifications"),
    icon: <Bell size={22} />,
    children: [
      { title: t("sidebar.inbox"), path: "/inventory/notifications", prefetch: true },
    ],
  },
  {
    title: t("sidebar.reports"),
    icon: <FileSpreadsheet size={22} />,
    path: "/inventory/reports",
    roles: ["worker", "company_admin"],
    prefetch: true,
  },

  // MANAGEMENT
  {
    title: t("sidebar.staffAndShops"),
    icon: <Users size={22} />,
    roles: ["company_admin"],
    children: [
      { title: t("sidebar.staffList"), path: "/inventory/workers/list", prefetch: true },
      { title: t("sidebar.shops"), path: "/inventory/companies", prefetch: true },
    ],
  },
  {
    title: t("sidebar.inventory"),
    icon: <Package size={22} />,
    roles: ["worker", "company_admin"],
    children: [
      { title: t("sidebar.inventoryOverview"), path: "/inventory/Overview", prefetch: true },
      { title: t("sidebar.categories"), path: "/inventory/categories", prefetch: true },
      { title: t("sidebar.products"), path: "/inventory/products", prefetch: true },
      { title: t("sidebar.transfers"), path: "/inventory/transfer", prefetch: true },
      { title: t("sidebar.stockOps"), path: "/inventory/stock", prefetch: true },
    ],
  },

  // SALES → WITH CHILDREN
  {
    title: t("sidebar.sales"),
    icon: <ShoppingBag size={22} />,
    roles: ["sales_manager", "company_admin"],
    children: [
      { title: t("sidebar.salesHistory"), path: "/inventory/sales/history", prefetch: true },
      { title: t("sidebar.stockOut"), path: "/inventory/sales/sellProduct/sale", prefetch: true },
    ],
  },

  {
    title: t("sidebar.debts"),
    icon: <Wallet size={22} />,
    path: "/inventory/debts",
    roles: ["sales_manager", "company_admin"],
    prefetch: true,
  },
  {
    title: t("sidebar.billingAndPayments"),
    icon: <Receipt size={22} />,
    roles: ["sales_manager", "company_admin"],
    children: [
      {
        title: t("sidebar.invoices"),
        path: "/inventory/billing/invoices",
        prefetch: true,
      },
      {
        title: t("sidebar.payments"),
        path: "/inventory/billing/payments",
        prefetch: true,
      },
      {
        title: t("sidebar.transactions"),
        path: "/inventory/billing/transactions",
        prefetch: true,
      }
    ],
  },
  {
    title: t("sidebar.documents"),
    icon: <FileText size={22} />,
    path: "/inventory/documents",
    roles: ["manager", "company_admin"],
    prefetch: true,
  },
  // company_admin-only logs link
  {
    title: t("sidebar.logsAndAudits"),
    icon: <FileSpreadsheet size={22} />,
    path: "/inventory/logs",
    roles: ["company_admin"],
    prefetch: true,
  },
];

export default function SideBar({
  expanded: controlledExpanded,
  setExpanded: setControlledExpanded,
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const { setLoading, setLoadingText } = useLoading();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  // Get translated nav items
  const navItems = getNavItems(t);

  const { data: session } = useSession();
  const user = session?.user;
  const userRole = user?.role;
  const assignedDepartments = user?.assignedDepartments || [];

  const [expandedInternal, setExpandedInternal] = useState(true);
  const [openMenus, setOpenMenus] = useState([]);
  const [hoverItem, setHoverItem] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const timeoutRef = useRef(null);
  const prefetchTimeoutRef = useRef(null);

  const cleanTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

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

  const prefetchData = useCallback((item) => {
    if (!item.path || !session?.accessToken) return;

    const companyObj = session.user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);
    const userId = session.user?._id || session.user?.id;

    if (!companyId) return;

    const options = {
      headers: { Authorization: `Bearer ${session.accessToken}` }
    };

    // Prefetch based on path
    if (item.path.includes("/analytics")) {
      const end = dayjs();
      const params = {
        startDate: end.subtract(7, 'day').format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
        interval: 'day'
      };
      queryClient.prefetchQuery({
        queryKey: ['analytics', 'summary', params],
        queryFn: () => AnalyticsService.getDashboardSummary(params, options)
      });
    } else if (item.path.includes("/sales/history")) {
      queryClient.prefetchQuery({
        queryKey: ["salesHistory", companyId, userId, ""],
        queryFn: () => getSalesHistory(companyId, { soldBy: userId, shopId: "" }, options)
      });
    } else if (item.path.includes("/workers/list")) {
      queryClient.prefetchQuery({
        queryKey: ["workers", companyId],
        queryFn: () => getWorkersByCompanyId(companyId, options)
      });
    } else if (item.path.includes("/companies")) {
      queryClient.prefetchQuery({
        queryKey: ["shops", companyId],
        queryFn: () => getBranches(companyId, options)
      });
    }
  }, [queryClient, session]);

  /* hover prefetch with debounce to prevent sluggishness */
  const handleHoverEnter = useCallback(
    (e, item) => {
      cleanTimeout();

      // Debounce prefetching (only fire if user hovers for > 80ms)
      if (prefetchTimeoutRef.current) clearTimeout(prefetchTimeoutRef.current);

      prefetchTimeoutRef.current = setTimeout(() => {
        // 1. Prefetch Route (Next.js)
        if (item.path && !isActive(item.path)) {
          router.prefetch(`/${locale}${item.path}`);
        }

        // 2. Prefetch Data (React Query)
        prefetchData(item);

        // Prefetch routes for first few children to be ready, but DON'T fetch data yet
        if (item.children) {
          item.children.slice(0, 4).forEach(child => {
            if (child.path && !isActive(child.path)) {
              router.prefetch(`/${locale}${child.path}`);
            }
          });
        }
      }, 200);

      if (!expanded) {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoverItem(item);
        setHoverPosition({ top: rect.top });
      }
    },
    [expanded, locale, router, prefetchData]
  );

  const handleHoverLeave = () => {
    if (prefetchTimeoutRef.current) clearTimeout(prefetchTimeoutRef.current);
    if (!expanded) {
      timeoutRef.current = setTimeout(() => {
        setHoverItem(null);
      }, 300);
    }
  };

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

  const handleLogout = async () => {
    try {
      setLoadingText("Logging out...");
      setLoading(true);

      // Sign out from NextAuth
      await signOut({ redirect: false });

      router.push(`/${locale}/auth/login`);
    } catch (error) {
      console.error("Logout failed:", error);
      showNotification({
        severity: "error",
        message: "Logout failed. Please try again.",
      });
    } finally {
      // Don't turn off loading here, let the redirect page handle it or it clears on unmount
      // preventing flicker
    }
  };



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
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [mounted]);

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
          transition: background 0.2s;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #fdba74; /* orange-300 */
        }
        .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #ea580c; /* orange-600 */
        }
      `}</style>
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
                  <h2 className="text-lg font-bold text-gray-800 ">
                    {t("sidebar.management")}
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
        className={`hidden md:block fixed inset-y-0 left-0 z-30 bg-white border-r transition-all duration-300 ease-in-out flex flex-col ${expanded ? "w-[280px]" : "w-[72px]"
          }`}
      >
        {/* HEADER */}
        <div className="flex overflow-y-auto overflow-x-hidden shrink-0 items-center px-4 h-16 border-b overflow-hidden">
          <div className={`flex items-center transition-all duration-300 ease-in-out ${expanded ? "w-full justify-between" : "w-full justify-center"}`}>
            {expanded ? (
              <div className="flex items-center gap-2 overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
                <img
                  src={isDarkMode ? "/images/Invexix Logo-Dark Mode.png" : "/images/Invexix Logo-Light Mode.png"}
                  alt="Invexis"
                  className="h-8 w-auto object-contain"
                />
              </div>
            ) : (
              <img
                src={isDarkMode ? "/images/Invexix Logo-Dark Mode.png" : "/images/Invexix Logo-Light Mode.png"}
                alt="Invexis"
                className="h-8 w-8 object-contain transition-all duration-300"
              />
            )}
            {expanded && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
              >
                <Menu size={22} />
              </button>
            )}
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-4 space-y-6 custom-scrollbar ${expanded ? "px-3" : "px-2"}`}>
          {/* OVERVIEW */}
          <section>
            <h3
              className={`text-xs font-semibold text-gray-500 uppercase mb-4 px-3 transition-opacity duration-300 whitespace-nowrap overflow-hidden ${expanded ? "opacity-100" : "opacity-0"
                }`}
            >
              {t("sidebar.overview")}
            </h3>

            {navItems
              .slice(0, 3)
              .filter(visibleFor)
              .map((item) => (
                <div
                  key={item.title}
                  onMouseEnter={(e) => handleHoverEnter(e, item)}
                  onMouseLeave={handleHoverLeave}
                >
                  <Link
                    href={`/${locale}${item.path}`}
                    prefetch={item.prefetch}
                    onMouseEnter={() => prefetchData(item)}
                    className={`flex items-center gap-3 px-3 py-3  transition ${isActive(item.path)
                      ? "bg-orange-100 font-bold border-l-5 border-orange-500 text-orange-500"
                      : "text-gray-700 hover:bg-orange-50"
                      }`}
                  >
                    <div className="flex items-center justify-center shrink-0 w-6">
                      {item.icon}
                    </div>
                    <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${expanded ? "opacity-100 w-auto ml-1" : "opacity-0 w-0 ml-0"}`}>
                      {item.title}
                    </span>
                  </Link>
                </div>
              ))}
          </section>

          {/* MANAGEMENT */}
          <section className="">
            <h3
              className={`text-xs font-semibold text-gray-500 uppercase mb-3 px-3 transition-opacity duration-300 whitespace-nowrap overflow-hidden ${expanded ? "opacity-100" : "opacity-0"
                }`}
            >
              {t("sidebar.management")}
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
                        onMouseEnter={() => prefetchData(item)}
                        className={`flex items-center gap-3 px-3 py-3  transition ${isActive(item.path)
                          ? "bg-gray-100 font-bold border-l-5 border-orange-500 text-orange-500"
                          : "text-gray-700 hover:bg-orange-50"
                          }`}
                      >
                        <div className="flex items-center justify-center shrink-0 w-6">
                          {item.icon}
                        </div>
                        <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${expanded ? "opacity-100 w-auto ml-1" : "opacity-0 w-0 ml-0"}`}>
                          {item.title}
                        </span>
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
                              ? "bg-orange-100 font-bold border-l-5 border-orange-500 text-orange-500"
                              : "text-gray-700 hover:bg-orange-50"
                              }`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="flex items-center justify-center shrink-0 w-6">
                                {item.icon}
                              </div>
                              <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${expanded ? "opacity-100 w-auto ml-1" : "opacity-0 w-0 ml-0"}`}>
                                {item.title}
                              </span>
                            </div>

                            <ChevronDown
                              size={18}
                              className={`transition-all duration-300 ${expanded ? "opacity-100" : "opacity-0"} ${openMenus.includes(item.title) ? "rotate-180" : ""}`}
                            />
                          </div>

                          {/* Children → FIXED WITH SAFE CHECK */}
                          {expanded && item.children && (
                            <div className={`ml-10 mt-1 transition-all duration-300 ease-in-out overflow-hidden ${openMenus.includes(item.title) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                              {item.children.filter(visibleFor).map((child) => (
                                <Link
                                  key={child.title}
                                  href={`/${locale}${child.path}`}
                                  prefetch={child.prefetch}
                                  onMouseEnter={() => prefetchData(child)}
                                  className={`block px-3 py-2 text-sm transition-all duration-200 ${isActive(child.path)
                                    ? "bg-gray-100 font-bold border-l-3 border-blue-500 text-blue-500"
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

        {/* LOGOUT SECTION */}
        <div className={`shrink-0 border-t border-gray-100 py-2 m-3 ${expanded ? "mb-0" : "mb-0"}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 bg-black rounded-lg transition-colors group ${expanded
              ? "justify-start text-orange-500 hover:bg-black hover:text-white"
              : "justify-center text-orange-500 hover:bg-black hover:text-white"
              }`}
            title={!expanded ? t("sidebar.logout") : ""}
          >
            <div className="flex items-center justify-center shrink-0 w-6">
              <LogOut size={22} className="shrink-0 group-hover:stroke-orange-500" />
            </div>
            <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden font-medium group-hover:text-orange-500 ${expanded ? "opacity-100 w-auto ml-1" : "opacity-0 w-0 ml-0"}`}>
              {t("sidebar.logout")}
            </span>
          </button>
        </div>

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
      </aside >

      {/* HOVER MENU */}
      {hoverItem && mounted &&
        createPortal(
          <div
            style={{
              top: hoverPosition.top,
              left: 72,
              opacity: hoverItem ? 1 : 0,
              transform: hoverItem ? 'translateX(0)' : 'translateX(-10px)'
            }}
            className="fixed w-56 bg-white dark:bg-gray-800 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 dark:border-gray-700 py-2 z-50 transition-all duration-200 animate-in fade-in slide-in-from-left-2"
            onMouseEnter={cleanTimeout}
            onMouseLeave={handleHoverLeave}
          >
            {/* Header/Main Link */}
            {!hoverItem.children ? (
              <Link
                href={`/${locale}${hoverItem.path}`}
                prefetch={hoverItem.prefetch}
                onMouseEnter={() => prefetchData(hoverItem)}
                onClick={() => setHoverItem(null)}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all ${isActive(hoverItem.path)
                  ? "bg-orange-500 text-white font-bold shadow-md"
                  : "text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400"
                  }`}
              >
                <span className="text-sm">{hoverItem.title}</span>
              </Link>
            ) : (
              <>
                <div className="px-4 py-2 mb-1 border-b border-gray-50 dark:border-gray-700 font-bold text-gray-900 dark:text-white text-sm flex items-center justify-between">
                  {hoverItem.title}
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"></div>
                </div>

                <div className="space-y-0.5 px-2">
                  {hoverItem.children.filter(visibleFor).map((child) => (
                    <Link
                      key={child.title}
                      href={`/${locale}${child.path}`}
                      prefetch={child.prefetch}
                      onMouseEnter={() => prefetchData(child)}
                      onClick={() => setHoverItem(null)}
                      className={`block px-3 py-2 text-sm rounded-lg transition-all ${isActive(child.path)
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>,
          document.body
        )
      }
    </>
  );
}

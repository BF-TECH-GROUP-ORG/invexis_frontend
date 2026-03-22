"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
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
  BarChart3,
  Files,
  History,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useLoading } from "@/contexts/LoadingContext";
import useRouteLoading from "@/hooks/useRouteLoading";
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
    icon: <LayoutDashboard size={20} />,
    path: "/inventory/dashboard",
    prefetch: true,
    tourId: "tour-dashboard",
    id: "sidebar-dashboard",
  },
  {
    title: t("sidebar.notifications"),
    icon: <Bell size={20} />,
    path: "/inventory/notifications",
    prefetch: true,
    tourId: "tour-notifications-sidebar",
    id: "sidebar-notifications",
  },
  {
    title: t("sidebar.reports"),
    icon: <BarChart3 size={20} />,
    path: "/inventory/reports",
    prefetch: true,
    tourId: "tour-reports-sidebar",
    id: "sidebar-reports",
  },

  // MANAGEMENT
  {
    title: t("sidebar.staffAndShops"),
    icon: <Users size={20} />,
    roles: ["company_admin"],
    tourId: "tour-management",
    id: "sidebar-mgmt-staff",
    children: [
      { title: t("sidebar.staffList"), path: "/inventory/workers/list", prefetch: true, id: "sidebar-staff-list" },
    ],
  },
  {
    title: t("sidebar.inventory"),
    icon: <Package size={20} />,
    roles: ["worker", "company_admin"],
    tourId: "tour-inventory",
    id: "sidebar-mgmt-inventory",
    children: [
      { title: t("categories.list.title"), path: "/inventory/categories", prefetch: true, id: "sidebar-categories" },
      { title: t("sidebar.products"), path: "/inventory/products", prefetch: true, id: "sidebar-products" },
      { title: t("sidebar.transfers"), path: "/inventory/transfer", prefetch: true, id: "sidebar-transfers" },
      { title: t("sidebar.stockOps"), path: "/inventory/stock", prefetch: true, id: "sidebar-stock" },
    ],
  },

  // SALES
  {
    title: t("sidebar.sales"),
    icon: <ShoppingBag size={20} />,
    roles: ["sales_manager", "company_admin"],
    tourId: "tour-sales",
    id: "sidebar-mgmt-sales",
    children: [
      { title: t("sidebar.salesHistory"), path: "/inventory/sales/history", prefetch: true, id: "sidebar-sales-history" },
      { title: t("sidebar.stockOut"), path: "/inventory/sales/sellProduct/sale", prefetch: true, id: "sidebar-pos" },
    ],
  },
  {
    title: t("sidebar.debts"),
    icon: <Wallet size={20} />,
    path: "/inventory/debts",
    roles: ["sales_manager", "company_admin"],
    prefetch: true,
    tourId: "tour-debts",
    id: "sidebar-debts",
  },
  {
    title: t("sidebar.billingAndPayments"),
    icon: <Receipt size={20} />,
    roles: ["sales_manager", "company_admin"],
    tourId: "tour-billing",
    id: "sidebar-mgmt-billing",
    children: [
      { title: t("sidebar.invoices"), path: "/inventory/billing/invoices", prefetch: true, id: "sidebar-invoices" },
      { title: t("sidebar.transactions"), path: "/inventory/billing/transactions", prefetch: true, id: "sidebar-transactions" },
    ],
  },
  {
    title: t("sidebar.documents"),
    icon: <Files size={20} />,
    path: "/inventory/documents",
    roles: ["manager", "company_admin"],
    prefetch: true,
    tourId: "tour-documents",
    id: "sidebar-documents",
  },
  {
    title: t("sidebar.logsAndAudits"),
    icon: <History size={20} />,
    path: "/inventory/logs",
    roles: ["company_admin"],
    prefetch: true,
    tourId: "tour-logs",
    id: "sidebar-logs",
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
  const { startNavigating } = useRouteLoading();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const user = session?.user;
  const userRole = user?.role;
  const assignedDepartments = user?.assignedDepartments || [];

  const navItems = getNavItems(t);

  const [expandedInternal, setExpandedInternal] = useState(true);
  const [openMenus, setOpenMenus] = useState([]);
  const [hoverItem, setHoverItem] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [optimisticPath, setOptimisticPath] = useState(null);

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
    (path) => {
      const currentPath = optimisticPath || pathname;
      return currentPath === path || currentPath.startsWith(`${path}/`);
    },
    [pathname, optimisticPath]
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

  const handleHoverEnter = useCallback(
    (e, item) => {
      cleanTimeout();

      if (prefetchTimeoutRef.current) clearTimeout(prefetchTimeoutRef.current);

      prefetchTimeoutRef.current = setTimeout(() => {
        if (item.path && !isActive(item.path)) {
          router.prefetch(`/${locale}${item.path}`);
        }
        prefetchData(item);

        if (item.children) {
          item.children.slice(0, 6).forEach(child => {
            if (child.path && !isActive(child.path)) {
              router.prefetch(`/${locale}${child.path}`);
            }
          });
        }
      }, 150);

      if (!expanded) {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoverItem(item);
        setHoverPosition({ top: rect.top });
      }
    },
    [expanded, locale, router, prefetchData, isActive]
  );

  const handleHoverLeave = () => {
    if (prefetchTimeoutRef.current) clearTimeout(prefetchTimeoutRef.current);
    if (!expanded) {
      timeoutRef.current = setTimeout(() => {
        setHoverItem(null);
      }, 300);
    }
  };

  /* Auto-open active parent with better dependency tracking */
  useEffect(() => {
    if (!mounted) return;
    const activeParents = navItems
      .filter((item) => item.children?.some((child) => isActive(child.path)))
      .map((item) => item.title);

    setOpenMenus((prev) => {
      // Keep existing open menus but ensure active ones are included
      const next = [...new Set([...prev, ...activeParents])];
      return next;
    });
  }, [pathname, optimisticPath, mounted]); // Removed isActive and navItems to avoid excessive triggering

  /* Clear optimistic path on actual navigation */
  useEffect(() => {
    if (pathname === optimisticPath) {
      setOptimisticPath(null);
    }
  }, [pathname, optimisticPath]);

  /* Set mounted state */
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      setLoadingText("Logging out...");
      setLoading(true);
      await signOut({ redirect: false });
      router.push(`/${locale}/auth/login`);
    } catch (error) {
      console.error("Logout failed:", error);
      showNotification({
        severity: "error",
        message: "Logout failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const visibleFor = (item) => {
    if (!item) return false;
    if (userRole === "company_admin") return true;

    const itemTitle = item.title.trim();
    const isSales = assignedDepartments.includes("sales");
    const isManagement = assignedDepartments.includes("management");

    if (isSales) {
      const salesAllowedTitles = [
        t("sidebar.notifications"),
        t("sidebar.sales"),
        t("sidebar.salesHistory"),
        t("sidebar.stockOut"),
        t("sidebar.debts"),
      ];
      return salesAllowedTitles.includes(itemTitle);
    }

    if (isManagement) return true;
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
          background: #fdba74;
        }
        .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #ea580c;
        }
      `}</style>

      {/* MOBILE VIEW */}
      {isMobile ? (
        <>
          <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t shadow-lg rounded-t-3xl px-6 py-4 md:hidden">
            <div className="flex items-center justify-around max-w-md mx-auto">
              <Link
                href="/inventory/dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  if (!isActive("/inventory/dashboard")) {
                    setOptimisticPath("/inventory/dashboard");
                    startNavigating();
                    router.push("/inventory/dashboard");
                  }
                }}
                className={`flex flex-col items-center gap-1 group`}
              >
                <div className={`p-3 rounded-xl transition ${isActive("/inventory/dashboard") ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                  <LayoutDashboard size={24} />
                </div>
                {isActive("/inventory/dashboard") && <div className="w-1 h-1 bg-orange-500 rounded-full"></div>}
              </Link>

              <Link
                href="/inventory/notifications"
                onClick={(e) => {
                  e.preventDefault();
                  if (!isActive("/inventory/notifications")) {
                    setOptimisticPath("/inventory/notifications");
                    startNavigating();
                    router.push("/inventory/notifications");
                  }
                }}
                className="flex flex-col items-center gap-1 group"
              >
                <div className={`p-3 rounded-xl transition ${isActive("/inventory/notifications") ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                  <Bell size={24} />
                </div>
                {isActive("/inventory/notifications") && <div className="w-1 h-1 bg-orange-500 rounded-full"></div>}
              </Link>

              {visibleFor(navItems[2]) && (
                <Link
                  href="/inventory/reports"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isActive("/inventory/reports")) {
                      setOptimisticPath("/inventory/reports");
                      startNavigating();
                      router.push("/inventory/reports");
                    }
                  }}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`p-3 rounded-xl transition ${isActive("/inventory/reports") ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                    <BarChart3 size={24} />
                  </div>
                  {isActive("/inventory/reports") && <div className="w-1 h-1 bg-orange-500 rounded-full"></div>}
                </Link>
              )}

              <button onClick={() => setMoreModalOpen(true)} className="flex flex-col items-center gap-1">
                <div className={`p-3 rounded-xl transition ${moreModalOpen ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                  <MoreVertical size={24} />
                </div>
              </button>
            </div>
          </nav>

          {/* Mobile slide-up modal with simple reveal */}
          {moreModalOpen && (
            <>
              <div onClick={() => setMoreModalOpen(false)} className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"></div>
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-slideUp max-h-[80vh] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b bg-linear-to-r from-orange-50 to-white">
                  <h2 className="text-lg font-bold text-gray-800">{t("sidebar.management")}</h2>
                  <button onClick={() => setMoreModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 transition">
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[calc(80vh-80px)] px-4 py-6 space-y-2">
                  {navItems.slice(3).filter(visibleFor).map((item) => {
                    const parentActive = item.children?.some((c) => isActive(c.path));
                    return (
                      <div key={item.title} className="space-y-1">
                        {!item.children ? (
                          <Link
                            href={item.path}
                            onClick={(e) => {
                              e.preventDefault();
                              setMoreModalOpen(false);
                              if (!isActive(item.path)) {
                                setOptimisticPath(item.path);
                                startNavigating();
                                router.push(item.path);
                              }
                            }}
                            className={`flex items-center gap-4 px-4 py-4 rounded-xl transition ${isActive(item.path) ? "bg-orange-500 text-white shadow-lg" : "text-gray-700 hover:bg-orange-50"}`}
                          >
                            {item.icon}
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        ) : (
                          <div>
                            <div
                              onClick={() => setOpenMenus(prev => prev.includes(item.title) ? prev.filter(x => x !== item.title) : [...prev, item.title])}
                              className={`flex items-center justify-between px-4 py-4 rounded-xl cursor-pointer transition ${parentActive ? "bg-orange-50 text-orange-700 border border-orange-200" : "text-gray-700 hover:bg-orange-50"}`}
                            >
                              <div className="flex items-center gap-4">
                                {item.icon}
                                <span className="font-medium">{item.title}</span>
                              </div>
                              <ChevronDown size={20} className={`transition-transform duration-300 ${openMenus.includes(item.title) ? "rotate-180" : ""}`} />
                            </div>

                            <AnimatePresence>
                              {openMenus.includes(item.title) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: "easeInOut" }}
                                  className="ml-12 mt-2 space-y-1 overflow-hidden"
                                >
                                  {item.children.filter(visibleFor).map((child) => (
                                    <Link
                                      key={child.title}
                                      href={child.path}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setMoreModalOpen(false);
                                        if (!isActive(child.path)) {
                                          setOptimisticPath(child.path);
                                          startNavigating();
                                          router.push(child.path);
                                        }
                                      }}
                                      className={`block px-4 py-3 text-sm rounded-lg transition ${isActive(child.path) ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                                    >
                                      {child.title}
                                    </Link>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
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

      {/* DESKTOP VIEW */}
      <aside className={`hidden md:flex fixed inset-y-0 left-0 z-30 bg-white border-r transition-all duration-300 ease-in-out flex-col ${expanded ? "w-[280px]" : "w-[72px]"}`}>
        <div className="flex shrink-0 items-center px-4 h-16 border-b overflow-hidden">
          <div className={`flex items-center transition-all duration-300 ease-in-out ${expanded ? "w-full justify-between" : "w-full justify-center"}`}>
            <img
              src={isDarkMode ? "/images/Invexix Logo-Dark Mode.png" : "/images/Invexix Logo-Light Mode.png"}
              alt="Invexis"
              className={expanded ? "h-8 w-auto object-contain animate-in fade-in slide-in-from-left-2 duration-300" : "h-8 w-8 object-contain"}
            />
            {expanded && (
              <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
                <Menu size={22} />
              </button>
            )}
          </div>
        </div>

        <nav className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-4 space-y-6 custom-scrollbar ${expanded ? "px-3" : "px-2"}`}>
          <section>
            <h3 className={`text-xs font-semibold text-gray-500 uppercase mb-4 px-3 transition-opacity duration-300 whitespace-nowrap ${expanded ? "opacity-100" : "opacity-0"}`}>
              {t("sidebar.overview")}
            </h3>
            {navItems.slice(0, 3).filter(visibleFor).map((item) => (
              <div key={item.title} onMouseEnter={(e) => handleHoverEnter(e, item)} onMouseLeave={handleHoverLeave}>
                <Link
                  href={item.path}
                  id={item.id}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isActive(item.path)) {
                      setOptimisticPath(item.path);
                      startNavigating();
                      router.push(item.path);
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition ${isActive(item.path) ? "bg-orange-100 font-bold border-l-4 border-orange-500 text-orange-500" : "text-gray-700 hover:bg-orange-50"}`}
                >
                  <div className="flex items-center justify-center shrink-0 w-6">{item.icon}</div>
                  <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${expanded ? "opacity-100 w-auto ml-1" : "opacity-0 w-0 ml-0"}`}>
                    {item.title}
                  </span>
                </Link>
              </div>
            ))}
          </section>

          <section>
            <h3 className={`text-xs font-semibold text-gray-500 uppercase mb-3 px-3 transition-opacity duration-300 whitespace-nowrap ${expanded ? "opacity-100" : "opacity-0"}`}>
              {t("sidebar.management")}
            </h3>
            {navItems.slice(3).filter(visibleFor).map((item) => (
              <div key={item.title} onMouseEnter={(e) => handleHoverEnter(e, item)} onMouseLeave={handleHoverLeave}>
                {!item.children ? (
                  <Link
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isActive(item.path)) {
                        setOptimisticPath(item.path);
                        startNavigating();
                        router.push(item.path);
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition ${isActive(item.path) ? "bg-orange-100 font-bold border-l-4 border-orange-500 text-orange-500" : "text-gray-700 hover:bg-orange-50"}`}
                  >
                    <div className="flex items-center justify-center shrink-0 w-6">{item.icon}</div>
                    <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${expanded ? "opacity-100 w-auto ml-1" : "opacity-0 w-0 ml-0"}`}>
                      {item.title}
                    </span>
                  </Link>
                ) : (
                  <>
                    <div
                      onClick={(e) => {
                        if (expanded) {
                          setOpenMenus(prev => prev.includes(item.title) ? prev.filter(x => x !== item.title) : [...prev, item.title]);
                        } else {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoverItem(item);
                          setHoverPosition({ top: rect.top });
                        }
                      }}
                      className={`flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition ${item.children.some(c => isActive(c.path)) ? "bg-orange-100 font-bold border-l-4 border-orange-500 text-orange-500" : "text-gray-700 hover:bg-orange-50"}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex items-center justify-center shrink-0 w-6">{item.icon}</div>
                        <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${expanded ? "opacity-100 w-auto ml-1" : "opacity-0 w-0 ml-0"}`}>
                          {item.title}
                        </span>
                      </div>
                      <ChevronDown size={18} className={`transition-all duration-300 ${expanded ? "opacity-100" : "opacity-0"} ${openMenus.includes(item.title) ? "rotate-180" : ""}`} />
                    </div>

                    <AnimatePresence>
                      {expanded && openMenus.includes(item.title) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="ml-10 mt-1 space-y-1 overflow-hidden"
                        >
                          {item.children.filter(visibleFor).map((child) => (
                            <Link
                              key={child.title}
                              href={child.path}
                              onClick={(e) => {
                                e.preventDefault();
                                if (!isActive(child.path)) {
                                  setOptimisticPath(child.path);
                                  startNavigating();
                                  router.push(child.path);
                                }
                              }}
                              className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200 ${isActive(child.path) ? "font-bold text-orange-500 bg-orange-50/50" : "text-gray-600 hover:text-orange-500 hover:bg-gray-50"}`}
                            >
                              {child.title}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            ))}
          </section>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition ${expanded ? "justify-start" : "justify-center"}`}
          >
            <LogOut size={22} />
            {expanded && <span className="font-medium">{t("sidebar.logout")}</span>}
          </button>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="absolute bottom-[100px] right-0 translate-x-1/2 z-40 p-2 bg-white border border-gray-200 text-gray-500 rounded-full shadow-md hover:bg-gray-50 transition-all active:scale-95"
          aria-label={expanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-90" : "-rotate-90"}`} />
        </button>
      </aside>

      {/* HOVER MENU PORTAL */}
      {hoverItem && mounted && createPortal(
        <div
          style={{ top: hoverPosition.top, left: 72 }}
          className="fixed w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-left-2"
          onMouseEnter={cleanTimeout}
          onMouseLeave={handleHoverLeave}
        >
          <div className="px-4 py-2 border-b font-bold text-sm text-gray-900 flex items-center justify-between">
            {hoverItem.title}
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          </div>
          <div className="py-2 px-2 space-y-1">
            {hoverItem.children ? (
              hoverItem.children.filter(visibleFor).map((child) => (
                <Link
                  key={child.title}
                  href={child.path}
                  onClick={(e) => {
                    e.preventDefault();
                    setHoverItem(null);
                    if (!isActive(child.path)) {
                      setOptimisticPath(child.path);
                      startNavigating();
                      router.push(child.path);
                    }
                  }}
                  className={`block px-3 py-2 text-sm rounded-lg transition ${isActive(child.path) ? "bg-orange-50 text-orange-600 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                >
                  {child.title}
                </Link>
              ))
            ) : (
              <Link
                href={hoverItem.path}
                onClick={(e) => {
                  e.preventDefault();
                  setHoverItem(null);
                  if (!isActive(hoverItem.path)) {
                    setOptimisticPath(hoverItem.path);
                    startNavigating();
                    router.push(hoverItem.path);
                  }
                }}
                className={`block px-3 py-2 text-sm rounded-lg transition ${isActive(hoverItem.path) ? "bg-orange-50 text-orange-600 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
              >
                {t("common.open")}
              </Link>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

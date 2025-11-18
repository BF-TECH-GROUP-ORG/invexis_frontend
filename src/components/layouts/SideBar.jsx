"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl"
import {
  LayoutDashboard,
  ShoppingBag,
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  FileSpreadsheet,
  Briefcase,
  Menu,
  ChevronDown,
  AlertCircle
} from "lucide-react";

const navItems = [
  { title: "Dashboard", icon: <LayoutDashboard size={22} />, path: "/inventory" },
  { title: "Sales", icon: <ShoppingBag size={22} />, path: "/inventory/sales" },
  { title: "Analytics", icon: <BarChart3 size={22} />, path: "/inventory/analytics" },
  { title: "Shops", icon: <Users size={22} />, path: "/inventory/companies" },
  { title: "Billing & Payments", icon: <Package size={22} />, path: "/inventory/billing" },
  { title: "Reports", icon: <FileSpreadsheet size={22} />, path: "/inventory/reports" },

  {
    title: "Workers",
    icon: <Users size={22} />,
    children: [
      { title: "List", path: "/inventory/workers/list" },
      { title: "Profile", path: "/inventory/users/profile" }
    ],
  },
  {
    title: "Inventory",
    icon: <Package size={22} />,
    children: [
      { title: "List", path: "/inventory/products/list" },
      { title: "Details", path: "/inventory/products/details" }
    ],
  },
    {
    title: "Sales",
    icon: <ShoppingBag size={22} />,
    children: [
      { title: "List", path: "/inventory/sales" },
      { title: "Details", path: "/inventory/blog/post" }
    ],
  },
    {
    title: "Purchase",
    icon: <Briefcase size={22} />,
    children: [
      { title: "List", path: "/inventory/audit/list" },
      { title: "Details", path: "/inventory/audit/details" }
    ],
  },
    {
    title: "Ecommerce",
    icon: <ShoppingCart size={22} />,
    children: [
      { title: "Orders", path: "/inventory/orders/list" },
      { title: "Products", path: "/inventory/products" }
    ],
  },
  {
    title: "Documents",
    icon: <FileSpreadsheet size={22} />,
    children: [
      { title: "Invoice", path: "/inventory/invoices/list" },
      { title: "PaymentHistory", path: "/inventory/invoices/details" }
    ],
  },

  {
    title: "Announcements",
    icon: <AlertCircle size={22} />,
    children: [
      { title: "List", path: "/inventory/announcements/list" },
      { title: "Details", path: "/inventory/announcements/details" }
    ],
  },
];

export default function SideBar({ expanded: controlledExpanded, setExpanded: setControlledExpanded }) {
  const isControlled =
    typeof controlledExpanded === "boolean" && typeof setControlledExpanded === "function";

  const [expandedInternal, setExpandedInternal] = useState(true);
  const [openMenus, setOpenMenus] = useState([]);
  const [hoverMenu, setHoverMenu] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0 });

  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    if (!isControlled) {
      const saved = localStorage.getItem("sidebar-expanded");
      setExpandedInternal(saved === null ? true : saved === "true");
    }
  }, [isControlled]);

  const expanded = isControlled ? controlledExpanded : expandedInternal;
  const setExpanded = (val) => {
    if (isControlled) setControlledExpanded(val);
    else {
      setExpandedInternal(val);
      localStorage.setItem("sidebar-expanded", String(val));
    }
  };

  const toggleMenu = (title) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleHoverEnter = (e, item) => {
    if (!expanded && item.children) {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoverMenu(item.title);
      setHoverPosition({ top: rect.top });
    }
  };

  const handleHoverLeave = () => {
    if (!expanded) {
      setHoverMenu(null);
    }
  };

  return (
    <>
      <aside
        className={`${
          expanded ? "w-64" : "w-16"
        } h-screen bg-white border-r flex flex-col fixed top-0 left-0 overflow-y-auto transition-[width] duration-400 ease-in-out scrollbar-thin scrollbar-thumb-gray-300 z-30`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center gap-3">
            <button
              aria-label="toggle sidebar"
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded text-gray-900 hover:bg-gray-100 hover:text-gray-900 transition-transform duration-200 active:scale-95"
            >
              <Menu size={22} />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expanded
                  ? "opacity-100 translate-x-0 w-auto"
                  : "opacity-0 -translate-x-4 w-0"
              }`}
            >
              <span className="font-bold text-lg text-gray-950 select-none whitespace-nowrap">
                INVEX<span className="text-orange-500 font-extrabold">iS</span>
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 text-gray-900">
          <h3
            className={`text-xs font-semibold text-gray-400 px-3 mb-2 transition-opacity duration-300 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            OVERVIEW
          </h3>
          {navItems.slice(0, 6).map((item) => (
            <div className="p-0.5" key={item.title}>
              <Link
                href={`/${locale}${item.path}`}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                  pathname === item.path
                    ? "bg-orange-500 text-white font-semibold"
                    : "hover:bg-orange-300/50"
                }`}
              >
                {item.icon}
                <span
                  className={`transition-all duration-300 ease-in-out ${
                    expanded
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4 w-0 hidden"
                  }`}
                >
                  {item.title}
                </span>
              </Link>
            </div>
          ))}

          <h3
            className={`text-xs font-semibold text-gray-400 px-2 mt-4 mb-2 transition-opacity duration-300 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            MANAGEMENT
          </h3>

          {navItems.slice(6).map((item) => (
            <div
              key={item.title}
              className="relative"
              onMouseEnter={(e) => handleHoverEnter(e, item)}
              onMouseLeave={handleHoverLeave}
            >
              <div
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-orange-500 hover:text-white cursor-pointer transition-colors duration-200"
                onClick={() => expanded && item.children && toggleMenu(item.title)}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span
                    className={`transition-all duration-300 ease-in-out ${
                      expanded
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4 w-0 hidden"
                    }`}
                  >
                    {item.title}
                  </span>
                </div>
                {item.children && expanded && (
                  <div
                    className={`transform transition-transform duration-300 ${
                      openMenus.includes(item.title) ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <ChevronDown size={20} />
                  </div>
                )}
              </div>

              {/* Submenu - Expanded Sidebar */}
              {item.children && openMenus.includes(item.title) && expanded && (
                <div className="ml-8 mt-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
                  {item.children.map((child) => (
                    <Link
                      key={child.title}
                      href={`/${locale}${child.path}`}
                      className={`text-left px-3 py-1 text-sm rounded cursor-pointer transition-colors duration-200 ${
                        pathname === child.path
                          ? "bg-orange-100 text-orange-600 font-semibold"
                          : "text-gray-400 hover:bg-orange-500 hover:text-white"
                      }`}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Collapsed Sidebar Hover Menu (Portal) */}
      {hoverMenu &&
        !expanded &&
        createPortal(
          <div
            style={{ position: "fixed", top: hoverPosition.top, left: "80px" }}
            className="w-44 bg-white border rounded-lg py-2 z-50 animate-fade-in"
          >
            <div className="px-3 pb-2 border-b">
              <div className="text-sm font-bold text-gray-700">{hoverMenu}</div>
            </div>
            <div className="flex flex-col mt-2">
              {navItems
                .find((n) => n.title === hoverMenu)
                ?.children?.map((child) => (
                  <Link
                    key={child.title}
                    href={child.path}
                    className={`text-left px-3 py-2 text-sm transition-colors duration-200 w-full ${
                      pathname === child.path
                        ? "bg-orange-100 text-orange-600 font-semibold"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
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

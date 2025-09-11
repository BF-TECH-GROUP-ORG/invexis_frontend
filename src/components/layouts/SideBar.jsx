"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  Receipt,
  FileSpreadsheet,
  Briefcase,
  Map,
  Menu,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { title: "App", icon: <LayoutDashboard size={22} /> },
  { title: "Ecommerce", icon: <ShoppingBag size={22} /> },
  { title: "Analytics", icon: <BarChart3 size={22} /> },
  { title: "Banking", icon: <Users size={22} /> },
  { title: "Booking", icon: <Package size={22} /> },
  { title: "File", icon: <FileSpreadsheet size={22} /> },
  { title: "Course", icon: <Briefcase size={22} /> },

  {
    title: "User",
    icon: <Users size={22} />,
    children: [{ title: "List" }, { title: "Profile" }],
  },
  {
    title: "Product",
    icon: <Package size={22} />,
    children: [{ title: "List" }, { title: "Details" }],
  },
  {
    title: "Order",
    icon: <ShoppingCart size={22} />,
    children: [{ title: "List" }, { title: "Details" }],
  },
  {
    title: "Invoice",
    icon: <Receipt size={22} />,
    children: [{ title: "List" }, { title: "Details" }],
  },
  {
    title: "Blog",
    icon: <FileSpreadsheet size={22} />,
    children: [{ title: "List" }, { title: "Post" }],
  },
  {
    title: "Job",
    icon: <Briefcase size={22} />,
    children: [{ title: "List" }, { title: "Details" }],
  },
  {
    title: "Tour",
    icon: <Map size={22} />,
    children: [{ title: "List" }, { title: "Details" }],
  },
];

export default function SideBar({ expanded: controlledExpanded, setExpanded: setControlledExpanded }) {
  const isControlled =
    typeof controlledExpanded === "boolean" && typeof setControlledExpanded === "function";

  const [expandedInternal, setExpandedInternal] = useState(true);
  const [openMenus, setOpenMenus] = useState([]);
  const [active, setActive] = useState("");
  const [hoverMenu, setHoverMenu] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0 });

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
          expanded ? "w-64" : "w-20"
        } h-screen bg-white border-r flex flex-col fixed top-0 left-0 overflow-y-auto transition-[width] duration-400 ease-in-out scrollbar-thin scrollbar-thumb-gray-300 z-30`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center gap-3">
            <button
              aria-label="toggle sidebar"
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded hover:bg-gray-100 transition-transform duration-200 active:scale-95"
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
              <span className="font-bold text-lg select-none whitespace-nowrap">
                STOCK <span className="text-orange-600 font-extrabold">IT</span>
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 text-gray-700">
          <h3
            className={`text-xs font-semibold text-gray-400 px-2 mb-2 transition-opacity duration-300 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            OVERVIEW
          </h3>

          {navItems.slice(0, 7).map((item) => (
            <div
              key={item.title}
              onClick={() => setActive(item.title)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                active === item.title
                  ? "bg-orange-100 text-orange-600 font-semibold"
                  : "hover:bg-gray-100"
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
            </div>
          ))}

          <h3
            className={`text-xs font-semibold text-gray-400 px-2 mt-4 mb-2 transition-opacity duration-300 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            MANAGEMENT
          </h3>

          {navItems.slice(7).map((item) => (
            <div
              key={item.title}
              className="relative"
              onMouseEnter={(e) => handleHoverEnter(e, item)}
              onMouseLeave={handleHoverLeave}
            >
              <div
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200"
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
                    <button
                      key={child.title}
                      onClick={() => setActive(child.title)}
                      className={`text-left px-3 py-1 text-sm rounded cursor-pointer transition-colors duration-200 ${
                        active === child.title
                          ? "bg-orange-100 text-orange-600 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {child.title}
                    </button>
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
            className="w-44 bg-white shadow-lg border rounded-lg py-2 z-50 animate-fade-in"
          >
            <div className="px-3 pb-2 border-b">
              <div className="text-sm font-medium text-gray-700">{hoverMenu}</div>
            </div>
            <div className="flex flex-col mt-2">
              {navItems
                .find((n) => n.title === hoverMenu)
                ?.children?.map((child) => (
                  <button
                    key={child.title}
                    onClick={() => setActive(child.title)}
                    className={`text-left px-3 py-2 text-sm transition-colors duration-200 w-full ${
                      active === child.title
                        ? "bg-orange-100 text-orange-600 font-semibold"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {child.title}
                  </button>
                ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

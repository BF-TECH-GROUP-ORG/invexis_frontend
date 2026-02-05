"use client";

import { useState, useCallback, useEffect } from "react";
import SideBar from "./SideBar";
import TopNavBar from "./NavBar";

export default function DashboardLayout({ children, expanded: controlledExpanded, setExpanded: controlledSetExpanded }) {
  const [internalExpanded, setInternalExpanded] = useState(true);

  // Use controlled state if provided, otherwise internal
  const isControlled = typeof controlledExpanded !== 'undefined';
  const expanded = isControlled ? controlledExpanded : internalExpanded;
  const setExpanded = isControlled ? controlledSetExpanded : setInternalExpanded;

  // Only use internal storage logic if NOT controlled (fallback)
  useEffect(() => {
    if (isControlled) return;
    const stored = localStorage.getItem("sidebar-expanded");
    if (stored !== null) {
      setInternalExpanded(stored === "true");
    }
  }, [isControlled]);

  const handleSetExpanded = useCallback((value) => {
    const newValue = typeof value === 'function' ? value(expanded) : value;
    setExpanded(newValue);
    if (!isControlled) {
      localStorage.setItem("sidebar-expanded", String(newValue));
    }
  }, [expanded, setExpanded, isControlled]);

  return (
    <div className="min-h-screen  dark:bg-gray-900 overflow-x-hidden flex flex-col">
      <SideBar
        expanded={expanded}
        setExpanded={handleSetExpanded}
      />
      <TopNavBar expanded={expanded} />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 flex-1 pt-20 px-4 md:px-8 pb-24 md:pb-8 min-h-screen ${expanded ? "ml-0 md:ml-[280px]" : "ml-0 md:ml-[72px]"
          }`}
      >
        {children}
      </main>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import SideBar from "./SideBar";
import TopNavBar from "./NavBar";

export default function DashboardLayout({ children }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden flex flex-col">
      <SideBar
        expanded={expanded}
        setExpanded={setExpanded}
      />
      <TopNavBar expanded={expanded} />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 flex-1 pt-20 px-4 md:px-8 pb-24 md:pb-8 min-h-screen ${expanded ? "ml-0 md:ml-64" : "ml-0 md:ml-20"
          }`}
      >
        {children}
      </main>
    </div>
  );
}

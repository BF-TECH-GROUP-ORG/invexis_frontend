"use client";

import { useState, useCallback } from "react";
import SideBar from "./SideBar";
import TopNavBar from "./NavBar";

export default function DashboardLayout({ children }) {
  const [expanded, setExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const handleMobileChange = useCallback((mobile) => {
    setIsMobile(mobile);
  }, []);

  return (
    <div className="">
      <SideBar
        expanded={expanded}
        setExpanded={setExpanded}
        onMobileChange={handleMobileChange}
      />
      <TopNavBar expanded={expanded} isMobile={isMobile} />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 flex-1 pt-20 ${
          isMobile
            ? "ml-0 pb-24" // No left margin on mobile, add bottom padding for bottom nav
            : expanded
            ? "ml-64"
            : "ml-20"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

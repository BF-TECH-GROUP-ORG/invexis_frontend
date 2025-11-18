"use client";

import { useState } from "react";
import SideBar from "./SideBar";
import TopNavBar from "./NavBar";

export default function DashboardLayout({ children }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="">
      <SideBar expanded={expanded} setExpanded={setExpanded} />
      <TopNavBar expanded={expanded} />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 flex-1 min-h-screen ${
          expanded ? "ml-64" : "ml-20"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import SideBar from "@/components/layouts/SideBar";
import NavBar from "@/components/layouts/NavBar";

export default function Layouts({ children }) {
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-expanded");
    if (saved !== null) setExpanded(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", String(expanded));
  }, [expanded]);

  const sidebarRem = expanded ? 16 : 5;

  return (
    <div className="flex h-screen w-full">
      <SideBar expanded={expanded} setExpanded={setExpanded} />
      <div className="flex-1 flex flex-col transition-all duration-300">
        <div className="sticky top-0 z-20 ">
          <NavBar expanded={expanded} />
        </div>

        {/*Dashboard Contents will be displayed here */}
        <main
          className="flex-1 overflow-auto bg-gray-50 transition-all duration-300"
          style={{
            marginLeft: `${sidebarRem}rem`,
            width: `calc(100% - ${sidebarRem}rem)`,
          }}
        >
          <div className="p-6">
            {children ?? <div className="text-gray-700">Dashboard content</div>}
          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import { useState } from "react";
import TopNavBar from "./NavBar";
import SideBar from "./SideBar";

export default function Layout({ children }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SideBar 
        expanded={sidebarExpanded} 
        setExpanded={setSidebarExpanded} 
      />
      
      {/* Main Content Area */}
      <div 
        className={`transition-all duration-400 ease-in-out ${
          sidebarExpanded ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Top Navigation Bar */}
        <TopNavBar />
        
        {/* Page Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
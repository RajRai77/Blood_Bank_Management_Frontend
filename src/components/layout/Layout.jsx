import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Droplet } from "lucide-react"; // Import Menu icon
import Sidebar from "./Sidebar";
import { theme } from "../../styles/theme";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background }}>
      
      {/* 1. Mobile Header (Visible only on small screens via CSS) */}
      <div className="mobile-header">
         <button 
            onClick={() => setIsSidebarOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: theme.colors.textPrimary }}
         >
            <Menu size={28} />
         </button>
         
         <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "32px", height: "32px", background: "#FEE2E2", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: theme.colors.primary }}>
               <Droplet size={18} fill="currentColor"/>
            </div>
            <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>eBloodCare</span>
         </div>
         
         <div style={{ width: "28px" }}></div> {/* Spacer to center logo */}
      </div>

      {/* 2. Overlay (Closes sidebar when clicked) */}
      {isSidebarOpen && (
        <div 
            className="sidebar-overlay" 
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 3. The Sidebar */}
      <Sidebar 
         isOpen={isSidebarOpen} 
         onClose={() => setIsSidebarOpen(false)} 
      />

      {/* 4. Main Content Area */}
      <div className="main-content" style={{ padding: "32px", overflowY: "auto" }}>
        <Outlet />
      </div>

    </div>
  );
};

export default Layout;
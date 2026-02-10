import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Droplet, 
  Users, 
  FileText, 
  Truck, 
  Calendar, 
  Activity,
  LogOut,
  X 
} from "lucide-react";
import { theme } from "../../styles/theme";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { path: "/inventory", icon: <Droplet size={20} />, label: "Inventory" },
    { path: "/donors", icon: <Users size={20} />, label: "Donors" },
    { path: "/requests", icon: <FileText size={20} />, label: "Requests" },
    { path: "/logistics", icon: <Truck size={20} />, label: "Logistics" },
    { path: "/camps", icon: <Calendar size={20} />, label: "Camps" },
    { path: "/lab", icon: <Activity size={20} />, label: "Lab Manager" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div 
      className={`sidebar-container ${isOpen ? 'open' : ''}`}
      style={{
        width: "260px", 
        height: "100vh", 
        backgroundColor: theme.colors.surface, 
        borderRight: `1px solid ${theme.colors.border}`,
        position: "fixed",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column",
        zIndex: 1000 // Higher than everything
      }}
    >
      {/* 1. Logo Section */}
      <div style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", 
            backgroundColor: "#FEE2E2", 
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: theme.colors.primary
          }}>
            <Droplet fill="currentColor" size={24} />
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: "700", color: theme.colors.textPrimary }}>
            eBloodCare
          </h1>
        </div>
        
        {/* Close Button (Mobile Only) */}
        <button 
            onClick={onClose}
            className="mobile-only" // We can hide this via CSS on desktop if needed, but the sidebar is fixed there anyway
            style={{ 
                background: "none", border: "none", cursor: "pointer", 
                display: window.innerWidth > 768 ? "none" : "block" // Simple inline check
            }}
        >
            <X size={24} color={theme.colors.textSecondary} />
        </button>
      </div>

      {/* 2. Navigation Menu */}
      <nav style={{ flex: 1, padding: "0 16px", marginTop: "20px" }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              onClick={onClose} // Auto-close sidebar on mobile when link is clicked
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "8px",
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: "500",
                backgroundColor: isActive ? theme.colors.primary : "transparent",
                color: isActive ? "#FFF" : theme.colors.textSecondary,
                transition: "all 0.2s ease"
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 3. User Profile / Logout */}
      <div style={{ padding: "20px", borderTop: `1px solid ${theme.colors.border}` }}>
         <button 
           onClick={handleLogout}
           style={{
             display: "flex", alignItems: "center", gap: "10px",
             width: "100%", border: "none", background: "transparent",
             color: theme.colors.textSecondary, cursor: "pointer",
             padding: "8px", borderRadius: "8px"
           }}
         >
           <LogOut size={20} />
           <span>Logout</span>
         </button>
      </div>
    </div>
  );
};

export default Sidebar;
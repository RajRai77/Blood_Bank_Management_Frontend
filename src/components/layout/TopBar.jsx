import React, { useState } from "react";
import { LogOut, ChevronDown, Bell, Search } from "lucide-react";
import { theme } from "../../styles/theme";
import { useNavigate } from "react-router-dom";

const TopBar = ({ title }) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  
  // DIRECT ACCESS: Get User Data from Local Storage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    
    // Redirect to login
    navigate("/login");
  };

  return (
    <div style={{ 
      display: "flex", justifyContent: "space-between", alignItems: "center", 
      padding: "20px 30px", background: "white", borderBottom: "1px solid #E5E7EB",
      marginBottom: "24px"
    }}>
      {/* LEFT: Title & Welcome */}
      <div>
        <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "700", color: "#111827" }}>{title}</h2>
        <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "0.9rem" }}>
          Hello, <span style={{ color: theme.colors.primary, fontWeight: "600" }}>{user?.name || "Admin"}</span> 👋
        </p>
      </div>

      {/* RIGHT: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        
        {/* Search Bar (Visual) */}
        <div style={{ position: "relative", display: "none", alignItems: "center" }}> 
            {/* You can enable display:flex if you want a search bar */}
            <Search size={18} color="#9CA3AF" style={{ position: "absolute", left: 12 }} />
            <input placeholder="Search..." style={{ padding: "10px 10px 10px 36px", borderRadius: "30px", border: "1px solid #E5E7EB", outline: "none", width: "200px" }} />
        </div>

        {/* Notification */}
        <div style={{ position: "relative", cursor: "pointer", padding: "8px", background: "#F3F4F6", borderRadius: "50%" }}>
            <Bell size={20} color="#6B7280" />
            <span style={{ position: "absolute", top: 0, right: 0, width: "10px", height: "10px", background: "#EF4444", borderRadius: "50%", border: "2px solid white" }}></span>
        </div>

        {/* Profile Dropdown */}
        <div style={{ position: "relative" }}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            style={{ 
              display: "flex", alignItems: "center", gap: "12px", 
              background: "white", border: "1px solid #E5E7EB", 
              padding: "6px 8px 6px 6px", borderRadius: "40px", cursor: "pointer",
              transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
          >
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB", fontWeight: "bold", fontSize: "1rem" }}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div style={{ textAlign: "left", marginRight: "4px" }}>
                <span style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#374151" }}>{user?.name || "User"}</span>
                <span style={{ display: "block", fontSize: "0.7rem", color: "#9CA3AF", textTransform: "capitalize", fontWeight: "500" }}>{user?.role || "Staff"}</span>
            </div>
            <ChevronDown size={16} color="#9CA3AF" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div style={{ 
              position: "absolute", top: "120%", right: 0, width: "220px", 
              background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", 
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", zIndex: 100, overflow: "hidden",
              animation: "fadeIn 0.2s ease-in-out"
            }}>
                <div style={{ padding: "16px", borderBottom: "1px solid #F3F4F6", background: "#F9FAFB" }}>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280", fontWeight: "600", textTransform: "uppercase" }}>Signed in as</p>
                    <p style={{ margin: "4px 0 0", fontWeight: "600", fontSize: "0.9rem", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  style={{ 
                    width: "100%", padding: "14px", display: "flex", alignItems: "center", gap: "10px", 
                    background: "white", border: "none", color: "#EF4444", fontWeight: "600", cursor: "pointer",
                    textAlign: "left", fontSize: "0.9rem"
                  }}
                  onMouseOver={(e) => e.target.style.background = "#FEF2F2"}
                  onMouseOut={(e) => e.target.style.background = "white"}
                >
                   <LogOut size={18} /> Sign Out
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
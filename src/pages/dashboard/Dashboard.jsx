import React, { useState, useEffect } from "react";
import { 
  Droplet, 
  Users, 
  AlertTriangle, 
  Activity, 
  ArrowRight, 
  Calendar,
  RefreshCw
} from "lucide-react";
import { theme } from "../../styles/theme";
import { getStats, getRecentActivity } from "../../services/inventory.service";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define all blood groups to ensure we show 0 if no stock
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Fetch Data from Backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        getStats(),
        getRecentActivity()
      ]);

      if(statsRes.data?.data) setStats(statsRes.data.data);
      if(activityRes.data?.data) setRecentActivity(activityRes.data.data);
      
    } catch (error) {
      console.error("Dashboard Load Error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper: Get count for a specific group from the API response
  const getGroupCount = (group) => {
    const found = stats.find(s => s._id === group);
    return found ? found.totalUnits : 0;
  };

  // Helper: Get Status Color based on quantity
  const getStockStatus = (count) => {
    if (count < 5) return { label: "CRITICAL", color: theme.colors.status.critical, bg: theme.colors.status.criticalBg };
    if (count < 15) return { label: "LOW", color: theme.colors.status.warning, bg: theme.colors.status.warningBg };
    return { label: "GOOD", color: theme.colors.status.safe, bg: theme.colors.status.safeBg };
  };

  // Calculate Totals
  const totalUnits = stats.reduce((acc, curr) => acc + curr.totalUnits, 0);

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading Dashboard...</div>;

  return (
    <div className="page-container">
      {/* 1. Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "700", color: theme.colors.textPrimary }}>Global Dashboard</h1>
          <p style={{ color: theme.colors.textSecondary }}>Real-time inventory and operational status.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          style={{ 
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 16px", backgroundColor: theme.colors.surface, 
            border: `1px solid ${theme.colors.border}`, borderRadius: "8px", cursor: "pointer"
          }}
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {/* 2. Top KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        {/* Total Units Card */}
        <div style={{ padding: "24px", backgroundColor: theme.colors.surface, borderRadius: "12px", boxShadow: theme.shadows.card }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <p style={{ fontSize: "0.875rem", color: theme.colors.textSecondary, marginBottom: "8px" }}>Total Units Available</p>
              <h2 style={{ fontSize: "2rem", fontWeight: "700", color: theme.colors.textPrimary }}>{totalUnits}</h2>
            </div>
            <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "#FEE2E2", color: theme.colors.primary }}>
              <Droplet size={24} />
            </div>
          </div>
        </div>

        {/* Camp Alert Card (New Feature) */}
        <div style={{ padding: "24px", backgroundColor: theme.colors.surface, borderRadius: "12px", boxShadow: theme.shadows.card, borderLeft: `4px solid ${theme.colors.accent}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <p style={{ fontSize: "0.875rem", color: theme.colors.textSecondary, marginBottom: "8px" }}>Next Donation Camp</p>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: theme.colors.textPrimary }}>City College Drive</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", color: theme.colors.accent, fontSize: "0.9rem" }}>
                <Calendar size={16} /> Tomorrow, 9:00 AM
              </div>
            </div>
          </div>
        </div>

        {/* Critical Alerts Card */}
        <div style={{ padding: "24px", backgroundColor: theme.colors.surface, borderRadius: "12px", boxShadow: theme.shadows.card }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <p style={{ fontSize: "0.875rem", color: theme.colors.textSecondary, marginBottom: "8px" }}>Critical Alerts</p>
              <h2 style={{ fontSize: "2rem", fontWeight: "700", color: theme.colors.status.critical }}>3</h2>
            </div>
            <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: theme.colors.status.criticalBg, color: theme.colors.status.critical }}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        
        {/* Left Column: Blood Stock Grid */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Blood Stock Levels</h3>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            {bloodGroups.map((group) => {
              const count = getGroupCount(group);
              const status = getStockStatus(count);
              
              return (
                <div key={group} style={{ 
                  padding: "20px", backgroundColor: theme.colors.surface, 
                  borderRadius: "12px", boxShadow: theme.shadows.card,
                  borderBottom: `4px solid ${status.color}`,
                  position: "relative",
                  overflow: "hidden"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: theme.colors.textPrimary }}>{group}</h2>
                    <span style={{ 
                      fontSize: "0.7rem", fontWeight: "700", 
                      padding: "4px 8px", borderRadius: "99px",
                      backgroundColor: status.bg, color: status.color 
                    }}>
                      {status.label}
                    </span>
                  </div>
                  <p style={{ fontSize: "1.25rem", fontWeight: "600", color: theme.colors.textPrimary }}>
                    {count} <span style={{ fontSize: "0.8rem", color: theme.colors.textSecondary, fontWeight: "400" }}>units</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div style={{ backgroundColor: theme.colors.surface, padding: "24px", borderRadius: "12px", boxShadow: theme.shadows.card, height: "fit-content" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "20px" }}>Recent Activity</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {recentActivity.length > 0 ? recentActivity.map((item, index) => (
              <div key={index} style={{ display: "flex", gap: "12px", alignItems: "start" }}>
                <div style={{ 
                  width: "32px", height: "32px", borderRadius: "50%", 
                  backgroundColor: theme.colors.status.safeBg, color: theme.colors.status.safe,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <Activity size={16} />
                </div>
                <div>
                  <p style={{ fontSize: "0.9rem", fontWeight: "500", color: theme.colors.textPrimary }}>
                    Unit {item.unitId} Added
                  </p>
                  <p style={{ fontSize: "0.8rem", color: theme.colors.textSecondary }}>
                    {item.bloodGroup} • {item.location}
                  </p>
                </div>
              </div>
            )) : (
              <p style={{ color: theme.colors.textSecondary, fontSize: "0.9rem" }}>No recent activity found.</p>
            )}
            
            <button style={{ 
              marginTop: "10px", width: "100%", padding: "12px", 
              border: `1px solid ${theme.colors.border}`, borderRadius: "8px",
              backgroundColor: "transparent", color: theme.colors.textSecondary,
              cursor: "pointer", fontSize: "0.9rem"
            }}>
              View Full History
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
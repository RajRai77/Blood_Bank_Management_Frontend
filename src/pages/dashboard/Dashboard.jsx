import React, { useState, useEffect } from "react";
import { 
  Droplet, 
  Users, 
  AlertTriangle, 
  Activity, 
  Calendar,
  RefreshCw,
  Layers,
  Thermometer,
  Zap
} from "lucide-react";
import { theme } from "../../styles/theme";
import API from "../../services/api"; // Direct API access for full calculation
import toast from "react-hot-toast";
import TopBar from "../../components/layout/TopBar";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  
  // Define blood groups
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // --- 1. SMART DATA FETCHING ---
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // We fetch ALL available inventory to calculate exact stats client-side
      // This ensures our "Volume in ml" and "Component Counts" are 100% accurate
      const [invRes, activityRes] = await Promise.all([
        API.get("/inventory?status=available"), // Get all available units
        API.get("/inventory/recent")            // Get logs
      ]);

      if (invRes.data?.data) setInventoryData(invRes.data.data);
      if (activityRes.data?.data) setRecentActivity(activityRes.data.data);
      
    } catch (error) {
      console.error("Dashboard Load Error:", error);
      toast.error("Failed to load live data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- 2. ADVANCED CALCULATIONS ---
  
  // A. Component Stats (Count & Volume)
  const getComponentStats = (type) => {
    const items = inventoryData.filter(i => i.inventoryType === type);
    const count = items.length;
    const volume = items.reduce((sum, item) => sum + (item.volume || 450), 0);
    return { count, volume };
  };

  const wholeBlood = getComponentStats("Whole Blood");
  const rbc = getComponentStats("Packed Red Cells"); // Matches your backend enum
  const plasma = getComponentStats("Plasma");
  const platelets = getComponentStats("Platelets");

  // B. Group Stats (Total units per group)
  const getGroupCount = (group) => {
    return inventoryData.filter(i => i.bloodGroup === group).length;
  };

  // C. Total System Volume
  const totalVolume = inventoryData.reduce((sum, item) => sum + (item.volume || 450), 0);
  const totalUnits = inventoryData.length;

  // D. Status Color Logic
  const getStockStatus = (count) => {
    if (count < 2) return { label: "CRITICAL", color: theme.colors.status.critical, bg: theme.colors.status.criticalBg };
    if (count < 5) return { label: "LOW", color: theme.colors.status.warning, bg: theme.colors.status.warningBg };
    return { label: "GOOD", color: theme.colors.status.safe, bg: theme.colors.status.safeBg };
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: theme.colors.textSecondary }}>Loading Analytics...</div>;

  return (
    <div className="page-container" style={{ padding: "20px", maxWidth: "1600px", margin: "0 auto" }}>
      
      {/* HEADER */}
     <TopBar title="Dashboard" />

      {/* TOP KPI GRID (Responsive) */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", 
        gap: "20px", 
        marginBottom: "32px" 
      }}>
        
        {/* Card 1: Total Stock */}
        <KpiCard 
          title="Total Inventory" 
          value={totalUnits} 
          unit="Units"
          subValue={`${(totalVolume / 1000).toFixed(1)} Liters Available`}
          icon={<Droplet size={24} />} 
          color={theme.colors.primary}
          bg="#FEE2E2"
        />

        {/* Card 2: Next Camp */}
        <div style={{ 
          padding: "24px", backgroundColor: "white", borderRadius: "16px", 
          boxShadow: theme.shadows.card, borderLeft: `5px solid ${theme.colors.accent}`,
          display: "flex", flexDirection: "column", justifyContent: "center"
        }}>
           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
             <span style={{ fontSize: "0.85rem", color: theme.colors.textSecondary, fontWeight: "600" }}>NEXT DRIVE</span>
             <Calendar size={20} color={theme.colors.accent} />
           </div>
           <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: theme.colors.textPrimary }}>City College</h3>
           <span style={{ color: theme.colors.accent, fontWeight: "600", fontSize: "0.9rem", marginTop: "4px" }}>
             Tomorrow • 9:00 AM
           </span>
        </div>

        {/* Card 3: Critical Alerts */}
        <KpiCard 
          title="Critical Alerts" 
          value="3" 
          unit="Groups Low"
          subValue="Action Required"
          icon={<AlertTriangle size={24} />} 
          color={theme.colors.status.critical}
          bg={theme.colors.status.criticalBg}
        />
      </div>

      {/* COMPONENT BREAKDOWN (New Feature) */}
      <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px", color: theme.colors.textPrimary }}>
        Component Breakdown
      </h3>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "16px", 
        marginBottom: "32px" 
      }}>
        <ComponentCard title="Whole Blood" data={wholeBlood} color="#EF4444" icon={<Droplet size={20}/>} />
        <ComponentCard title="Red Cells (RBC)" data={rbc} color="#B91C1C" icon={<Layers size={20}/>} />
        <ComponentCard title="Plasma" data={plasma} color="#F59E0B" icon={<Zap size={20}/>} />
        <ComponentCard title="Platelets" data={platelets} color="#EAB308" icon={<Thermometer size={20}/>} />
      </div>

      {/* MAIN CONTENT SPLIT (Responsive Flex) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
        
        {/* LEFT: Blood Groups Grid */}
        <div style={{ flex: "2 1 600px" }}> {/* Grows to 2x size, Min width 600px */}
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px" }}>Blood Groups</h3>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", 
            gap: "16px" 
          }}>
            {bloodGroups.map((group) => {
              const count = getGroupCount(group);
              const status = getStockStatus(count);
              return (
                <div key={group} style={{ 
                  padding: "20px", backgroundColor: "white", borderRadius: "12px", 
                  boxShadow: theme.shadows.card, borderTop: `4px solid ${status.color}`,
                  display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"
                }}>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: theme.colors.textPrimary, marginBottom: "4px" }}>
                    {group}
                  </h2>
                  <span style={{ 
                     fontSize: "0.7rem", fontWeight: "700", padding: "4px 8px", 
                     borderRadius: "12px", backgroundColor: status.bg, color: status.color,
                     marginBottom: "12px"
                  }}>
                    {status.label}
                  </span>
                  <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#374151" }}>
                    {count} <span style={{ fontSize: "0.8rem", color: "#6B7280", fontWeight: "400" }}>units</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Recent Activity */}
        <div style={{ flex: "1 1 300px" }}> {/* Grows to 1x size, Min width 300px */}
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px" }}>Recent Activity</h3>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "16px", boxShadow: theme.shadows.card }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {recentActivity.slice(0, 5).map((item, index) => (
                <div key={index} style={{ 
                  display: "flex", gap: "12px", alignItems: "center", 
                  paddingBottom: "12px", borderBottom: index !== 4 ? "1px solid #F3F4F6" : "none" 
                }}>
                  <div style={{ 
                    width: "36px", height: "36px", borderRadius: "10px", 
                    backgroundColor: theme.colors.status.safeBg, color: theme.colors.status.safe,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <Activity size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.9rem", fontWeight: "600", color: theme.colors.textPrimary, margin: 0 }}>
                       Unit {item.unitId}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: theme.colors.textSecondary, margin: 0 }}>
                      {item.inventoryType} • {item.bloodGroup} • <span style={{color: theme.colors.primary}}>{item.volume}ml</span>
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && <p style={{color: "#999", textAlign: "center"}}>No activity yet.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- SUB COMPONENTS FOR CLEANER CODE ---

const KpiCard = ({ title, value, unit, subValue, icon, color, bg }) => (
  <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "16px", boxShadow: theme.shadows.card }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
      <div>
        <p style={{ fontSize: "0.85rem", color: theme.colors.textSecondary, fontWeight: "600", margin: 0 }}>{title.toUpperCase()}</p>
        <h2 style={{ fontSize: "2rem", fontWeight: "700", color: theme.colors.textPrimary, margin: "4px 0" }}>{value}</h2>
        <span style={{ fontSize: "0.9rem", color: color, fontWeight: "600" }}>{unit}</span>
      </div>
      <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: bg, color: color }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize: "0.85rem", color: theme.colors.textSecondary, marginTop: "8px" }}>
      {subValue}
    </div>
  </div>
);

const ComponentCard = ({ title, data, color, icon }) => (
  <div style={{ 
    padding: "20px", backgroundColor: "white", borderRadius: "12px", 
    boxShadow: theme.shadows.card, borderTop: `4px solid ${color}` 
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: color }}>
      {icon}
      <span style={{ fontWeight: "700", fontSize: "0.9rem" }}>{title}</span>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
      <div>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "800", margin: 0 }}>{data.count}</h3>
        <span style={{ fontSize: "0.8rem", color: "#666" }}>units</span>
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ fontSize: "1rem", fontWeight: "600", color: theme.colors.textPrimary, margin: 0 }}>
          {data.volume.toLocaleString()}
        </p>
        <span style={{ fontSize: "0.8rem", color: "#666" }}>total ml</span>
      </div>
    </div>
  </div>
);

export default Dashboard;
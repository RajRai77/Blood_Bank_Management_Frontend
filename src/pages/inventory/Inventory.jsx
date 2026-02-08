import React, { useState, useEffect } from "react";
import { 
  Filter, 
  Plus, 
  Search, 
  MoreVertical, 
  AlertCircle, 
  CheckCircle,
  Beaker
} from "lucide-react";
import { theme } from "../../styles/theme";
import { getRecentActivity } from "../../services/inventory.service"; // We will use a direct fetch here
import API from "../../services/api"; // Direct axios for custom queries
import toast from "react-hot-toast";
import AddStockModal from "../../components/common/AddStockModal";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All"); // "All", "Whole Blood", "Plasma", "RBC"
  const [bloodGroup, setBloodGroup] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch Logic
const fetchInventory = async () => {
    try {
      setLoading(true);
      
      // 1. Build the Query String
      // If filter is "All", send empty string. Otherwise send specific type.
      const typeParam = filter === "All" ? "" : filter;
      
      // 2. Call the API with the Query
      // URL becomes: /inventory/recent?inventoryType=Plasma
      const res = await API.get(`/inventory/recent?inventoryType=${typeParam}`);
      
      setInventory(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    fetchInventory();
  }, [filter]);

  // Helper: Status Badge Logic
  const StatusBadge = ({ isTested, status }) => {
    if (status === "quarantined") {
      return (
        <span className="badge" style={{ backgroundColor: theme.colors.status.criticalBg, color: theme.colors.status.critical, display: "flex", alignItems: "center", gap: "4px" }}>
          <AlertCircle size={12} /> DISCARD
        </span>
      );
    }
    if (isTested) {
      return (
        <span className="badge" style={{ backgroundColor: theme.colors.status.safeBg, color: theme.colors.status.safe, display: "flex", alignItems: "center", gap: "4px" }}>
          <CheckCircle size={12} /> TESTED: SAFE
        </span>
      );
    }
    return (
      <span className="badge" style={{ backgroundColor: theme.colors.status.warningBg, color: "#B45309", display: "flex", alignItems: "center", gap: "4px" }}>
        <Beaker size={12} /> UNTESTED
      </span>
    );
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "700", color: theme.colors.textPrimary }}>Blood Inventory</h1>
          <p style={{ color: theme.colors.textSecondary }}>Manage blood units, monitor expiry, and track lab status.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
           {/* Add Stock Button */}
           <button onClick={() => setShowAddModal(true)} style={{ 
            display: "flex", alignItems: "center", gap: "8px",
            padding: "12px 20px", backgroundColor: theme.colors.primary, 
            color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer"
          }}>
            <Plus size={20} /> Add Stock
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ 
        display: "flex", gap: "16px", padding: "16px", 
        backgroundColor: theme.colors.surface, borderRadius: "12px", 
        boxShadow: theme.shadows.card, marginBottom: "24px", alignItems: "center"
      }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={20} color={theme.colors.textSecondary} style={{ position: "absolute", left: "12px", top: "10px" }} />
          <input 
            type="text" 
            placeholder="Search by Unit ID (e.g. #88291)..." 
            style={{
              width: "100%", padding: "10px 10px 10px 40px",
              border: `1px solid ${theme.colors.border}`, borderRadius: "8px", outline: "none"
            }}
          />
        </div>
        
        <div style={{ display: "flex", gap: "8px" }}>
          {["All", "Whole Blood", "Plasma", "RBC", "Platelets"].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                padding: "8px 16px", borderRadius: "8px", fontSize: "0.9rem", cursor: "pointer",
                border: filter === type ? `1px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
                backgroundColor: filter === type ? "#FEF2F2" : "transparent",
                color: filter === type ? theme.colors.primary : theme.colors.textSecondary,
                fontWeight: filter === type ? "600" : "400"
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {inventory.map((item) => (
          <div key={item._id} style={{ 
            backgroundColor: theme.colors.surface, borderRadius: "12px", 
            boxShadow: theme.shadows.card, padding: "20px", borderTop: `4px solid ${
              item.inventoryType === "Plasma" ? "#FBBF24" : 
              item.inventoryType === "Platelets" ? "#9CA3AF" : theme.colors.primary
            }` 
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: theme.colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {item.inventoryType}
                </span>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: theme.colors.textPrimary }}>
                  {item.bloodGroup}
                </h3>
              </div>
              <StatusBadge isTested={item.isTested} status={item.status} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
              <div>
                <p style={{ fontSize: "0.9rem", fontWeight: "600", color: theme.colors.textPrimary }}>Unit ID: {item.unitId}</p>
                <p style={{ fontSize: "0.8rem", color: theme.colors.textSecondary }}>Loc: {item.location}</p>
                <p style={{ fontSize: "0.8rem", color: theme.colors.textSecondary }}>Exp: {new Date(item.expiryDate).toLocaleDateString()}</p>
              </div>
              
              {/* If Untested, show 'Send to Lab' button */}
              {!item.isTested && (
                <button 
                  onClick={() => window.location.href = "/lab"}
                  style={{ 
                    padding: "6px 12px", fontSize: "0.8rem",
                    backgroundColor: theme.colors.secondary, color: "white",
                    border: "none", borderRadius: "6px", cursor: "pointer"
                  }}
                >
                  Test Now →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {inventory.length === 0 && !loading && (
         <div style={{ textAlign: "center", padding: "40px", color: theme.colors.textSecondary }}>
           No inventory found. Add stock or adjust filters.
         </div>
      )}
      {/* Modal Layer */}
    {showAddModal && (
        <AddStockModal 
        onClose={() => setShowAddModal(false)} 
        onSuccess={fetchInventory} // Reloads data after adding
        />
    )}
    </div>
  );
};

export default Inventory;
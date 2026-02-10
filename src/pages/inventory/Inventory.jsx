import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  AlertCircle, 
  CheckCircle,
  Beaker
} from "lucide-react";
import { theme } from "../../styles/theme";
import API from "../../services/api"; 
import toast from "react-hot-toast";
import AddStockModal from "../../components/common/AddStockModal";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All"); 
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch Logic
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const typeParam = filter === "All" ? "" : filter;
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
          <CheckCircle size={12} /> SAFE
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
    <div className="page-container" style={{ padding: "20px", maxWidth: "1600px", margin: "0 auto" }}>
      
      {/* 1. Responsive Header */}
      <div style={{ 
        display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", 
        gap: "16px", marginBottom: "24px" 
      }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "700", color: theme.colors.textPrimary, margin: 0 }}>
            Blood Inventory
          </h1>
          <p style={{ color: theme.colors.textSecondary, marginTop: "4px", fontSize: "0.95rem" }}>
            Manage units, monitor expiry, and lab status.
          </p>
        </div>
        
        <button onClick={() => setShowAddModal(true)} style={{ 
          display: "flex", alignItems: "center", gap: "8px",
          padding: "12px 20px", backgroundColor: theme.colors.primary, 
          color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer",
          boxShadow: theme.shadows.card, whiteSpace: "nowrap"
        }}>
          <Plus size={20} /> Add Stock
        </button>
      </div>

      {/* 2. Responsive Controls Bar */}
      <div style={{ 
        display: "flex", flexWrap: "wrap", gap: "16px", padding: "16px", 
        backgroundColor: "white", borderRadius: "12px", 
        boxShadow: theme.shadows.card, marginBottom: "24px", alignItems: "center"
      }}>
        {/* Search Input (Grows to fill space) */}
        <div style={{ position: "relative", flex: "1 1 250px" }}> {/* Min width 250px */}
          <Search size={20} color={theme.colors.textSecondary} style={{ position: "absolute", left: "12px", top: "12px" }} />
          <input 
            type="text" 
            placeholder="Search Unit ID..." 
            style={{
              width: "100%", padding: "12px 12px 12px 40px", fontSize: "0.95rem",
              border: `1px solid ${theme.colors.border}`, borderRadius: "8px", outline: "none"
            }}
          />
        </div>
        
        {/* Filter Chips (Scrollable on mobile) */}
        <div style={{ 
          display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px",
          flex: "1 1 auto", justifyContent: "flex-start", scrollbarWidth: "none" // Hide scrollbar
        }}>
          {["All", "Whole Blood", "Plasma", "RBC", "Platelets"].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                padding: "10px 16px", borderRadius: "8px", fontSize: "0.9rem", cursor: "pointer", whiteSpace: "nowrap",
                border: filter === type ? `1px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
                backgroundColor: filter === type ? "#FEF2F2" : "transparent",
                color: filter === type ? theme.colors.primary : theme.colors.textSecondary,
                fontWeight: filter === type ? "600" : "500", transition: "all 0.2s"
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Responsive Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", // Cards shrink to 280px before stacking
        gap: "20px" 
      }}>
        {inventory.map((item) => (
          <div key={item._id} style={{ 
            backgroundColor: "white", borderRadius: "12px", 
            boxShadow: theme.shadows.card, padding: "20px", 
            borderTop: `4px solid ${
              item.inventoryType === "Plasma" ? "#FBBF24" : 
              item.inventoryType === "Platelets" ? "#EAB308" : 
              item.inventoryType === "Packed Red Cells" ? "#B91C1C" : theme.colors.primary
            }`,
            display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%"
          }}>
            {/* Card Top */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "start" }}>
              <div>
                <span style={{ 
                  fontSize: "0.75rem", color: theme.colors.textSecondary, 
                  textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600"
                }}>
                  {item.inventoryType}
                </span>
                <h3 style={{ fontSize: "1.6rem", fontWeight: "800", color: theme.colors.textPrimary, margin: "4px 0" }}>
                  {item.bloodGroup}
                </h3>
              </div>
              <StatusBadge isTested={item.isTested} status={item.status} />
            </div>

            {/* Card Bottom */}
            <div style={{ marginTop: "auto" }}>
              <div style={{ 
                display: "flex", justifyContent: "space-between", alignItems: "end",
                paddingTop: "12px", borderTop: "1px solid #F3F4F6"
              }}>
                <div>
                  <p style={{ fontSize: "0.95rem", fontWeight: "600", color: theme.colors.textPrimary, margin: "0 0 4px 0" }}>
                    {item.unitId}
                  </p>
                  <p style={{ fontSize: "0.9rem", color: theme.colors.primary, fontWeight: "600", margin: "0 0 4px 0" }}>
                     {item.volume || 450} ml
                  </p>
                  <p style={{ fontSize: "0.8rem", color: theme.colors.textSecondary, margin: 0 }}>
                    {item.location}
                  </p>
                </div>
                
                {/* Action Button */}
                {!item.isTested && (
                  <button 
                    onClick={() => window.location.href = "/lab"}
                    style={{ 
                      padding: "8px 14px", fontSize: "0.85rem",
                      backgroundColor: theme.colors.secondary, color: "white",
                      border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                  >
                    Test →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {inventory.length === 0 && !loading && (
         <div style={{ 
           textAlign: "center", padding: "60px 20px", 
           color: theme.colors.textSecondary, backgroundColor: "white", 
           borderRadius: "12px", marginTop: "20px"
         }}>
           <p style={{fontSize: "1.1rem"}}>No units found matching your filters.</p>
           <button onClick={() => setFilter("All")} style={{ 
             marginTop: "12px", color: theme.colors.primary, background: "none", 
             border: "none", cursor: "pointer", fontWeight: "600"
           }}>
             Clear Filters
           </button>
         </div>
      )}

      {showAddModal && (
        <AddStockModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={fetchInventory} 
        />
      )}
    </div>
  );
};

export default Inventory;
import React, { useState, useEffect } from "react";
import { theme } from "../../styles/theme";
import { getUntestedUnits } from "../../services/lab.service";
import TTIModal from "../../components/common/TTIModal";
import { Beaker, CheckCircle } from "lucide-react";

const Lab = () => {
  const [activeTab, setActiveTab] = useState("screening"); // 'screening' or 'processing'
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null); // For Modal

  const fetchUnits = async () => {
    try {
      // For now, let's just build the Screening Tab
      const res = await getUntestedUnits();
      setUnits(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [activeTab]);

  return (
    <div className="page-container">
      <h1 style={{ fontSize: "1.8rem", fontWeight: "700", marginBottom: "8px" }}>Lab Management Console</h1>
      <p style={{ color: theme.colors.textSecondary, marginBottom: "32px" }}>Manage screening results and component processing.</p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid #E5E7EB", marginBottom: "32px" }}>
        <button 
          onClick={() => setActiveTab("screening")}
          style={{ 
            padding: "12px 0", borderBottom: activeTab === "screening" ? `3px solid ${theme.colors.primary}` : "none",
            color: activeTab === "screening" ? theme.colors.primary : theme.colors.textSecondary, fontWeight: "600", cursor: "pointer", background: "none", borderTop: "none", borderLeft: "none", borderRight: "none"
          }}
        >
          TTI Screening ({units.length})
        </button>
        <button 
          onClick={() => setActiveTab("processing")}
          style={{ 
            padding: "12px 0", borderBottom: activeTab === "processing" ? `3px solid ${theme.colors.primary}` : "none",
            color: activeTab === "processing" ? theme.colors.primary : theme.colors.textSecondary, fontWeight: "600", cursor: "pointer", background: "none", borderTop: "none", borderLeft: "none", borderRight: "none"
          }}
        >
          Component Separation
        </button>
      </div>

      {/* List */}
      {activeTab === "screening" && (
        <div style={{ display: "grid", gap: "16px" }}>
          {units.map(unit => (
            <div key={unit._id} style={{ 
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "20px", backgroundColor: "white", borderRadius: "12px", boxShadow: theme.shadows.card
            }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ padding: "12px", backgroundColor: "#FEF3C7", borderRadius: "8px", color: "#B45309" }}>
                   <Beaker size={24} />
                </div>
                <div>
                  <h3 style={{ fontWeight: "700", fontSize: "1.1rem" }}>{unit.unitId}</h3>
                  <p style={{ color: "#666", fontSize: "0.9rem" }}>Group: {unit.bloodGroup} • {unit.inventoryType}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedUnit(unit)}
                style={{
                  padding: "10px 20px", backgroundColor: theme.colors.secondary, color: "white",
                  border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer"
                }}
              >
                Update Results
              </button>
            </div>
          ))}
          {units.length === 0 && <p>No units pending screening.</p>}
        </div>
      )}

      {/* TTI Modal */}
      {selectedUnit && (
        <TTIModal 
          unit={selectedUnit} 
          onClose={() => setSelectedUnit(null)} 
          onSuccess={fetchUnits} 
        />
      )}
    </div>
  );
};

export default Lab;
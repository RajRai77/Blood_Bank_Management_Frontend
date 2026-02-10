import React, { useState, useEffect } from "react";
import { theme } from "../../styles/theme";
import { getUntestedUnits, getSafeUnits } from "../../services/lab.service"; // Import getSafeUnits
import TTIModal from "../../components/common/TTIModal";
import ComponentModal from "../../components/common/ComponentModal"; // Import the new modal
import { Beaker, Layers, AlertCircle, CheckCircle } from "lucide-react";

const Lab = () => {
  const [activeTab, setActiveTab] = useState("screening"); 
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null); 
  const [modalType, setModalType] = useState(null); // 'tti' or 'component'

  const fetchUnits = async () => {
    try {
      let res;
      if (activeTab === "screening") {
        res = await getUntestedUnits();
      } else {
        // Fetch SAFE units that are still WHOLE BLOOD (haven't been split yet)
        res = await getSafeUnits(); 
      }
      setUnits(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [activeTab]);

  const openModal = (unit) => {
    setSelectedUnit(unit);
    setModalType(activeTab === "screening" ? "tti" : "component");
  };

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
            color: activeTab === "screening" ? theme.colors.primary : theme.colors.textSecondary, fontWeight: "600", cursor: "pointer", background: "none", border: "none"
          }}
        >
          TTI Screening
        </button>
        <button 
          onClick={() => setActiveTab("processing")}
          style={{ 
            padding: "12px 0", borderBottom: activeTab === "processing" ? `3px solid ${theme.colors.primary}` : "none",
            color: activeTab === "processing" ? theme.colors.primary : theme.colors.textSecondary, fontWeight: "600", cursor: "pointer", background: "none", border: "none"
          }}
        >
          Component Separation
        </button>
      </div>

      {/* Unit List */}
      <div style={{ display: "grid", gap: "16px" }}>
        {units.map(unit => (
          <div key={unit._id} style={{ 
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "20px", backgroundColor: "white", borderRadius: "12px", boxShadow: theme.shadows.card,
            borderLeft: `4px solid ${activeTab === 'screening' ? theme.colors.status.warning : theme.colors.status.safe}`
          }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ 
                padding: "12px", borderRadius: "8px", 
                backgroundColor: activeTab === "screening" ? "#FEF3C7" : "#D1FAE5",
                color: activeTab === "screening" ? "#B45309" : "#065F46" 
              }}>
                 {activeTab === "screening" ? <Beaker size={24} /> : <Layers size={24} />}
              </div>
              <div>
                <h3 style={{ fontWeight: "700", fontSize: "1.1rem" }}>{unit.unitId}</h3>
                <p style={{ color: "#666", fontSize: "0.9rem" }}>Group: {unit.bloodGroup} • {unit.inventoryType}</p>
                {activeTab === "processing" && (
                   <span className="badge badge-success" style={{marginTop: "4px"}}>Tested Safe</span>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => openModal(unit)}
              style={{
                padding: "10px 20px", backgroundColor: theme.colors.secondary, color: "white",
                border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer"
              }}
            >
              {activeTab === "screening" ? "Update Results" : "Process Components"}
            </button>
          </div>
        ))}
        {units.length === 0 && (
          <p style={{ color: "#666", padding: "20px", textAlign: "center" }}>
            {activeTab === "screening" 
              ? "No new units pending screening." 
              : "No safe Whole Blood units available for processing."}
          </p>
        )}
      </div>

      {/* Modals */}
      {selectedUnit && modalType === "tti" && (
        <TTIModal unit={selectedUnit} onClose={() => setSelectedUnit(null)} onSuccess={fetchUnits} />
      )}
      {selectedUnit && modalType === "component" && (
        <ComponentModal unit={selectedUnit} onClose={() => setSelectedUnit(null)} onSuccess={fetchUnits} />
      )}
    </div>
  );
};

export default Lab;
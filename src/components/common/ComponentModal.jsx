import React, { useState } from "react";
import { X, Save, Layers } from "lucide-react";
import { theme } from "../../styles/theme";
import { processComponents } from "../../services/lab.service";
import toast from "react-hot-toast";

const ComponentModal = ({ unit, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState({
    "Packed Red Cells": true, // Default
    "Plasma": true,           // Default
    "Platelets": false
  });

  const handleProcess = async () => {
    // 1. Validation: Must select at least one
    const selected = Object.keys(components).filter(k => components[k]);
    if (selected.length === 0) {
      toast.error("Please select at least one component to extract.");
      return;
    }

    setLoading(true);
    try {
      // 2. Call API
      await processComponents({
        unitId: unit.unitId,
        components: selected
      });
      
      toast.success(`Unit ${unit.unitId} Processed into ${selected.length} components!`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Processing Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "16px", width: "600px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ padding: "10px", backgroundColor: "#DBEAFE", borderRadius: "8px", color: theme.colors.info }}>
              <Layers size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Component Separation</h2>
              <p style={{ color: "#666", fontSize: "0.9rem" }}>Source Unit: <b>{unit.unitId}</b> ({unit.bloodGroup})</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X /></button>
        </div>

        {/* Selection Area */}
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "12px" }}>Select Output Components</h3>
          
          <div style={{ display: "grid", gap: "12px" }}>
            {["Packed Red Cells", "Plasma", "Platelets"].map((comp) => (
              <label key={comp} style={{ 
                display: "flex", alignItems: "center", gap: "12px", 
                padding: "16px", border: "1px solid #E5E7EB", borderRadius: "12px",
                cursor: "pointer", backgroundColor: components[comp] ? "#EFF6FF" : "white",
                borderColor: components[comp] ? theme.colors.primary : "#E5E7EB"
              }}>
                <input 
                  type="checkbox" 
                  checked={components[comp]}
                  onChange={(e) => setComponents({...components, [comp]: e.target.checked})}
                  style={{ width: "18px", height: "18px" }}
                />
                <div>
                  <span style={{ fontWeight: "600", display: "block" }}>{comp}</span>
                  <span style={{ fontSize: "0.8rem", color: "#666" }}>
                    {comp === "Packed Red Cells" ? "Approx. 250ml • Store at 2-6°C" : 
                     comp === "Plasma" ? "Approx. 220ml • Store at -18°C" : "Approx. 50ml • Agitate at 20-24°C"}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button onClick={onClose} style={{ padding: "12px 24px", border: "1px solid #ddd", background: "white", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
          <button 
            onClick={handleProcess}
            disabled={loading}
            style={{ 
              padding: "12px 24px", backgroundColor: theme.colors.secondary, 
              color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" 
            }}
          >
            {loading ? "Processing..." : "Confirm & Split Bag"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComponentModal;
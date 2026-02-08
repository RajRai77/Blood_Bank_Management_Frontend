import React, { useState } from "react";
import { X, Save, AlertTriangle } from "lucide-react";
import { theme } from "../../styles/theme";
import { updateTestResults } from "../../services/lab.service";
import toast from "react-hot-toast";

const TTIModal = ({ unit, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    hiv: false,
    hbv: false,
    hcv: false,
    malaria: false,
    syphilis: false,
  });

  // Calculate if discard is needed
  const isUnsafe = Object.values(results).some(val => val === true);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateTestResults({
        unitId: unit.unitId,
        ...results
      });
      
      if (isUnsafe) {
        toast.error(`Unit ${unit.unitId} Marked as UNSAFE & DISCARDED`);
      } else {
        toast.success(`Unit ${unit.unitId} Marked as SAFE`);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update results");
    } finally {
      setLoading(false);
    }
  };

  const ToggleRow = ({ label, field }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #eee" }}>
      <span style={{ fontWeight: "500" }}>{label}</span>
      <div 
        onClick={() => setResults({...results, [field]: !results[field]})}
        style={{
          width: "48px", height: "24px", borderRadius: "99px",
          backgroundColor: results[field] ? theme.colors.status.critical : theme.colors.status.safe,
          position: "relative", cursor: "pointer", transition: "all 0.2s"
        }}
      >
        <div style={{
          width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "white",
          position: "absolute", top: "2px", 
          left: results[field] ? "26px" : "2px",
          transition: "all 0.2s"
        }} />
      </div>
    </div>
  );

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "16px", width: "500px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Input TTI Screening Results</h2>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>Unit ID: <b>{unit.unitId}</b></p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X /></button>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <ToggleRow label="HIV I/II" field="hiv" />
          <ToggleRow label="HBsAg (Hepatitis B)" field="hbv" />
          <ToggleRow label="HCV (Hepatitis C)" field="hcv" />
          <ToggleRow label="Malaria" field="malaria" />
          <ToggleRow label="Syphilis (VDRL)" field="syphilis" />
        </div>

        {isUnsafe && (
          <div style={{ 
            padding: "16px", backgroundColor: "#FEE2E2", borderRadius: "8px", 
            marginBottom: "24px", display: "flex", gap: "12px", alignItems: "center",
            color: "#B91C1C", border: "1px solid #FCA5A5"
          }}>
            <AlertTriangle />
            <div>
              <p style={{ fontWeight: "bold" }}>Result: DISCARD</p>
              <p style={{ fontSize: "0.8rem" }}>Unit tested positive for infections.</p>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", border: "1px solid #ddd", background: "white", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: isUnsafe ? theme.colors.status.critical : theme.colors.status.safe, 
              color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" 
            }}
          >
            {loading ? "Saving..." : (isUnsafe ? "Confirm Discard" : "Mark as Safe")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TTIModal;
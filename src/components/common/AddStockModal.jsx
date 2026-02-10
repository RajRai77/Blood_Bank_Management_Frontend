import React, { useState } from "react";
import { X, Save, Droplet } from "lucide-react";
import { theme } from "../../styles/theme";
import { addStock } from "../../services/inventory.service";
import toast from "react-hot-toast";

const AddStockModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    donorId: "",
    bloodGroup: "A+",
    quantity: 1,
    location: "",
    volume: 450, // Default to standard
  });

  const volumeOptions = [250, 350, 450]; // Standard ml bags

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addStock(formData);
      toast.success("Stock Added Successfully!");
      onSuccess(); 
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white", padding: "24px", borderRadius: "16px", width: "420px",
        boxShadow: theme.shadows.modal
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ padding: "8px", backgroundColor: "#FEE2E2", borderRadius: "8px", color: theme.colors.primary }}>
               <Droplet size={20} fill="currentColor" />
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Add New Stock</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Donor ID */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: "600", color: "#374151" }}>Donor ID</label>
            <input 
              required
              type="text" 
              placeholder="Scan or type ID (e.g. DNR-1001)"
              value={formData.donorId}
              onChange={(e) => setFormData({...formData, donorId: e.target.value})}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "1rem" }}
            />
          </div>

          {/* Blood Group */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: "600", color: "#374151" }}>Blood Group</label>
            <div style={{ position: "relative" }}>
              <select 
                value={formData.bloodGroup}
                onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                style={{ 
                  width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E5E7EB", 
                  fontSize: "1rem", appearance: "none", backgroundColor: "white" 
                }}
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
              {/* Custom Arrow */}
              <div style={{ position: "absolute", right: "12px", top: "16px", pointerEvents: "none", fontSize: "0.8rem", color: "#666" }}>▼</div>
            </div>
          </div>

          {/* Bag Volume (Chips) */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "10px", fontSize: "0.9rem", fontWeight: "600", color: "#374151" }}>Collection Volume</label>
            <div style={{ display: "flex", gap: "10px" }}>
              {volumeOptions.map((vol) => (
                <button
                  key={vol}
                  type="button"
                  onClick={() => setFormData({...formData, volume: vol})}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: formData.volume === vol ? `2px solid ${theme.colors.primary}` : "1px solid #E5E7EB",
                    backgroundColor: formData.volume === vol ? "#FEF2F2" : "white",
                    color: formData.volume === vol ? theme.colors.primary : "#4B5563",
                    fontWeight: formData.volume === vol ? "700" : "500",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {vol} ml
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: "600", color: "#374151" }}>Storage Location</label>
            <input 
              type="text" 
              placeholder="e.g. Fridge 1 - Shelf A"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "1rem" }}
            />
          </div>

          {/* Footer Buttons */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: "100%", padding: "14px", backgroundColor: theme.colors.primary, color: "white",
              border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "1rem", 
              cursor: loading ? "not-allowed" : "pointer", 
              display: "flex", justifyContent: "center", gap: "8px",
              boxShadow: "0 4px 6px -1px rgba(230, 57, 70, 0.2)"
            }}
          >
            {loading ? "Processing..." : (
              <>
                <Save size={18} /> Save Blood Unit
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStockModal;
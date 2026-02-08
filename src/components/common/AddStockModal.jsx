import React, { useState } from "react";
import { X, Save } from "lucide-react";
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
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addStock(formData);
      toast.success("Stock Added Successfully!");
      onSuccess(); // Refresh the list
      onClose();   // Close modal
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
        backgroundColor: "white", padding: "24px", borderRadius: "12px", width: "400px",
        boxShadow: theme.shadows.modal
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Add New Stock</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Donor ID */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: "500" }}>Donor ID</label>
            <input 
              required
              type="text" 
              placeholder="e.g. DNR-1001"
              value={formData.donorId}
              onChange={(e) => setFormData({...formData, donorId: e.target.value})}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
            />
          </div>

          {/* Blood Group */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: "500" }}>Blood Group</label>
            <select 
              value={formData.bloodGroup}
              onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
            >
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: "500" }}>Storage Location</label>
            <input 
              type="text" 
              placeholder="e.g. Fridge 1 - Shelf A"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: "100%", padding: "12px", backgroundColor: theme.colors.primary, color: "white",
              border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Adding..." : "Save Unit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStockModal;
import React, { useState } from "react";
import { X, Save, User, Phone, MapPin, Calendar, Activity } from "lucide-react";
import { theme } from "../../styles/theme";
import { registerDonor } from "../../services/donor.service";
import toast from "react-hot-toast";

const RegisterDonorModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bloodGroup: "",
    dateOfBirth: "",
    gender: "Male",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerDonor(formData);
      toast.success("Donor Registered Successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100,
      padding: "16px" // Mobile padding
    }}>
      <div style={{
        backgroundColor: "white", borderRadius: "16px", 
        width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto",
        boxShadow: theme.shadows.modal
      }}>
        {/* Header */}
        <div style={{ padding: "24px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ padding: "8px", backgroundColor: "#EFF6FF", borderRadius: "8px", color: theme.colors.primary }}>
               <User size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700", margin: 0 }}>Register New Donor</h2>
              <p style={{ fontSize: "0.85rem", color: "#666", margin: 0 }}>Enter details for eligibility check.</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={24} /></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          
          {/* Row 1: Names */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>First Name</label>
              <input required name="firstName" placeholder="Jane" value={formData.firstName} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input required name="lastName" placeholder="Cooper" value={formData.lastName} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* Row 2: Contact */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <div style={{ position: "relative" }}>
                 <Phone size={16} style={{ position: "absolute", left: "10px", top: "12px", color: "#9CA3AF" }} />
                 <input required name="phone" placeholder="+1 555-0000" value={formData.phone} onChange={handleChange} style={{...inputStyle, paddingLeft: "32px"}} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input required type="email" name="email" placeholder="jane@example.com" value={formData.email} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* Row 3: Medical */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
             <div>
              <label style={labelStyle}>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} style={inputStyle} required>
                <option value="">Select Group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input required type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* Row 4: Address */}
          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Residential Address</label>
            <div style={{ position: "relative" }}>
                <MapPin size={16} style={{ position: "absolute", left: "10px", top: "12px", color: "#9CA3AF" }} />
                <input required name="address" placeholder="123 Main St, Springfield" value={formData.address} onChange={handleChange} style={{...inputStyle, paddingLeft: "32px"}} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "32px" }}>
            <button type="button" onClick={onClose} style={{ padding: "12px 20px", border: "1px solid #E5E7EB", background: "white", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: "12px 24px", backgroundColor: theme.colors.primary, 
                color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "8px"
              }}
            >
              {loading ? "Saving..." : <><Save size={18} /> Save Donor</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

// Styles
const labelStyle = { display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: "600", color: "#374151" };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "0.95rem", outline: "none" };

export default RegisterDonorModal;
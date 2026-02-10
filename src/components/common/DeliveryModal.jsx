import React, { useState } from "react";
import { X, Truck, Phone, User, Clock } from "lucide-react";
import { theme } from "../../styles/theme";

const DeliveryModal = ({ request, onClose, onConfirm }) => {
  const [formData, setFormData] = useState({
    driverName: "",
    contactNumber: "",
    vehicleNumber: "",
    estimatedTime: "2 Hours"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(formData); // Pass data back to parent
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200
    }}>
      <div style={{ backgroundColor: "white", borderRadius: "16px", width: "450px", padding: "24px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Schedule Delivery</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X /></button>
        </div>

        <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "16px" }}>
          Request for <b>{request.quantity} Units {request.bloodGroup}</b> requires logistics.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Driver Name</label>
            <div style={{ position: "relative" }}>
               <User size={16} style={iconStyle} />
               <input required placeholder="Ramesh Driver" style={inputStyle} 
                 onChange={e => setFormData({...formData, driverName: e.target.value})} />
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Driver Phone</label>
            <div style={{ position: "relative" }}>
               <Phone size={16} style={iconStyle} />
               <input required placeholder="98765..." style={inputStyle} 
                 onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
             <div>
                <label style={labelStyle}>Vehicle No.</label>
                <div style={{ position: "relative" }}>
                   <Truck size={16} style={iconStyle} />
                   <input required placeholder="MH-02..." style={inputStyle} 
                     onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} />
                </div>
             </div>
             <div>
                <label style={labelStyle}>ETA</label>
                <div style={{ position: "relative" }}>
                   <Clock size={16} style={iconStyle} />
                   <input required placeholder="45 Mins" style={inputStyle} 
                     onChange={e => setFormData({...formData, estimatedTime: e.target.value})} />
                </div>
             </div>
          </div>

          <button type="submit" style={{
            width: "100%", padding: "12px", backgroundColor: "#10B981", color: "white", 
            border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer"
          }}>
            Confirm & Dispatch
          </button>
        </form>
      </div>
    </div>
  );
};

const labelStyle = { display: "block", marginBottom: "4px", fontSize: "0.85rem", fontWeight: "600", color: "#374151" };
const iconStyle = { position: "absolute", left: "10px", top: "10px", color: "#9CA3AF" };
const inputStyle = { width: "100%", padding: "8px 8px 8px 36px", borderRadius: "8px", border: "1px solid #ddd", outline: "none" };

export default DeliveryModal;
import React, { useState } from "react";
import { X, Truck, Phone, User, Calendar, FileText } from "lucide-react";

const DeliveryModal = ({ request, onClose, onConfirm }) => {

  const [upiId, setUpiId] = useState("");
const [paymentNote, setPaymentNote] = useState("");
  const [formData, setFormData] = useState({
    driverName: "",
    contactNumber: "",
    vehicleNumber: "",
    estimatedArrival: "", // Will store datetime string
    notes: "" // New Notes Field
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(formData, {upiId,paymentNote});
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200
    }}>
      <div style={{ backgroundColor: "white", borderRadius: "16px", width: "500px", padding: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", margin: 0 }}>Schedule Delivery</h2>
            <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "4px" }}>
              Dispatching <b>{request.quantity} Units {request.bloodGroup}</b>
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px" }}><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Driver Info Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Driver Name</label>
              <div style={{ position: "relative" }}>
                 <User size={16} style={iconStyle} />
                 <input required placeholder="Ramesh Driver" style={inputStyle} 
                   onChange={e => setFormData({...formData, driverName: e.target.value})} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Driver Phone</label>
              <div style={{ position: "relative" }}>
                 <Phone size={16} style={iconStyle} />
                 <input required placeholder="98765..." style={inputStyle} 
                   onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Vehicle & Time Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
             <div>
                <label style={labelStyle}>Vehicle No.</label>
                <div style={{ position: "relative" }}>
                   <Truck size={16} style={iconStyle} />
                   <input required placeholder="MH-02..." style={inputStyle} 
                     onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} />
                </div>
             </div>
             <div>
                <label style={labelStyle}>Est. Arrival Time</label>
                <div style={{ position: "relative" }}>
                   <Calendar size={16} style={iconStyle} />
                   <input required type="datetime-local" style={inputStyle} 
                     onChange={e => setFormData({...formData, estimatedArrival: e.target.value})} />
                </div>
             </div>
          </div>

          <h3 style={{ marginTop: "20px" }}>Payment Details</h3>
          <input placeholder="Enter your UPI ID (e.g., hospital@oksbi)" value={upiId} onChange={(e) => setUpiId(e.target.value)} style={inputStyle} />
          <input placeholder="Payment Instructions (Optional)" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} style={inputStyle} />

          {/* New Notes Section */}
          <div style={{ marginBottom: "24px" }}>
             <label style={labelStyle}>Delivery Instructions / Notes</label>
             <div style={{ position: "relative" }}>
                <FileText size={16} style={{...iconStyle, top: "12px"}} />
                <textarea 
                  placeholder="e.g. Handle with care, Call upon arrival..." 
                  rows="3"
                  style={{...inputStyle, paddingLeft: "36px", resize: "none", fontFamily: "inherit"}}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
             </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "12px 20px", background: "white", border: "1px solid #ddd", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
            <button type="submit" style={{
              padding: "12px 24px", backgroundColor: "#10B981", color: "white", 
              border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "8px"
            }}>
              <Truck size={18} /> Confirm Dispatch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const labelStyle = { display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: "600", color: "#374151" };
const iconStyle = { position: "absolute", left: "10px", top: "11px", color: "#9CA3AF" };
const inputStyle = { width: "100%", padding: "10px 10px 10px 36px", borderRadius: "8px", border: "1px solid #D1D5DB", outline: "none", fontSize: "0.9rem" };

export default DeliveryModal;
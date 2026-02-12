import React, { useState, useEffect } from "react";
import { X, FileText, Building2 } from "lucide-react";
import { theme } from "../../styles/theme";
import { createRequest } from "../../services/request.service";
import { getHospitalsList, getCurrentUser } from "../../services/auth.service"; 
import toast from "react-hot-toast";
import { calculateEstimatedPrice } from "../../utils/pricing";

const RequestModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [user, setUser] = useState(null); 
  const [price, setPrice] = useState(0);
  
  const [formData, setFormData] = useState({
    recipientId: "", // <--- NEW: Who receives the request?
    patientName: "",
    bloodGroup: "A+",
    requestType: "Whole Blood",
    quantity: 1,
    priority: "Normal"
  });

  useEffect(() => {
    const estimated = calculateEstimatedPrice(formData.bloodGroup, formData.quantity, formData.requestType);
    setPrice(estimated);
}, [formData.bloodGroup, formData.quantity, formData.requestType]);

useEffect(() => {
    const init = async () => {
      try {
        // 1. Get Current User
        const userRes = await getCurrentUser();
        
        // Safety Check: Ensure user data exists
        if (!userRes.data || !userRes.data.data || !userRes.data.data.user) {
            console.error("User data missing", userRes);
            return;
        }

        const currentUser = userRes.data.data.user;
        setUser(currentUser);

        // 2. Fetch List of ALL Hospitals
        const hospRes = await getHospitalsList();
        
        if (hospRes.data && hospRes.data.data) {
            // Filter out MYSELF from the list
            const others = hospRes.data.data.filter(h => h._id !== currentUser._id);
            setHospitals(others);
        }

      } catch (error) {
        console.error("Init failed", error);
        toast.error("Could not load user or hospital data");
      }
    };
    init();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.recipientId) {
        return toast.error("Please select a Hospital to request from.");
    }

    setLoading(true);
    try {
      // We send 'requesterName' as MY name automatically
      await createRequest({
          ...formData,
          requesterName: user.name || user.hospitalName, price // Auto-fill my name
      });
      toast.success("Request Sent to Hospital!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "16px"
    }}>
      <div style={{
        backgroundColor: "white", borderRadius: "16px", width: "100%", maxWidth: "500px", 
        maxHeight: "90vh", overflowY: "auto", boxShadow: theme.shadows.modal
      }}>
        <div style={{ padding: "24px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ padding: "8px", backgroundColor: "#EFF6FF", borderRadius: "8px", color: theme.colors.primary }}>
               <FileText size={20} />
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", margin: 0 }}>Request Blood</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          
          {/* --- UPDATED DROPDOWN (Target Selection) --- */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: "600", color: "#374151" }}>
                Select Hospital to Request From
            </label>
            <div style={{ position: "relative" }}>
              <Building2 size={18} style={{ position: "absolute", left: "12px", top: "12px", color: "#6B7280" }} />
              <select 
                required 
                name="recipientId" // Maps to recipientId state
                value={formData.recipientId} 
                onChange={handleChange} 
                style={{ width: "100%", padding: "10px 10px 10px 40px", borderRadius: "8px", border: "1px solid #D1D5DB", outline: "none" }}
              >
                <option value="">-- Select Blood Bank / Hospital --</option>
                {hospitals.map(h => (
                  <option key={h._id} value={h._id}>
                    {h.name} ({h.address || "Main Branch"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
             <label style={labelStyle}>Patient Name</label>
             <input required name="patientName" placeholder="Patient Name" value={formData.patientName} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
             <div>
               <label style={labelStyle}>Blood Group</label>
               <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} style={inputStyle}>
                 {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
               </select>
             </div>
             <div>
               <label style={labelStyle}>Type</label>
               <select name="requestType" value={formData.requestType} onChange={handleChange} style={inputStyle}>
                 <option value="Whole Blood">Whole Blood</option>
                 <option value="Plasma">Plasma</option>
                 <option value="Packed Red Cells">RBC</option>
                 <option value="Platelets">Platelets</option>
               </select>
             </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
             <div>
               <label style={labelStyle}>Quantity</label>
               <input required type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} style={inputStyle} />
             </div>
             <div>
               <label style={labelStyle}>Priority</label>
               <select name="priority" value={formData.priority} onChange={handleChange} style={inputStyle}>
                 <option value="Normal">Normal</option>
                 <option value="Urgent">Urgent 🚨</option>
               </select>
             </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Estimated Price (₹)</label>
          <input 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontWeight: "bold", fontSize: "1.1rem", color: "#166534" }}
          />
          <span style={{ fontSize: "0.8rem", color: "#666" }}>*Based on blood rarity and type. You can edit this.</span>
        </div>

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", backgroundColor: theme.colors.primary, color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
            {loading ? "Sending..." : "Send Request"}
          </button>

        </form>
      </div>
    </div>
  );
};

const labelStyle = { display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: "600", color: "#374151" };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "0.95rem", outline: "none" };

export default RequestModal;
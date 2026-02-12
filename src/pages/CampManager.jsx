import React, { useState, useEffect } from "react";
import TopBar from "../components/layout/TopBar";
import { Plus, MapPin, Clock, ChevronRight, X, User, CheckCircle, Droplet, Activity } from "lucide-react";
import toast from "react-hot-toast";
import { theme } from "../styles/theme";

// --- IMPORT SERVICE ---
import { getCamps, createCamp, registerDonor, updateDonorStatus } from "../services/camp.services";

const CampManager = () => {
  const [camps, setCamps] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);

  // Fetch Camps (Using Service)
  const fetchCamps = async () => {
    try {
        const res = await getCamps();
        setCamps(res.data.data);
    } catch (error) {
        console.error("Error fetching camps");
    }
  };

  useEffect(() => { fetchCamps(); }, []);

  return (
    <div style={{ paddingBottom: "50px" }}>
      <TopBar title="Camp Management" />
      
      <div style={{ padding: "0 30px", maxWidth: "1600px", margin: "0 auto" }}>
          
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", background: "#F9FAFB", padding: "20px", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
              <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold" }}>Blood Donation Drives</h3>
                  <p style={{ margin: "4px 0 0", color: "#6B7280" }}>Organize camps and track live collections.</p>
              </div>
              <button onClick={() => setShowCreateModal(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "#111827", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                  <Plus size={20} /> Schedule Camp
              </button>
          </div>

          {/* Camp Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
              {camps.map(camp => {
                  const collected = camp.donors.filter(d => d.status === "Donated").length;
                  const progress = (collected / camp.targetUnits) * 100;

                  return (
                    <div key={camp._id} style={{ background: "white", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", transition: "transform 0.2s" }}>
                        <div style={{ padding: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#6B7280", textTransform: "uppercase" }}>{new Date(camp.date).toDateString()}</span>
                                <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: camp.status==="Active"?"#059669":"#D97706", background: camp.status==="Active"?"#ECFDF5":"#FFFBEB", padding: "2px 8px", borderRadius: "4px" }}>{camp.status}</span>
                            </div>
                            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.3rem", fontWeight: "bold" }}>{camp.name}</h3>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6B7280", fontSize: "0.9rem", marginBottom: "4px" }}>
                                <MapPin size={16} /> {camp.location}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6B7280", fontSize: "0.9rem" }}>
                                <Clock size={16} /> {camp.time}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ padding: "0 20px 20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px", fontWeight: "600" }}>
                                <span>Collected: {collected}</span>
                                <span>Target: {camp.targetUnits}</span>
                            </div>
                            <div style={{ width: "100%", height: "8px", background: "#F3F4F6", borderRadius: "4px", overflow: "hidden" }}>
                                <div style={{ width: `${Math.min(progress, 100)}%`, height: "100%", background: theme.colors.primary, borderRadius: "4px" }}></div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setSelectedCamp(camp)}
                            style={{ width: "100%", padding: "16px", background: "#F9FAFB", border: "none", borderTop: "1px solid #E5E7EB", color: theme.colors.primary, fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                        >
                            Open Live Console <ChevronRight size={18} />
                        </button>
                    </div>
                  );
              })}
          </div>
      </div>

      {showCreateModal && <CreateCampModal onClose={() => setShowCreateModal(false)} onSuccess={fetchCamps} />}
      {selectedCamp && <LiveCampConsole camp={selectedCamp} onClose={() => setSelectedCamp(null)} onRefresh={fetchCamps} />}
    </div>
  );
};

// --- MODAL 1: CREATE CAMP ---
const CreateCampModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({ name: "", location: "", date: "", time: "", targetUnits: 50 });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await createCamp(form); // Uses Service
            toast.success("Camp Scheduled!");
            onSuccess();
            onClose();
        } catch (error) { toast.error("Failed to create camp"); } finally { setLoading(false); }
    };

    const inputStyle = { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #D1D5DB", marginTop: "4px", marginBottom: "16px" };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
            <div style={{ background: "white", padding: "30px", borderRadius: "20px", width: "500px", maxWidth: "90%", position: "relative" }}>
                <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, border: "none", background: "none", cursor: "pointer" }}><X size={20} /></button>
                <h2 style={{ margin: "0 0 20px 0" }}>Schedule New Camp</h2>
                <form onSubmit={handleSubmit}>
                    <label style={{fontWeight:"bold", fontSize:"0.9rem"}}>Event Name</label>
                    <input required style={inputStyle} placeholder="e.g. Red Cross Mega Drive" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
                    
                    <label style={{fontWeight:"bold", fontSize:"0.9rem"}}>Location / Venue</label>
                    <input required style={inputStyle} placeholder="e.g. Community Hall, Andheri" value={form.location} onChange={e=>setForm({...form, location: e.target.value})} />
                    
                    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
                        <div><label style={{fontWeight:"bold", fontSize:"0.9rem"}}>Date</label><input type="date" required style={inputStyle} value={form.date} onChange={e=>setForm({...form, date: e.target.value})} /></div>
                        <div><label style={{fontWeight:"bold", fontSize:"0.9rem"}}>Target Units</label><input type="number" required style={inputStyle} value={form.targetUnits} onChange={e=>setForm({...form, targetUnits: e.target.value})} /></div>
                    </div>
                    
                    <label style={{fontWeight:"bold", fontSize:"0.9rem"}}>Time Duration</label>
                    <input required style={inputStyle} placeholder="e.g. 9:00 AM - 5:00 PM" value={form.time} onChange={e=>setForm({...form, time: e.target.value})} />

                    <button disabled={loading} style={{ width: "100%", padding: "14px", background: "#111827", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>{loading ? "Scheduling..." : "Create Event"}</button>
                </form>
            </div>
        </div>
    );
};

// --- MODAL 2: LIVE CAMP CONSOLE ---
const LiveCampConsole = ({ camp, onClose, onRefresh }) => {
    const [donors, setDonors] = useState(camp.donors || []);
    const [newDonor, setNewDonor] = useState({ name: "", phone: "", age: "", gender: "Male", bloodGroup: "" });
    
    const refreshData = async () => {
        try {
            const res = await getCamps(); // Uses Service
            const updatedCamp = res.data.data.find(c => c._id === camp._id);
            if(updatedCamp) setDonors(updatedCamp.donors);
            onRefresh();
        } catch(e) {}
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await registerDonor(camp._id, newDonor); // Uses Service
            toast.success("Donor Registered");
            setNewDonor({ name: "", phone: "", age: "", gender: "Male", bloodGroup: "" });
            refreshData();
        } catch (error) { toast.error("Registration Failed"); }
    };

    const handleStatus = async (donorId, status, currentGroup) => {
        try {
            if(status === "Donated" && !currentGroup) {
                toast.error("Blood Group required for donation");
                return;
            }
            await updateDonorStatus(camp._id, donorId, { status }); // Uses Service
            
            if(status === "Donated") toast.success("Blood Collected & Added to Inventory");
            else toast.success(`Status updated to ${status}`);
            
            refreshData();
        } catch (error) { toast.error("Update Failed"); }
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "white", zIndex: 1300, overflowY: "auto" }}>
            <div style={{ padding: "20px 40px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#111827", color: "white", position: "sticky", top: 0, zIndex: 10 }}>
                <div>
                    <h2 style={{ margin: 0 }}>{camp.name} <span style={{fontSize:"0.9rem", opacity: 0.7, marginLeft: "10px"}}>Live Console</span></h2>
                    <div style={{display:"flex", gap:"20px", marginTop:"8px", fontSize:"0.9rem", opacity:0.8}}>
                        <span>📍 {camp.location}</span>
                        <span>🎯 Target: {camp.targetUnits}</span>
                        <span>🩸 Collected: {donors.filter(d => d.status === "Donated").length}</span>
                    </div>
                </div>
                <button onClick={onClose} style={{ background: "white", color: "black", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Exit Console</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", minHeight: "calc(100vh - 100px)" }}>
                
                {/* LEFT: WALK-IN REGISTRATION */}
                <div style={{ borderRight: "1px solid #E5E7EB", padding: "30px", background: "#F9FAFB" }}>
                    <h3 style={{ marginTop: 0 }}>Register Walk-In</h3>
                    <form onSubmit={handleRegister}>
                        <input required style={{width:"100%", padding:"12px", borderRadius:"8px", border:"1px solid #ddd", marginBottom:"10px"}} placeholder="Donor Name" value={newDonor.name} onChange={e=>setNewDonor({...newDonor, name: e.target.value})} />
                        <input required style={{width:"100%", padding:"12px", borderRadius:"8px", border:"1px solid #ddd", marginBottom:"10px"}} placeholder="Phone Number" value={newDonor.phone} onChange={e=>setNewDonor({...newDonor, phone: e.target.value})} />
                        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px"}}>
                            <input required type="number" style={{padding:"12px", borderRadius:"8px", border:"1px solid #ddd", width:"100%"}} placeholder="Age" value={newDonor.age} onChange={e=>setNewDonor({...newDonor, age: e.target.value})} />
                            <select style={{padding:"12px", borderRadius:"8px", border:"1px solid #ddd", width:"100%"}} value={newDonor.gender} onChange={e=>setNewDonor({...newDonor, gender: e.target.value})}><option>Male</option><option>Female</option></select>
                        </div>
                        <select style={{width:"100%", padding:"12px", borderRadius:"8px", border:"1px solid #ddd", marginBottom:"20px"}} value={newDonor.bloodGroup} onChange={e=>setNewDonor({...newDonor, bloodGroup: e.target.value})}>
                            <option value="">Select Blood Group (If known)</option>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <button style={{ width: "100%", padding: "14px", background: theme.colors.primary, color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Check-In Donor</button>
                    </form>
                </div>

                {/* RIGHT: DONOR PIPELINE */}
                <div style={{ padding: "30px" }}>
                    <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Donor Pipeline</h3>
                    <div style={{ background: "white", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead style={{ background: "#F3F4F6", fontSize: "0.85rem", textTransform: "uppercase", color: "#6B7280" }}>
                                <tr>
                                    <th style={{ padding: "16px" }}>Donor Details</th>
                                    <th style={{ padding: "16px" }}>Status</th>
                                    <th style={{ padding: "16px" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donors.map(d => (
                                    <tr key={d._id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                                        <td style={{ padding: "16px" }}>
                                            <div style={{ fontWeight: "bold" }}>{d.name}</div>
                                            <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>{d.age}Y • {d.gender} • {d.bloodGroup || "Unknown"}</div>
                                        </td>
                                        <td style={{ padding: "16px" }}>
                                            <span style={{ 
                                                padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold",
                                                background: d.status==="Donated"?"#ECFDF5":d.status.includes("Unfit")?"#FEF2F2":"#EFF6FF",
                                                color: d.status==="Donated"?"#059669":d.status.includes("Unfit")?"#EF4444":"#2563EB"
                                            }}>
                                                {d.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: "16px" }}>
                                            {d.status === "Registered" && (
                                                <div style={{display:"flex", gap:"8px"}}>
                                                    <button onClick={() => handleStatus(d._id, "Screened - Fit")} style={{padding:"6px 12px", background:"#10B981", color:"white", border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"0.8rem"}}>Pass</button>
                                                    <button onClick={() => handleStatus(d._id, "Screened - Unfit")} style={{padding:"6px 12px", background:"#EF4444", color:"white", border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"0.8rem"}}>Reject</button>
                                                </div>
                                            )}
                                            {d.status === "Screened - Fit" && (
                                                <button onClick={() => handleStatus(d._id, "Donated", d.bloodGroup)} style={{padding:"8px 16px", background:"#111827", color:"white", border:"none", borderRadius:"6px", cursor:"pointer", fontWeight:"bold", display:"flex", alignItems:"center", gap:"6px"}}>
                                                    <Droplet size={14} /> Collect
                                                </button>
                                            )}
                                            {d.status === "Donated" && (
                                                <div style={{display:"flex", alignItems:"center", gap:"6px", color:"#059669", fontSize:"0.9rem", fontWeight:"bold"}}>
                                                    <CheckCircle size={16} /> Done
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {donors.length === 0 && <tr><td colSpan="4" style={{padding:"40px", textAlign:"center", color:"#9CA3AF"}}>No donors registered yet.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampManager;
import React, { useState, useEffect } from "react";
import TopBar from "../components/layout/TopBar";
import { Plus, User, Phone, Droplet, Heart, X, Calendar, Activity, History, CreditCard, CheckCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import QRCode from "react-qr-code"; // Make sure to npm install react-qr-code
import { theme } from "../styles/theme";

// --- SERVICE IMPORT ---
import { getPatients, addPatient, dispenseBlood } from "../services/patient.service";

const PatientManager = () => {
  const [patients, setPatients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Fetch Patients
  const fetchPatients = async () => {
    try {
        const res = await getPatients();
        setPatients(res.data.data);
    } catch (error) {
        console.error("Error fetching patients:", error);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  return (
    <div style={{ paddingBottom: "50px" }}>
      <TopBar title="Patient Management" />
      
      <div style={{ padding: "0 30px", maxWidth: "1600px", margin: "0 auto" }}>
          
          {/* Action Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", background: "#F9FAFB", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
              <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Admitted Patients</h3>
                  <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "0.9rem" }}>Manage internal blood usage and billing.</p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "#111827", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
              >
                  <Plus size={20} /> Admit New Patient
              </button>
          </div>

          {/* Patients Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "24px" }}>
              {patients.map(p => (
                  <div key={p._id} style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #E5E7EB", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", transition: "transform 0.2s" }}>
                      
                      {/* Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                          <div style={{ display: "flex", gap: "12px" }}>
                              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem" }}>
                                  {p.name.charAt(0)}
                              </div>
                              <div>
                                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold", color: "#111827" }}>{p.name}</h3>
                                  <p style={{ margin: "2px 0 0", color: "#6B7280", fontSize: "0.85rem" }}>{p.age} Yrs • {p.gender}</p>
                              </div>
                          </div>
                          <div style={{ padding: "6px 12px", background: "#FEF2F2", color: "#EF4444", borderRadius: "8px", fontWeight: "bold", fontSize: "1rem", height: "fit-content", display: "flex", alignItems: "center", gap: "4px" }}>
                              <Droplet size={14} fill="#EF4444" /> {p.bloodGroup}
                          </div>
                      </div>

                      {/* Info Chips */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#4B5563", background: "#F9FAFB", padding: "8px", borderRadius: "8px" }}>
                              <Phone size={14} color="#9CA3AF" /> {p.contact}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#4B5563", background: "#F9FAFB", padding: "8px", borderRadius: "8px" }}>
                              <Activity size={14} color="#9CA3AF" /> {p.diagnosis}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#4B5563", background: "#F9FAFB", padding: "8px", borderRadius: "8px", gridColumn: "span 2" }}>
                              <Calendar size={14} color="#9CA3AF" /> Admitted: {new Date(p.admissionDate).toLocaleDateString()}
                          </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "10px" }}>
                          <button 
                            onClick={() => { setSelectedPatient(p); setShowHistoryModal(true); }}
                            style={{ flex: 1, padding: "10px", background: "white", color: "#374151", border: "1px solid #D1D5DB", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}
                          >
                              <History size={16} /> History
                          </button>
                          <button 
                            onClick={() => { setSelectedPatient(p); setShowDispenseModal(true); }}
                            style={{ flex: 2, padding: "10px", background: "#111827", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}
                          >
                              <Droplet size={16} /> Issue Blood
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {showAddModal && <AddPatientModal onClose={() => setShowAddModal(false)} onSuccess={fetchPatients} />}
      
      {showDispenseModal && <DispenseModal patient={selectedPatient} onClose={() => setShowDispenseModal(false)} onSuccess={fetchPatients} />}
      
      {showHistoryModal && <HistoryModal patient={selectedPatient} onClose={() => setShowHistoryModal(false)} />}
    </div>
  );
};

// --- MODAL 1: ADD PATIENT (Kept Simple) ---
const AddPatientModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({ name: "", age: "", gender: "Male", bloodGroup: "A+", contact: "", diagnosis: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await addPatient(form);
            toast.success("Patient Admitted Successfully");
            onSuccess();
            onClose();
        } catch (error) { toast.error("Failed to add patient"); } finally { setLoading(false); }
    };

    const inputStyle = { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #D1D5DB", marginTop: "4px", fontSize: "0.95rem" };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
            <div style={{ background: "white", padding: "30px", borderRadius: "20px", width: "500px", maxWidth: "90%", position: "relative" }}>
                <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, border: "none", background: "none", cursor: "pointer" }}><X size={20} /></button>
                <h2 style={{ margin: 0, color: "#111827" }}>Admit New Patient</h2>
                <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
                    <input required style={inputStyle} value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder="Full Name" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
                        <input required type="number" style={inputStyle} value={form.age} onChange={e=>setForm({...form, age: e.target.value})} placeholder="Age" />
                        <select style={inputStyle} value={form.gender} onChange={e=>setForm({...form, gender: e.target.value})}><option>Male</option><option>Female</option></select>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
                         <select style={inputStyle} value={form.bloodGroup} onChange={e=>setForm({...form, bloodGroup: e.target.value})}>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g}>{g}</option>)}</select>
                         <input required style={inputStyle} value={form.contact} onChange={e=>setForm({...form, contact: e.target.value})} placeholder="Mobile" />
                    </div>
                    <input required style={{...inputStyle, marginTop: "10px"}} value={form.diagnosis} onChange={e=>setForm({...form, diagnosis: e.target.value})} placeholder="Diagnosis" />
                    <button disabled={loading} style={{ width: "100%", padding: "14px", background: "#111827", color: "white", border: "none", borderRadius: "10px", marginTop: "24px", fontWeight: "bold", cursor: "pointer" }}>{loading ? "Processing..." : "Admit Patient"}</button>
                </form>
            </div>
        </div>
    );
};

// --- MODAL 2: DISPENSE BLOOD (With QR Payment) ---
const DispenseModal = ({ patient, onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Details, 2: Payment/QR
    const [form, setForm] = useState({ 
        bloodGroup: patient.bloodGroup, 
        component: "Whole Blood", 
        quantity: 1, 
        usageType: "Sold", 
        price: 1200,
        upiId: "", // Hospital's UPI
        txnId: ""  // User's Transaction ID
    });
    const [loading, setLoading] = useState(false);

    // Auto-calculate price
    useEffect(() => {
        if (form.usageType === "Sold") {
            let base = 1200;
            if (form.bloodGroup.includes("-")) base += 500;
            if (form.component === "Platelets") base += 800;
            setForm(prev => ({ ...prev, price: base * prev.quantity }));
        } else {
            setForm(prev => ({ ...prev, price: 0 }));
        }
    }, [form.usageType, form.quantity, form.bloodGroup, form.component]);

    // Handle "Proceed to Pay"
    const handleProceed = (e) => {
        e.preventDefault();
        if (form.usageType === "Donated") {
            // Skip Payment Step for Donation
            finalSubmit();
        } else {
            if (!form.upiId) {
                toast.error("Please enter Hospital UPI ID to generate QR");
                return;
            }
            setStep(2); // Go to QR Screen
        }
    };

    // Final API Call
    const finalSubmit = async () => {
        try {
            setLoading(true);
            await dispenseBlood(patient._id, form);
            toast.success(`Blood ${form.usageType === "Sold" ? "Issued" : "Donated"} Successfully!`);
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed. Check Stock.");
            setLoading(false);
        } 
    };

    const upiLink = `upi://pay?pa=${form.upiId}&pn=BloodBank&am=${form.price}&cu=INR`;

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
            <div style={{ background: "white", padding: "30px", borderRadius: "20px", width: "450px", maxWidth: "90%", position: "relative" }}>
                <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, border: "none", background: "none", cursor: "pointer" }}><X size={20} /></button>
                
                {step === 1 ? (
                    // --- STEP 1: BILLING DETAILS ---
                    <>
                        <h2 style={{ margin: "0 0 20px 0" }}>Issue Blood Unit</h2>
                        
                        {/* Type Toggle */}
                        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                             <button onClick={()=>setForm({...form, usageType: "Sold"})} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: form.usageType==="Sold"?`2px solid #111827`:"1px solid #E5E7EB", background: form.usageType==="Sold"?"#F3F4F6":"white", fontWeight: "bold" }}>Billable (Sell)</button>
                             <button onClick={()=>setForm({...form, usageType: "Donated"})} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: form.usageType==="Donated"?`2px solid #059669`:"1px solid #E5E7EB", background: form.usageType==="Donated"?"#ECFDF5":"white", fontWeight: "bold", color: form.usageType==="Donated"?"#059669":"black" }}>Charity (Free)</button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                            <div>
                                <label style={{fontSize:"0.8rem", fontWeight:"bold"}}>Blood Group</label>
                                <select style={{width:"100%", padding:"10px", borderRadius:"8px", border:"1px solid #ddd"}} value={form.bloodGroup} onChange={e=>setForm({...form, bloodGroup: e.target.value})}>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g}>{g}</option>)}</select>
                            </div>
                            <div>
                                <label style={{fontSize:"0.8rem", fontWeight:"bold"}}>Component</label>
                                <select style={{width:"100%", padding:"10px", borderRadius:"8px", border:"1px solid #ddd"}} value={form.component} onChange={e=>setForm({...form, component: e.target.value})}>{["Whole Blood", "Plasma", "Platelets"].map(c => <option key={c}>{c}</option>)}</select>
                            </div>
                        </div>

                        <div style={{ marginBottom: "12px" }}>
                            <label style={{fontSize:"0.8rem", fontWeight:"bold"}}>Quantity</label>
                            <input type="number" min="1" style={{width:"100%", padding:"10px", borderRadius:"8px", border:"1px solid #ddd"}} value={form.quantity} onChange={e=>setForm({...form, quantity: e.target.value})} />
                        </div>

                        {form.usageType === "Sold" && (
                            <div style={{ background: "#F9FAFB", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB", marginTop: "16px" }}>
                                 <label style={{fontSize:"0.75rem", fontWeight:"bold", color:"#6B7280"}}>TOTAL BILL AMOUNT</label>
                                 <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#111827" }}>₹ {form.price}</div>
                                 
                                 <label style={{fontSize:"0.75rem", fontWeight:"bold", color:"#6B7280", marginTop:"12px", display:"block"}}>HOSPITAL UPI ID (For QR)</label>
                                 <input 
                                    placeholder="e.g. hospital@okicici" 
                                    value={form.upiId} 
                                    onChange={e=>setForm({...form, upiId: e.target.value})}
                                    style={{width:"100%", padding:"10px", borderRadius:"8px", border:"1px solid #D1D5DB", marginTop:"4px"}}
                                 />
                            </div>
                        )}

                        <button onClick={handleProceed} style={{ width: "100%", padding: "14px", background: "#111827", color: "white", border: "none", borderRadius: "10px", marginTop: "24px", fontWeight: "bold", cursor: "pointer" }}>
                            {form.usageType === "Sold" ? "Proceed to Payment" : "Confirm Donation"}
                        </button>
                    </>
                ) : (
                    // --- STEP 2: QR CODE PAYMENT ---
                    <div style={{ textAlign: "center" }}>
                        <h2 style={{ margin: "0 0 10px 0" }}>Scan to Pay</h2>
                        <div style={{ background: "white", padding: "16px", border: "1px solid #E5E7EB", borderRadius: "16px", display: "inline-block", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                            <QRCode value={upiLink} size={180} />
                        </div>
                        <h3 style={{ margin: "16px 0", color: "#166534" }}>₹ {form.price}</h3>
                        
                        <div style={{ textAlign: "left", marginTop: "20px" }}>
                            <label style={{fontSize:"0.8rem", fontWeight:"bold", color:"#374151"}}>
                                ENTER TRANSACTION ID
                            </label>

                            <input 
                                type="text"
                                placeholder="12 Digit UTI / Transaction ID" 
                                value={form.txnId} 
                                
                                onChange={(e) => {
                                const value = e.target.value;

                                // Allow only digits and max 12 length
                                if (/^\d{0,12}$/.test(value)) {
                                    setForm({ ...form, txnId: value });
                                }
                                }}

                                maxLength={12}

                                style={{
                                width:"100%",
                                padding:"12px",
                                borderRadius:"8px",
                                border:"1px solid #D1D5DB",
                                marginTop:"4px",
                                fontSize:"1rem",
                                letterSpacing:"1px"
                                }}
                            />
                            </div>


                        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                             <button onClick={() => setStep(1)} style={{ flex: 1, padding: "12px", background: "white", border: "1px solid #D1D5DB", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Back</button>
                             <button 
                                onClick={finalSubmit} 
                                disabled={loading || form.txnId.length < 10}
                                style={{ flex: 2, padding: "12px", background: "#166534", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", opacity: form.txnId.length < 10 ? 0.5 : 1 }}
                             >
                                 {loading ? "Verifying..." : "Verify & Issue Blood"}
                             </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MODAL 3: HISTORY (Read-Only) ---
const HistoryModal = ({ patient, onClose }) => {
    const history = patient.bloodHistory || [];

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
            <div style={{ background: "white", padding: "24px", borderRadius: "20px", width: "500px", maxWidth: "90%", position: "relative", maxHeight: "80vh", overflowY: "auto" }}>
                <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, border: "none", background: "none", cursor: "pointer" }}><X size={20} /></button>
                <h2 style={{ margin: "0 0 4px 0" }}>Blood History</h2>
                <p style={{ margin: "0 0 20px 0", color: "#6B7280" }}>Record for {patient.name}</p>

                {history.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", background: "#F9FAFB", borderRadius: "12px", color: "#9CA3AF" }}>No history found.</div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {history.map((record, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB", background: "white" }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ fontWeight: "bold", color: "#111827" }}>{record.bloodGroup} {record.component}</span>
                                        <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "12px", background: record.usageType === "Sold" ? "#EFF6FF" : "#ECFDF5", color: record.usageType === "Sold" ? "#2563EB" : "#059669", fontWeight: "bold" }}>{record.usageType.toUpperCase()}</span>
                                    </div>
                                    <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#6B7280" }}>{new Date(record.date).toLocaleString()}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <span style={{ display: "block", fontWeight: "bold", fontSize: "1.1rem" }}>{record.quantity} Unit</span>
                                    {record.usageType === "Sold" && <span style={{ fontSize: "0.9rem", color: "#166534", fontWeight: "600" }}>₹ {record.price}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientManager;
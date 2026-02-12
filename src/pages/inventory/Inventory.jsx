import React, { useState, useEffect } from "react";
import TopBar from "../../components/layout/TopBar";
import { Plus, Filter, Search, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { theme } from "../../styles/theme";

// Service Imports
import { getInventory, addInventory, deleteInventoryItem } from "../../services/inventory.service";
import { getDonors } from "../../services/donor.service";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'history'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  const fetchInventory = async () => {
    try {
        const res = await getInventory();
        setItems(res.data.data);
    } catch (error) {
        console.error("Error fetching inventory");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleDelete = async (id) => {
      if(!window.confirm("Are you sure you want to delete this record permanently?")) return;
      try {
          await deleteInventoryItem(id);
          toast.success("Item Deleted");
          fetchInventory(); // Refresh
      } catch (error) {
          toast.error("Delete Failed");
      }
  };

  // --- FILTERING LOGIC ---
  const filteredItems = items.filter(item => {
      // 1. Tab Filter
      if (activeTab === "active") {
          // Show Available OR Untested items
          if (item.status === "out" || item.status === "expired") return false;
      } else {
          // Show History (Out/Expired)
          if (item.status === "available") return false;
      }

      // 2. Type Filter
      if (filterType !== "All" && item.inventoryType !== filterType) return false;

      // 3. Search Filter
      if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
              item.bloodGroup.toLowerCase().includes(searchLower) || 
              (item.bagId || "").toLowerCase().includes(searchLower) ||
              (item.unitId || "").toLowerCase().includes(searchLower)
          );
      }
      return true;
  });

  return (
    <div style={{ paddingBottom: "50px" }}>
      <TopBar title="Blood Inventory" />
      
      <div style={{ padding: "0 30px", maxWidth: "1600px", margin: "0 auto" }}>
          
          {/* Controls Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {/* Search */}
                  <div style={{ position: "relative" }}>
                      <Search size={18} color="#9CA3AF" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                      <input 
                        placeholder="Search Unit ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: "10px 10px 10px 40px", borderRadius: "8px", border: "1px solid #E5E7EB", width: "300px", outline: "none" }} 
                      />
                  </div>

                  {/* Type Filter */}
                  <div style={{ display: "flex", gap: "8px" }}>
                      {["All", "Whole Blood", "Plasma", "Red Cells (RBC)", "Platelets"].map(type => (
                          <button 
                            key={type} 
                            onClick={() => setFilterType(type)}
                            style={{ padding: "8px 12px", borderRadius: "6px", border: filterType===type ? `1px solid ${theme.colors.primary}` : "1px solid #E5E7EB", background: filterType===type ? "#FEF2F2" : "white", color: filterType===type ? theme.colors.primary : "#6B7280", fontSize: "0.85rem", cursor: "pointer" }}
                          >
                              {type}
                          </button>
                      ))}
                  </div>
              </div>

              <button 
                onClick={() => setShowAddModal(true)}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", background: "#EF4444", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 6px rgba(239, 68, 68, 0.2)" }}
              >
                  <Plus size={20} /> Add Stock
              </button>
          </div>

          {/* TABS */}
          <div style={{ display: "flex", borderBottom: "1px solid #E5E7EB", marginBottom: "24px" }}>
              <button 
                onClick={() => setActiveTab("active")}
                style={{ padding: "12px 24px", background: "none", border: "none", borderBottom: activeTab==="active" ? "3px solid #EF4444" : "3px solid transparent", fontWeight: "bold", color: activeTab==="active" ? "#EF4444" : "#6B7280", cursor: "pointer", fontSize: "1rem" }}
              >
                  Current Stock ({items.filter(i => i.status==="available").length})
              </button>
              <button 
                onClick={() => setActiveTab("history")}
                style={{ padding: "12px 24px", background: "none", border: "none", borderBottom: activeTab==="history" ? "3px solid #6B7280" : "3px solid transparent", fontWeight: "bold", color: activeTab==="history" ? "#374151" : "#9CA3AF", cursor: "pointer", fontSize: "1rem" }}
              >
                  History & Logs
              </button>
          </div>

          {/* GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {filteredItems.map(item => {
                  const isUntested = item.isTested === false;
                  
                  return (
                    <div key={item._id} style={{ background: "white", borderRadius: "12px", border: "1px solid #E5E7EB", padding: "20px", position: "relative", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", transition: "all 0.2s" }}>
                        
                        {/* Header Badge */}
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#6B7280", textTransform: "uppercase" }}>{item.inventoryType}</span>
                            {isUntested ? (
                                <span style={{ background: "#FEF3C7", color: "#D97706", padding: "2px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}><AlertTriangle size={12}/> UNTESTED</span>
                            ) : (
                                <span style={{ background: "#ECFDF5", color: "#059669", padding: "2px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}><CheckCircle size={12}/> SAFE</span>
                            )}
                        </div>

                        {/* Main Content */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px" }}>
                            <div>
                                <div style={{ fontSize: "2.5rem", fontWeight: "800", color: "#111827", lineHeight: "1" }}>{item.bloodGroup}</div>
                                <div style={{ fontSize: "0.9rem", color: "#6B7280", marginTop: "8px", fontWeight: "bold" }}>#{item.bagId || item.unitId || "N/A"}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontWeight: "bold", color: "#EF4444" }}>{item.quantity * 450} ml</div>
                                <div style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>Vol</div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px dashed #E5E7EB" }}>
                            <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                                Expires: <span style={{ fontWeight: "600", color: "#374151" }}>{new Date(item.expiryDate).toLocaleDateString()}</span>
                            </div>
                            
                            {/* DELETE BUTTON */}
                            <button 
                                onClick={() => handleDelete(item._id)}
                                title="Delete Item"
                                style={{ padding: "8px", background: "white", border: "1px solid #FEE2E2", borderRadius: "8px", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                onMouseOver={(e) => e.currentTarget.style.background = "#FEF2F2"}
                                onMouseOut={(e) => e.currentTarget.style.background = "white"}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Action for Untested */}
                        {isUntested && activeTab === "active" && (
                            <div style={{ marginTop: "12px", background: "#FFFBEB", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
                                <a href="/lab" style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#D97706", textDecoration: "none" }}>Go to Lab for Testing →</a>
                            </div>
                        )}
                    </div>
                  );
              })}
          </div>

          {filteredItems.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px", color: "#9CA3AF" }}>
                  <p>No items found in {activeTab} view.</p>
              </div>
          )}
      </div>

      {showAddModal && <AddInventoryModal onClose={() => setShowAddModal(false)} onSuccess={fetchInventory} />}
    </div>
  );
};

// --- ADD INVENTORY MODAL (Fixed Name Rendering) ---
const AddInventoryModal = ({ onClose, onSuccess }) => {
    const [donors, setDonors] = useState([]);
    const [form, setForm] = useState({ 
        donorId: "", 
        bloodGroup: "A+", 
        inventoryType: "Whole Blood", 
        quantity: 1, 
        expiryDate: "" 
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadDonors = async () => {
            try {
                const res = await getDonors();
                const donorList = res.data.data;
                setDonors(donorList);
                
                // Auto-select first donor
                if(donorList.length > 0) {
                    setForm(prev => ({ ...prev, donorId: donorList[0]._id }));
                }
            } catch (error) {
                console.error("Failed to load donors");
            }
        };
        loadDonors();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await addInventory(form);
            toast.success("Stock Added Successfully");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add stock");
        } finally { 
            setLoading(false); 
        }
    };

    const inputStyle = { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #D1D5DB", marginTop: "4px", fontSize: "0.95rem" };
    const labelStyle = { display: "block", marginTop: "12px", fontWeight: "bold", fontSize: "0.9rem", color: "#374151" };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
            <div style={{ background: "white", padding: "30px", borderRadius: "16px", width: "400px", maxWidth: "90%" }}>
                <h2 style={{ marginTop: 0, color: "#111827" }}>Add Manual Stock</h2>
                <p style={{ margin: "0 0 20px 0", color: "#6B7280", fontSize: "0.9rem" }}>Register blood collected from a donor.</p>
                
                <form onSubmit={handleSubmit}>
                    
                    {/* SELECT DONOR DROPDOWN (Fixed Display) */}
                    <label style={{...labelStyle, marginTop: 0}}>Select Donor</label>
                    <select 
                        required 
                        style={inputStyle} 
                        value={form.donorId} 
                        onChange={e=>setForm({...form, donorId: e.target.value})}
                    >
                        <option value="">-- Choose a Donor --</option>
                        {donors.map(d => {
                            // Logic to find the name properly
                            const displayName = d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim() || "Unknown Donor";
                            return (
                                <option key={d._id} value={d._id}>
                                    {displayName} ({d.bloodGroup || "?"})
                                </option>
                            );
                        })}
                    </select>

                    <label style={labelStyle}>Blood Group</label>
                    <select style={inputStyle} value={form.bloodGroup} onChange={e=>setForm({...form, bloodGroup: e.target.value})}>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g}>{g}</option>)}
                    </select>
                    
                    <label style={labelStyle}>Type</label>
                    <select style={inputStyle} value={form.inventoryType} onChange={e=>setForm({...form, inventoryType: e.target.value})}>
                        {["Whole Blood", "Plasma", "Red Cells (RBC)", "Platelets"].map(t => <option key={t}>{t}</option>)}
                    </select>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div>
                            <label style={labelStyle}>Quantity</label>
                            <input type="number" min="1" required style={inputStyle} value={form.quantity} onChange={e=>setForm({...form, quantity: e.target.value})} />
                        </div>
                        <div>
                            <label style={labelStyle}>Expiry Date</label>
                            <input type="date" required style={inputStyle} value={form.expiryDate} onChange={e=>setForm({...form, expiryDate: e.target.value})} />
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #D1D5DB", background: "white", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
                        <button disabled={loading} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", background: "#111827", color: "white", fontWeight: "bold", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
                            {loading ? "Adding..." : "Add Stock"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Inventory;
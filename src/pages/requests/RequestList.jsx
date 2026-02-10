import React, { useState, useEffect } from "react";
import { Plus, AlertTriangle, Eye, ArrowRight } from "lucide-react";
import { theme } from "../../styles/theme";
import { getRequests, updateRequestStatus } from "../../services/request.service";
import RequestModal from "../../components/common/RequestModal";
import { getCurrentUser } from "../../services/auth.service"; 
import toast from "react-hot-toast";
import DeliveryModal from "../../components/common/DeliveryModal";

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); 
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null); 
  const [selectedRequest, setSelectedRequest] = useState(null);

  const initiateApproval = (req) => {
      setSelectedRequest(req);
  };
  const finalizeApproval = async (deliveryData) => {
      try {
          await updateRequestStatus(selectedRequest._id, "approved", deliveryData);
          toast.success("Request Approved & Dispatched!");
          setSelectedRequest(null);
          fetchData();
      } catch (error) {
          toast.error("Failed to approve");
      }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await getCurrentUser();
      const currentUser = userRes.data.data.user;
      setUser(currentUser);

      const res = await getRequests(filter === "All" ? "" : filter);
      setRequests(res.data.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleStatusUpdate = async (id, newStatus) => {
    if(!window.confirm(`Are you sure you want to ${newStatus} this request?`)) return;

    try {
      await updateRequestStatus(id, newStatus);
      toast.success(`Request ${newStatus} successfully`);
      fetchData(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Update Failed");
    }
  };

  // Helper to check if I am the one who needs to approve
  const amIRecipient = (req) => {
      // Logic: If the request organization ID matches MY ID, it means it was sent TO me.
      // (Unless I assigned it to myself, but that's an edge case)
      return user?._id === req.organization?._id || user?._id === req.organization;
  };

  return (
    <div className="page-container" style={{ padding: "20px", maxWidth: "1600px", margin: "0 auto" }}>
      
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "700", color: theme.colors.textPrimary, margin: 0 }}>
            {user?.role === 'admin' ? "Global Request History" : "Request Manager"}
          </h1>
          <p style={{ color: theme.colors.textSecondary, marginTop: "4px" }}>
            {user?.role === 'admin' ? "Monitor all inter-hospital blood transfers." : "Manage incoming and outgoing requests."}
          </p>
        </div>

        {/* HIDE 'Request Blood' Button for Admin */}
        {user?.role !== 'admin' && (
          <button 
            onClick={() => setShowModal(true)}
            style={{ 
              display: "flex", alignItems: "center", gap: "8px",
              padding: "12px 20px", backgroundColor: theme.colors.primary, 
              color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer",
              boxShadow: theme.shadows.card
            }}
          >
            <Plus size={20} /> Request Blood
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", overflowX: "auto" }}>
        {["pending", "approved", "rejected", "All"].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: "10px 20px", borderRadius: "8px", cursor: "pointer", textTransform: "capitalize",
              border: filter === status ? `1px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
              backgroundColor: filter === status ? "#FEF2F2" : "white",
              color: filter === status ? theme.colors.primary : theme.colors.textSecondary,
              fontWeight: filter === status ? "600" : "500"
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {requests.map((req) => {
            const isIncoming = amIRecipient(req); 
            const isAdmin = user?.role === 'admin';

            return (
              <div key={req._id} style={{ 
                backgroundColor: "white", borderRadius: "12px", boxShadow: theme.shadows.card, padding: "20px",
                borderLeft: `4px solid ${req.priority === "Urgent" ? theme.colors.status.critical : theme.colors.primary}`
              }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ 
                    fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", 
                    color: req.priority === "Urgent" ? theme.colors.status.critical : "#6B7280",
                    display: "flex", alignItems: "center", gap: "4px"
                  }}>
                    {req.priority === "Urgent" && <AlertTriangle size={12} />} {req.priority} PRIORITY
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "#6B7280" }}>{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Transfer Info */}
                <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "#666" }}>
                        <span>From: <b>{req.requesterName}</b></span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: theme.colors.primary, marginTop: "4px" }}>
                        <ArrowRight size={16} />
                        <span>To: <b>{req.organization?.name || "Me"}</b></span>
                    </div>
                </div>

                {/* Blood Details */}
                <div style={{ padding: "12px", backgroundColor: "#F9FAFB", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <div>
                     <span style={{ display: "block", fontSize: "0.8rem", color: "#6B7280" }}>Required</span>
                     <strong style={{ fontSize: "1.1rem", color: theme.colors.textPrimary }}>{req.bloodGroup}</strong>
                   </div>
                   <div style={{ textAlign: "right" }}>
                     <span style={{ display: "block", fontSize: "0.8rem", color: "#6B7280" }}>{req.requestType}</span>
                     <strong style={{ fontSize: "1.1rem", color: theme.colors.textPrimary }}>{req.quantity} Units</strong>
                   </div>
                </div>

                {/* --- BUTTON LOGIC (THE FIX) --- */}
                
                {/* CASE 1: I am the Recipient (Sanjeevani) AND it is Pending -> Show Buttons */}
                {req.status === "pending" && isIncoming && !isAdmin && (
                  <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                    <button onClick={() => handleStatusUpdate(req._id, "rejected")} style={{ flex: 1, padding: "10px", border: "1px solid #EF4444", borderRadius: "8px", backgroundColor: "white", color: "#EF4444", fontWeight: "600", cursor: "pointer" }}>Reject</button>
                    <button onClick={() => initiateApproval(req)} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", backgroundColor: "#10B981", color: "white", fontWeight: "600", cursor: "pointer" }}>Approve</button>
                  </div>
                )}

                {/* CASE 2: I am the Sender (Requester) -> Show Waiting */}
                {req.status === "pending" && !isIncoming && !isAdmin && (
                    <div style={{ marginTop: "16px", padding: "10px", backgroundColor: "#EFF6FF", color: theme.colors.primary, borderRadius: "8px", textAlign: "center", fontSize: "0.9rem", fontWeight: "500" }}>
                        ⏳ Waiting for {req.organization?.name || "Hospital"} Response
                    </div>
                )}

                {/* CASE 3: Admin -> Show Read Only Badge */}
                {req.status === "pending" && isAdmin && (
                    <div style={{ marginTop: "16px", padding: "10px", backgroundColor: "#F3F4F6", color: "#6B7280", borderRadius: "8px", textAlign: "center", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <Eye size={16} /> Monitoring Transaction
                    </div>
                )}
                
                {/* CASE 4: Already Processed -> Show Status */}
                {req.status !== "pending" && (
                   <div style={{ marginTop: "16px", padding: "10px", borderRadius: "8px", textAlign: "center", fontWeight: "600", backgroundColor: req.status === "approved" ? "#D1FAE5" : "#FEE2E2", color: req.status === "approved" ? "#065F46" : "#B91C1C" }}>
                      {req.status.toUpperCase()}
                   </div>
                )}

                {/* CASE 5: SHOW DELIVERY INFO (If Approved) */}
              {req.status === "approved" && req.deliveryDetails && (
                  <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#166534", fontWeight: "700", fontSize: "0.9rem" }}>
                          <Truck size={16} /> Delivery In Progress
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#15803D" }}>
                          <p style={{ margin: "2px 0" }}>Driver: <b>{req.deliveryDetails.driverName}</b></p>
                          <p style={{ margin: "2px 0" }}>Phone: <b>{req.deliveryDetails.contactNumber}</b></p>
                          <p style={{ margin: "2px 0" }}>Vehicle: <b>{req.deliveryDetails.vehicleNumber}</b></p>
                          
                          {/* MAGIC LINK BUTTON (For Phase 4) */}
                          <button style={{ 
                              marginTop: "8px", width: "100%", padding: "6px", 
                              backgroundColor: "#DC2626", color: "white", border: "none", 
                              borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" 
                          }}>
                              Track Live Location 📍
                          </button>
                      </div>
                  </div>
              )}

                
              </div>
            );
        })}
      </div>

      {requests.length === 0 && !loading && (
         <div style={{ textAlign: "center", padding: "60px", color: "#9CA3AF" }}>
           No {filter} requests found.
         </div>
      )}


      {/* Delivery Modal */}
          {selectedRequest && (
              <DeliveryModal 
                 request={selectedRequest}
                 onClose={() => setSelectedRequest(null)}
                 onConfirm={finalizeApproval}
              />
          )}



      {showModal && <RequestModal onClose={() => setShowModal(false)} onSuccess={fetchData} />}
    </div>
  );
};

export default RequestList;
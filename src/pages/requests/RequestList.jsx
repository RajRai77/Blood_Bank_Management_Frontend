import React, { useState, useEffect } from "react";
import { Plus, Eye, Truck, Copy, Lock, MapPin, CreditCard } from "lucide-react";
import { theme } from "../../styles/theme";
import { getRequests, updateRequestStatus } from "../../services/request.service";
import { getCurrentUser } from "../../services/auth.service"; 
import toast from "react-hot-toast";
import { io } from "socket.io-client"; 

// Components
import RequestModal from "../../components/common/RequestModal";
import DeliveryModal from "../../components/common/DeliveryModal";
import DispatchDetailsModal from "../../components/common/DispatchDetailsModal";
import PaymentModal from "../../components/common/paymentModal"; // <--- IMPORT THIS

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); 
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null); 
  
  // Force Update State (for live timer)
  const [now, setNow] = useState(Date.now());

  // Modal States
  const [selectedRequest, setSelectedRequest] = useState(null); 
  const [selectedDispatch, setSelectedDispatch] = useState(null); 
  const [selectedPayment, setSelectedPayment] = useState(null); // <--- NEW STATE

  // --- 1. LIVE SOCKET & TIMER EFFECT ---
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);

    const LOCAL_IP = import.meta.env.VITE_LOCAL_IP || "localhost";
    const socket = io(`http://${LOCAL_IP}:8000`);

    socket.on("tracking_started", ({ orderId }) => {
        setRequests((prev) => prev.map(req => {
            if (req._id === orderId) {
                return { 
                    ...req, 
                    deliveryDetails: { ...req.deliveryDetails, trackingStarted: true } 
                };
            }
            return req;
        }));
        toast.success("Driver is Live! 🚚");
    });

    socket.on("delivery_completed", ({ orderId, completedAt }) => {
        setRequests((prev) => prev.map(req => {
            if (req._id === orderId || (req.deliveryDetails && req._id === orderId)) { 
                return { 
                    ...req, 
                    status: "completed",
                    deliveryDetails: { 
                        ...req.deliveryDetails, 
                        completedAt: completedAt || new Date() 
                    } 
                };
            }
            return req;
        }));
        toast.success("Order Delivered Successfully! 🎉");
    });

    return () => {
        clearInterval(timer);
        socket.disconnect();
    };
  }, []);

  // --- 2. DATA FETCHING ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await getCurrentUser();
      setUser(userRes.data.data.user);

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

  // --- 3. ACTIONS ---
  const initiateApproval = (req) => setSelectedRequest(req);

  const finalizeApproval = async (deliveryData, paymentDetails) => {
      try {
          await updateRequestStatus(selectedRequest._id, "approved", deliveryData, paymentDetails);
          toast.success("Request Approved & Dispatched!");
          setSelectedRequest(null);
          fetchData();
      } catch (error) {
          // Extract specific error from backend (e.g., "Insufficient Stock")
          const errorMsg = error.response?.data?.message || "Failed to approve request";
          toast.error(errorMsg);
      }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if(!window.confirm(`Are you sure you want to ${newStatus} this request?`)) return;
    try {
      await updateRequestStatus(id, newStatus);
      toast.success(`Request ${newStatus} successfully`);
      fetchData(); 
    } catch (error) {
      toast.error("Update Failed");
    }
  };

  const amIRecipient = (req) => {
      return user?._id === req.organization?._id || user?._id === req.organization;
  };

  const copyTrackingLink = (id) => {
      const LOCAL_IP = import.meta.env.VITE_LOCAL_IP || "localhost";
      const link = `http://${LOCAL_IP}:5173/track/${id}`;
      navigator.clipboard.writeText(link);
      toast.success("Tracking Link Copied!");
  };

  const getUnlockStatus = (arrivalDate) => {
      if(!arrivalDate) return "UNLOCKED";
      
      const arrival = new Date(arrivalDate).getTime();
      const unlockTime = arrival - (60 * 60 * 1000); 
      const diff = unlockTime - now; 

      if(diff <= 0) return "UNLOCKED";

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      let timeString = "Link generates in: ";
      if (days > 0) timeString += `${days}d `;
      timeString += `${hours}h ${minutes}m ${seconds}s`;

      return timeString;
  };

  return (
    <div className="page-container" style={{ padding: "20px", maxWidth: "1600px", margin: "0 auto" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "700", color: theme.colors.textPrimary, margin: 0 }}>
            {user?.role === 'admin' ? "Global Request History" : "Request Manager"}
          </h1>
          <p style={{ color: theme.colors.textSecondary, marginTop: "4px" }}>
            {user?.role === 'admin' ? "Monitor transactions." : "Manage incoming and outgoing requests."}
          </p>
        </div>
        {user?.role !== 'admin' && (
          <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", backgroundColor: theme.colors.primary, color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", boxShadow: theme.shadows.card }}>
            <Plus size={20} /> Request Blood
          </button>
        )}
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", overflowX: "auto" }}>
        {["pending", "approved", "rejected", "completed", "All"].map(status => (
          <button key={status} onClick={() => setFilter(status)} style={{ padding: "10px 20px", borderRadius: "8px", cursor: "pointer", textTransform: "capitalize", border: filter === status ? `1px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`, backgroundColor: filter === status ? "#FEF2F2" : "white", color: filter === status ? theme.colors.primary : theme.colors.textSecondary, fontWeight: filter === status ? "600" : "500" }}>
            {status}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
        {requests.map((req) => {
            const isIncoming = amIRecipient(req); 
            const isAdmin = user?.role === 'admin';
            const unlockStatus = getUnlockStatus(req.deliveryDetails?.estimatedArrival);
            const isLinkReady = unlockStatus === "UNLOCKED";
            const isLive = req.deliveryDetails?.trackingStarted;
            const isCompleted = req.status === "completed";

            // CHECK: Is Payment Pending?
            const showPayButton = !isIncoming && req.status === "approved" && req.payment?.status === "Pending";

            return (
              <div key={req._id} style={{ backgroundColor: "white", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", padding: "24px", border: "1px solid #E5E7EB", position: "relative", overflow: "hidden" }}>
                
                {req.priority === "Urgent" && <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "6px", backgroundColor: theme.colors.status.critical }}></div>}

                {/* 1. Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px", paddingLeft: req.priority === "Urgent" ? "12px" : "0" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#9CA3AF", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" }}>{isIncoming ? "INCOMING REQUEST" : "OUTGOING REQUEST"}</span>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#111827", margin: "4px 0 0 0" }}>{isIncoming ? req.requesterName : `To: ${req.organization?.name || "Blood Bank"}`}</h3>
                  </div>
                  <div style={{ padding: "6px 12px", borderRadius: "50px", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", 
                      backgroundColor: isCompleted ? "#ECFDF5" : req.status === "approved" ? "#ECFDF5" : req.status === "rejected" ? "#FEF2F2" : "#FFFBEB", 
                      color: isCompleted ? "#065F46" : req.status === "approved" ? "#065F46" : req.status === "rejected" ? "#DC2626" : "#D97706", 
                      border: `1px solid ${isCompleted ? "#10B981" : req.status === "approved" ? "#10B981" : req.status === "rejected" ? "#EF4444" : "#F59E0B"}` 
                  }}>
                    {req.status}
                  </div>
                </div>

                {/* 2. Info */}
                <div style={{ display: "flex", gap: "16px", marginBottom: "20px", paddingLeft: req.priority === "Urgent" ? "12px" : "0" }}>
                   <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Patient</p>
                      <p style={{ margin: 0, fontWeight: "600", color: "#374151" }}>{req.patientName}</p>
                   </div>
                   <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Group</p>
                      <p style={{ margin: 0, fontWeight: "800", color: "#111827", fontSize: "1.1rem" }}>{req.bloodGroup}</p>
                   </div>
                   <div style={{ flex: 1, textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Amount</p>
                      <p style={{ margin: 0, fontWeight: "600", color: "#374151" }}>{req.quantity} Unit</p>
                   </div>
                </div>

                {/* 3. Actions */}
                
                {/* CASE A: PENDING (Dispatcher) */}
                {req.status === "pending" && isIncoming && !isAdmin && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <button onClick={() => handleStatusUpdate(req._id, "rejected")} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #EF4444", color: "#EF4444", backgroundColor: "white", fontWeight: "600", cursor: "pointer" }}>Decline</button>
                    <button onClick={() => initiateApproval(req)} style={{ padding: "12px", borderRadius: "8px", border: "none", color: "white", backgroundColor: "#10B981", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.3)" }}>Approve & Schedule</button>
                  </div>
                )}

                {/* CASE B: PENDING (Requester) */}
                {req.status === "pending" && !isIncoming && !isAdmin && (
                    <div style={{ padding: "12px", backgroundColor: "#FEF9C3", color: "#854D0E", borderRadius: "8px", textAlign: "center", fontSize: "0.85rem", fontWeight: "600" }}>⏳ Waiting for Hospital Approval</div>
                )}

                {/* CASE C: ADMIN */}
                {req.status === "pending" && isAdmin && (
                    <div style={{ padding: "10px", backgroundColor: "#F3F4F6", color: "#6B7280", borderRadius: "8px", textAlign: "center", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><Eye size={16} /> Monitoring Transaction</div>
                )}

                {/* CASE D: APPROVED (Dispatcher View) */}
                {req.status === "approved" && isIncoming && (
                   <div style={{ backgroundColor: "#F9FAFB", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                         <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                             <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: isLive ? "#EF4444" : "#F59E0B" }}></span>
                             <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#4B5563" }}>
                                {isLive ? "LIVE TRACKING ACTIVE" : "DISPATCH PENDING"}
                             </span>
                         </div>
                         <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>ETA: {new Date(req.deliveryDetails?.estimatedArrival).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                      
                      {isLive ? (
                          <button onClick={() => setSelectedDispatch(req)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#EF4444", color: "white", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 10px rgba(239, 68, 68, 0.3)" }}>
                             <MapPin size={18} className="animate-bounce" /> Track Live Location
                          </button>
                      ) : (
                          !isLinkReady ? (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", backgroundColor: "#F3F4F6", borderRadius: "8px", color: "#6B7280", fontSize: "0.9rem", fontWeight: "600" }}>
                                  <Lock size={16} /> <span style={{ fontFamily: "monospace" }}>{unlockStatus}</span>
                              </div>
                          ) : (
                              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                                  <button onClick={() => copyTrackingLink(req._id)} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #D1D5DB", backgroundColor: "white", color: "#374151", fontSize: "0.9rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                      <Copy size={16} /> Copy Driver Link
                                  </button>
                                  <div style={{ fontSize: "0.75rem", textAlign: "center", color: "#9CA3AF" }}>Share this link with driver to start tracking</div>
                              </div>
                          )
                      )}
                   </div>
                )}

                {/* CASE E: APPROVED (Receiver View) - MODIFIED FOR PAYMENT */}
                {req.status === "approved" && !isIncoming && (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                       {/* 1. Payment Button (Only if Pending) */}
                       {showPayButton && (
                           <button 
                               onClick={() => setSelectedPayment(req)}
                               style={{ width: "100%", padding: "12px", backgroundColor: "#2563EB", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                           >
                               <CreditCard size={18} /> Pay ₹{req.payment?.amount} Now
                           </button>
                       )}

                       {/* 2. Payment Done Badge (Optional but good) */}
                       {req.payment?.status === "Paid" && (
                           <div style={{ textAlign: "center", fontSize: "0.8rem", color: "#059669", fontWeight: "bold", padding: "8px", backgroundColor: "#D1FAE5", borderRadius: "8px" }}>
                               ✓ Payment Verified
                           </div>
                       )}

                       {/* 3. View Dispatch Button */}
                       <button onClick={() => setSelectedDispatch(req)} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", backgroundColor: "#111827", color: "white", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
                         <Truck size={18} /> View Dispatch Details
                       </button>
                   </div>
                )}

                {/* CASE F: COMPLETED (Delivered Stamp) */}
                {isCompleted && (
                   <div style={{ position: "relative", backgroundColor: "#F0FDF4", padding: "16px", borderRadius: "12px", border: "1px solid #BBF7D0", overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-15deg)", border: "4px solid #22c55e", color: "#22c55e", fontSize: "1.5rem", fontWeight: "900", padding: "10px 20px", borderRadius: "8px", opacity: 0.2, pointerEvents: "none", textTransform: "uppercase" }}>Delivered</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
                         <div>
                             <h4 style={{ margin: 0, color: "#166534" }}>Delivery Complete</h4>
                             <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#15803D" }}>{new Date(req.deliveryDetails?.completedAt).toLocaleString()}</p>
                         </div>
                         <button onClick={() => setSelectedDispatch(req)} style={{ padding: "8px 16px", backgroundColor: "white", border: "1px solid #166534", borderRadius: "6px", color: "#166534", fontWeight: "600", cursor: "pointer" }}>View Details</button>
                      </div>
                   </div>
                )}

              </div>
            );
        })}
      </div>

      {requests.length === 0 && !loading && <div style={{ textAlign: "center", padding: "60px", color: "#9CA3AF" }}>No {filter} requests found.</div>}

      {/* MODALS */}
      {showModal && <RequestModal onClose={() => setShowModal(false)} onSuccess={fetchData} />}
      {selectedRequest && <DeliveryModal request={selectedRequest} onClose={() => setSelectedRequest(null)} onConfirm={finalizeApproval} />}
      {selectedDispatch && <DispatchDetailsModal request={selectedDispatch} onClose={() => setSelectedDispatch(null)} />}
      
      {/* ADDED PAYMENT MODAL */}
      {selectedPayment && <PaymentModal request={selectedPayment} onClose={() => setSelectedPayment(null)} onSuccess={fetchData} />}

    </div>
  );
};

export default RequestList;
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Navigation, Lock, CheckCircle, Send, MapPin, User } from "lucide-react";
import axios from "axios";

const LOCAL_IP = import.meta.env.VITE_LOCAL_IP || "localhost";
const socket = io(`http://${LOCAL_IP}:8000`);

const DriverTrack = () => {
  const { id } = useParams();
  const [status, setStatus] = useState("Connecting...");
  const [otp, setOtp] = useState("");
  const [isDelivered, setIsDelivered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // 1. Fetch Public Details
    const fetchDetails = async () => {
        try {
            const res = await axios.get(`http://${LOCAL_IP}:8000/api/v1/requests/${id}/public`);
            // Safety check for data structure
            if (res.data && res.data.data) {
                setOrderDetails(res.data.data);
            }
        } catch (error) {
            console.error("Error loading details:", error);
            setStatus("Error loading order info");
        }
    };
    fetchDetails();

    // 2. Socket & GPS
    socket.emit("join_tracking", id);
    if (!navigator.geolocation) {
        setStatus("GPS Not Supported");
        return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if(isDelivered) return;
        const { latitude, longitude } = position.coords;
        setStatus("Live Tracking Active 🟢");
        socket.emit("send_location", { orderId: id, latitude, longitude });
      },
      (error) => setStatus("Waiting for GPS..."),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [id, isDelivered]);

  const handleVerify = async () => {
      if(otp.length !== 4) return;
      try {
          setLoading(true);
          // Send OTP as string explicitly
          await axios.post(`http://${LOCAL_IP}:8000/api/v1/requests/${id}/verify-otp`, { 
              otp: String(otp) 
          });
          setIsDelivered(true);
      } catch (error) {
          alert("Incorrect OTP. Please check with receiver.");
          setOtp("");
      } finally {
          setLoading(false);
      }
  };

  if (isDelivered) {
      return (
          <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#064E3B", color: "white", padding: "20px" }}>
              <div style={{ padding: "30px", backgroundColor: "#065F46", borderRadius: "50%", marginBottom: "20px", boxShadow: "0 0 30px rgba(16, 185, 129, 0.4)" }}>
                 <CheckCircle size={60} />
              </div>
              <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: "0 0 10px 0" }}>Delivered!</h1>
              <p style={{ opacity: 0.8 }}>Great work. You can close this tab.</p>
          </div>
      );
  }

  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column", backgroundColor: "#111827", color: "white", fontFamily: "sans-serif", overflowX: "hidden" }}>
      
      {/* --- ORDER INFO CARD --- */}
      <div style={{ padding: "20px", background: "linear-gradient(180deg, #1F2937 0%, #111827 100%)", borderBottom: "1px solid #374151" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
             <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", margin: 0, color: "#E5E7EB" }}>
                    {orderDetails?.organization?.name || "Loading Hospital..."}
                </h2>
                <p style={{ fontSize: "0.85rem", color: "#9CA3AF", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    <MapPin size={14} /> {orderDetails?.organization?.address || "Address loading..."}
                </p>
             </div>
             <div style={{ backgroundColor: "#374151", padding: "6px 12px", borderRadius: "8px", textAlign: "center" }}>
                 <span style={{ display: "block", fontSize: "0.7rem", color: "#9CA3AF" }}>AMOUNT</span>
                 <span style={{ display: "block", fontSize: "1rem", fontWeight: "bold", color: "#F87171" }}>
                    {orderDetails?.quantity || 0} Unit
                 </span>
             </div>
          </div>

          <div style={{ display: "flex", gap: "10px", backgroundColor: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "10px" }}>
              <User size={18} color="#9CA3AF" />
              <div>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "#9CA3AF" }}>PATIENT</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>
                      {orderDetails?.patientName || "Loading..."} 
                      {orderDetails?.bloodGroup && ` (${orderDetails.bloodGroup})`}
                  </span>
              </div>
          </div>
          <div style={{ marginTop: "16px", padding: "12px", background: "#374151", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div>
        <span style={{ fontSize: "0.75rem", color: "#9CA3AF", display: "block" }}>PAYMENT STATUS</span>
        <span style={{ fontSize: "1rem", fontWeight: "bold", color: orderDetails?.payment?.method === "COD" ? "#F87171" : "#34D399" }}>
            {orderDetails?.payment?.method === "COD" ? "Collect Cash" : "Paid Online"}
        </span>
    </div>
    <div style={{ textAlign: "right" }}>
        <span style={{ fontSize: "0.75rem", color: "#9CA3AF", display: "block" }}>AMOUNT</span>
        <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: "white" }}>₹{orderDetails?.payment?.amount}</span>
    </div>
</div>
      </div>

      {/* --- MAP STATUS --- */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: "180px" }}>
          <div style={{ position: "relative" }}>
             <div style={{ width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 2s infinite" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 25px rgba(16, 185, 129, 0.4)" }}>
                   <Navigation size={40} fill="white" color="white" />
                </div>
             </div>
          </div>
          <h2 style={{ marginTop: "30px", fontSize: "1.5rem", fontWeight: "bold" }}>En Route</h2>
          <div style={{ marginTop: "10px", padding: "6px 12px", backgroundColor: "#1F2937", borderRadius: "20px", fontSize: "0.9rem", color: "#10B981", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
             {status}
          </div>
          <p style={{ marginTop: "10px", fontSize: "0.75rem", color: "#6B7280" }}>ID: #{id.slice(-6).toUpperCase()}</p>
      </div>

      {/* --- OTP SHEET (FIXED BOTTOM - Button Below) --- */}
      <div style={{ 
          position: "fixed", bottom: 0, left: 0, right: 0,
          backgroundColor: "#1F2937", 
          padding: "24px", 
          borderTopLeftRadius: "24px", 
          borderTopRightRadius: "24px", 
          boxShadow: "0 -10px 40px rgba(0,0,0,0.5)",
          zIndex: 50
      }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
             <Lock size={20} color="#9CA3AF" />
             <span style={{ fontSize: "1rem", fontWeight: "600", color: "#E5E7EB" }}>Complete Delivery</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
             {/* Input */}
             <input 
               type="tel" 
               maxLength="4" 
               placeholder="Enter 4-Digit OTP"
               value={otp}
               onChange={(e) => setOtp(e.target.value)}
               style={{ 
                   width: "100%",
                   backgroundColor: "#374151", 
                   color: "white", 
                   border: "2px solid #4B5563", 
                   borderRadius: "12px", 
                   fontSize: "1.5rem", 
                   fontWeight: "bold", 
                   textAlign: "center", 
                   letterSpacing: "4px",
                   height: "60px",
                   outline: "none"
               }}
             />
             
             {/* Button (Now Below) */}
             <button 
               onClick={handleVerify}
               disabled={loading || otp.length !== 4}
               style={{ 
                   width: "100%", 
                   height: "55px", 
                   backgroundColor: "#10B981", 
                   borderRadius: "12px", 
                   border: "none", 
                   display: "flex", 
                   alignItems: "center", 
                   justifyContent: "center",
                   color: "white",
                   fontSize: "1.1rem",
                   fontWeight: "bold",
                   opacity: otp.length === 4 ? 1 : 0.5,
                   transition: "opacity 0.2s"
               }}
             >
                {loading ? <span className="animate-spin">⌛ Verifying...</span> : "Confirm Delivery"}
             </button>
          </div>
      </div>
    </div>
  );
};

export default DriverTrack;
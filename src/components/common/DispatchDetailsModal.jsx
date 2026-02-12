import React, { useState, useEffect } from "react";
import { X, Truck, Phone, User, Clock, ShieldCheck, Copy, Lock, Eye, EyeOff } from "lucide-react";
import { theme } from "../../styles/theme";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import toast from "react-hot-toast";

// --- FIX LEAFLET DEFAULT ICON ISSUE ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- SOCKET CONNECTION ---
const LOCAL_IP = import.meta.env.VITE_LOCAL_IP || "localhost";
const socket = io(`http://${LOCAL_IP}:8000`);

// Helper to auto-center map
const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng]); }, [lat, lng, map]);
  return null;
};

const DispatchDetailsModal = ({ request, onClose }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [liveLocation, setLiveLocation] = useState(null);
  const [showOtp, setShowOtp] = useState(false);

const user = JSON.parse(localStorage.getItem("user") || "{}");
  const requesterIdString = typeof request.requesterId === 'object' 
        ? request.requesterId._id 
        : request.requesterId;
  const isReceiver = user._id === requesterIdString;
  const isCompleted = request.status === "completed";

  // --- 2. TIMER LOGIC ---
  useEffect(() => {
    if(isCompleted) return;
    const checkTimer = () => {
      if (!request.deliveryDetails?.estimatedArrival) return;
      const arrival = new Date(request.deliveryDetails.estimatedArrival).getTime();
      const unlockTime = arrival - (60 * 60 * 1000);
      const diff = unlockTime - Date.now();

      if (diff <= 0) { setIsLocked(false); setTimeLeft("LIVE"); } 
      else {
        setIsLocked(true);
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    };
    const timer = setInterval(checkTimer, 1000);
    checkTimer();
    return () => clearInterval(timer);
  }, [request]);

  // --- 3. SOCKET LOGIC ---
  useEffect(() => {
    if (isLocked) return;
    socket.emit("join_tracking", request._id);
    socket.on("update_location", (data) => setLiveLocation({ lat: data.latitude, lng: data.longitude }));
    return () => socket.off("update_location");
  }, [isLocked, request._id]);

  const copyLink = () => {
      const url = `http://${LOCAL_IP}:5173/track/${request._id}`; 
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
  };

const copyOtp = (e) => {
    e.stopPropagation();
    
    // Safety check: Ensure deliveryDetails exists before accessing OTP
    const otp = request?.deliveryDetails?.deliveryOTP; 
    
    if (!otp) {
        toast.error("OTP not generated yet");
        return;
    }
    
    navigator.clipboard.writeText(otp);
    toast.success("OTP Copied!");
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1300 }}>
      <div style={{ backgroundColor: "white", borderRadius: "20px", width: "600px", maxWidth: "95vw", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
        
        {/* --- MAP HEADER --- */}
        <div style={{ height: "300px", position: "relative", background: "#E5E7EB" }}>
           
           {isCompleted ? (
               // 1. COMPLETED STATE (Green Map Placeholder)
               <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#ECFDF5", color: "#065F46" }}>
                   <div style={{ padding: "20px", background: "white", borderRadius: "50%", marginBottom: "16px", boxShadow: "0 10px 20px rgba(16, 185, 129, 0.2)" }}>
                       <ShieldCheck size={48} color="#10B981" />
                   </div>
                   <h2 style={{ margin: 0 }}>Delivery Successful</h2>
                   <p style={{ margin: "4px 0 0", opacity: 0.8 }}>Trip Ended at {new Date(request.deliveryDetails.completedAt).toLocaleTimeString()}</p>
               </div>
           ) : isLocked ? (
               // 2. LOCKED STATE
               <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
                   <Lock size={40} style={{ marginBottom: "12px", opacity: 0.5 }} />
                   <h3>Tracking Locked</h3>
                   <p>Unlocks in: <b>{timeLeft}</b></p>
               </div>
           ) : liveLocation ? (
               // 3. LIVE MAP
               <MapContainer center={[liveLocation.lat, liveLocation.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
                   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                   <Marker position={[liveLocation.lat, liveLocation.lng]}><Popup>Driver</Popup></Marker>
                   <Recenter lat={liveLocation.lat} lng={liveLocation.lng} />
               </MapContainer>
           ) : (
               // 4. WAITING STATE
               <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
                   <div className="animate-pulse" style={{ color: "#F59E0B", marginBottom: "10px" }}><Truck size={40} /></div>
                   <h3>Waiting for Driver...</h3>
                   <button onClick={copyLink} style={{ marginTop: "16px", padding: "8px 16px", background: "white", border: "1px solid #ddd", borderRadius: "8px", fontWeight: "600", display: "flex", gap: "8px" }}><Copy size={16}/> Copy Link</button>
               </div>
           )}

           <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "white", borderRadius: "50%", width: "32px", height: "32px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}><X size={20}/></button>
        </div>

        {/* --- BODY --- */}
        <div style={{ padding: "24px" }}>
           
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
              <InfoBox label="Driver" value={request.deliveryDetails?.driverName} icon={<User size={18}/>} />
              <InfoBox label="Vehicle" value={request.deliveryDetails?.vehicleNumber} icon={<Truck size={18}/>} />
              <InfoBox label="Contact" value={request.deliveryDetails?.contactNumber} icon={<Phone size={18}/>} />
              <InfoBox label="Est. Arrival" value={new Date(request.deliveryDetails?.estimatedArrival).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} icon={<Clock size={18}/>} />
           </div>

          {/* --- OTP SECURITY CARD (FIXED) --- */}
           {isReceiver && !isCompleted && (
              <div 
                onClick={() => setShowOtp(!showOtp)}
                style={{ 
                  marginBottom: "20px", padding: "20px", 
                  backgroundColor: "#FFFBEB", // Solid Light Yellow
                  border: "2px dashed #F59E0B", // Dashed Border
                  borderRadius: "16px", cursor: "pointer",
                  position: "relative", overflow: "hidden", transition: "all 0.2s"
                }}
              >
                  <div style={{ textAlign: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#B45309", letterSpacing: "1px", textTransform: "uppercase" }}>
                        🔐 Delivery Confirmation Code
                      </span>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
                     <div style={{ 
                        fontSize: "2.5rem", fontWeight: "900", letterSpacing: "8px", color: "#111827", 
                        fontFamily: "monospace", filter: showOtp ? "none" : "blur(12px)", transition: "all 0.3s"
                     }}>
                        {/* SAFE DATA ACCESS */}
                        {request.deliveryDetails?.deliveryOTP || "****"}
                     </div>
                  </div>
                  
                  {!showOtp && (
                    <div style={{ marginTop: "8px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.8rem", color: "#92400E", fontWeight: "600" }}>Tap to Reveal</span>
                    </div>
                  )}

                  {showOtp && (
                     <div style={{ marginTop: "8px", textAlign: "center" }}>
                        <button onClick={copyOtp} style={{ background: "none", border: "none", color: "#B45309", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Copy size={14}/> Copy Code
                        </button>
                     </div>
                  )}
              </div>
           )}
           {/* Completed Stamp */}
           {isCompleted && (
              <div style={{ padding: "12px", backgroundColor: "#ECFDF5", border: "1px solid #10B981", borderRadius: "8px", textAlign: "center", color: "#065F46", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                   <ShieldCheck size={20} /> DELIVERED
              </div>
           )}

           {request.deliveryDetails?.notes && (
              <div style={{ backgroundColor: "#F9FAFB", padding: "16px", borderRadius: "12px", borderLeft: `4px solid ${theme.colors.primary}` }}>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "0.85rem", color: "#6B7280", textTransform: "uppercase" }}>Instructions</h4>
                <p style={{ margin: 0, fontSize: "0.95rem", color: "#374151", fontStyle: "italic" }}>"{request.deliveryDetails.notes}"</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

const InfoBox = ({ label, value, icon }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
     <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>{icon}</div>
     <div>
       <span style={{ display: "block", fontSize: "0.7rem", color: "#9CA3AF", fontWeight: "700", textTransform: "uppercase" }}>{label}</span>
       <span style={{ display: "block", fontSize: "0.95rem", color: "#111827", fontWeight: "600" }}>{value}</span>
     </div>
  </div>
);

export default DispatchDetailsModal;
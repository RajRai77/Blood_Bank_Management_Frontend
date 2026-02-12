import React, { useState } from "react";
import QRCode from "react-qr-code";
import { X, CreditCard, Banknote, AlertTriangle, ShieldAlert } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { submitPayment } from "../../services/request.service";

const PaymentModal = ({ request, onClose, onSuccess }) => {
  const [method, setMethod] = useState("Online"); // 'Online' | 'COD'
  const [txnId, setTxnId] = useState("");
  const [loading, setLoading] = useState(false);

  // Generate UPI Link
  const upiLink = `upi://pay?pa=${request.payment?.upiId}&pn=${request.organization?.name}&am=${request.payment?.amount}&cu=INR`;

  // --- 1. STRICT VALIDATION: Numbers Only, Max 12 ---
  const handleTxnChange = (e) => {
      const value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric
      if (value.length <= 12) {
          setTxnId(value);
      }
  };

  const handleSubmit = async () => {
      if (method === "Online" && txnId.length !== 12) {
          toast.error("Transaction ID must be exactly 12 digits");
          return;
      }

      try {
          setLoading(true);
          
          // 2. USE THE SERVICE (Clean & handled correctly)
          await submitPayment(request._id, {
              method,
              transactionId: txnId
          });

          toast.success("Payment Details Submitted!");
          onSuccess();
          onClose();
      } catch (error) {
          console.error(error);
          toast.error(error.response?.data?.message || "Failed to submit payment");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1400 }}>
      <div style={{ background: "white", padding: "24px", borderRadius: "16px", width: "420px", position: "relative", maxWidth: "90%" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, border: "none", background: "none", cursor: "pointer" }}><X size={20} /></button>
        
        <h2 style={{ marginTop: 0, fontSize: "1.4rem" }}>Complete Payment</h2>
        <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#166534", marginBottom: "20px" }}>₹ {request.payment?.amount}</div>

        {/* Toggle Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button onClick={() => setMethod("Online")} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: method==="Online"?"2px solid #2563EB":"1px solid #ddd", background: method==="Online"?"#EFF6FF":"white", fontWeight: "bold", color: method==="Online"?"#2563EB":"#666", cursor: "pointer" }}>Online (UPI)</button>
            <button onClick={() => setMethod("COD")} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: method==="COD"?"2px solid #166534":"1px solid #ddd", background: method==="COD"?"#F0FDF4":"white", fontWeight: "bold", color: method==="COD"?"#166534":"#666", cursor: "pointer" }}>Pay on Delivery</button>
        </div>

        {method === "Online" ? (
            <div style={{ textAlign: "center" }}>
                {request.payment?.upiId ? (
                    <>
                        <div style={{ background: "white", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "12px", display: "inline-block", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                            <QRCode value={upiLink} size={140} />
                        </div>
                        <p style={{ fontSize: "0.85rem", color: "#6B7280", margin: "12px 0" }}>Scan using GPay / Paytm / PhonePe</p>
                        
                        <div style={{ textAlign: "left" }}>
                            <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#374151", marginBottom: "4px", display: "block" }}>UPI Transaction ID (12 Digits)</label>
                            <input 
                                placeholder="Example: 405612348899" 
                                value={txnId} 
                                onChange={handleTxnChange} 
                                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: txnId.length === 12 ? "2px solid #10B981" : "1px solid #ccc", fontSize: "1rem", letterSpacing: "1px", outline: "none" }}
                            />
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                                <span style={{ fontSize: "0.75rem", color: txnId.length === 12 ? "#10B981" : "#EF4444", fontWeight: "600" }}>{txnId.length}/12</span>
                            </div>
                        </div>

                        {/* --- 3. WARNING MESSAGE --- */}
                        <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#FFF7ED", border: "1px solid #FDBA74", borderRadius: "8px", display: "flex", gap: "10px", alignItems: "start", textAlign: "left" }}>
                            <ShieldAlert size={20} color="#C2410C" style={{ flexShrink: 0, marginTop: "2px" }} />
                            <div>
                                <p style={{ margin: "0 0 2px 0", fontSize: "0.85rem", fontWeight: "700", color: "#9A3412" }}>Verification Notice</p>
                                <p style={{ margin: 0, fontSize: "0.75rem", color: "#9A3412", lineHeight: "1.3" }}>
                                    Please ensure the Transaction ID is correct. All payments are <b>manually verified</b> against bank records. Submission of fake details may lead to strict action.
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <p style={{ color: "red", padding: "20px", background: "#FEF2F2", borderRadius: "8px" }}>Error: Hospital provided no UPI ID.</p>
                )}
            </div>
        ) : (
            <div style={{ textAlign: "center", padding: "30px 20px", background: "#F3F4F6", borderRadius: "12px" }}>
                <Banknote size={48} color="#166534" style={{ marginBottom: "10px" }} />
                <p style={{ fontSize: "1rem", color: "#374151" }}>Please pay <b>₹{request.payment?.amount}</b> in cash to the driver upon delivery.</p>
            </div>
        )}

        <button 
            onClick={handleSubmit} 
            disabled={loading || (method==="Online" && txnId.length !== 12)} 
            style={{ 
                width: "100%", padding: "14px", 
                background: (method==="Online" && txnId.length !== 12) ? "#9CA3AF" : "#111827", 
                color: "white", border: "none", borderRadius: "10px", marginTop: "20px", 
                fontWeight: "bold", cursor: (method==="Online" && txnId.length !== 12) ? "not-allowed" : "pointer",
                transition: "background 0.3s"
            }}
        >
            {loading ? "Processing..." : "Confirm Payment"}
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
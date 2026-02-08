import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droplet, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { login } from "../../services/auth.service";
import { theme } from "../../styles/theme";
import React from "react"; // <--- THIS WAS MISSING


const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Call the API
      const response = await login(formData);
      
      // 2. Success Feedback
      toast.success(`Welcome back, ${response.data.user.name}!`);
      
      // 3. Redirect to Dashboard
      navigate("/");
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F3F4F6", // Light gray bg
      backgroundImage: "radial-gradient(#E5E7EB 1px, transparent 1px)", // Subtle dots
      backgroundSize: "20px 20px"
    }}>
      <div style={{
        backgroundColor: "#FFFFFF",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        width: "100%",
        maxWidth: "420px"
      }}>
        {/* Logo Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px", height: "56px",
            backgroundColor: "#FEE2E2", // Light Red
            borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px auto",
            color: theme.colors.primary
          }}>
            <Droplet size={32} fill="currentColor" />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#111827" }}>
            eBloodCare
          </h2>
          <p style={{ color: "#6B7280", marginTop: "8px" }}>
            Blood Bank Management System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
              Email or Username
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={20} color="#9CA3AF" style={{ position: "absolute", left: "12px", top: "10px" }} />
              <input
                type="email"
                required
                placeholder="admin@hospital.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{
                  width: "100%",
                  padding: "10px 10px 10px 40px", // Space for icon
                  borderRadius: "8px",
                  border: "1px solid #D1D5DB",
                  outline: "none",
                  fontSize: "0.95rem",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                onBlur={(e) => e.target.style.borderColor = "#D1D5DB"}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={20} color="#9CA3AF" style={{ position: "absolute", left: "12px", top: "10px" }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{
                  width: "100%",
                  padding: "10px 10px 10px 40px",
                  borderRadius: "8px",
                  border: "1px solid #D1D5DB",
                  outline: "none",
                  fontSize: "0.95rem"
                }}
                onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                onBlur={(e) => e.target.style.borderColor = "#D1D5DB"}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: theme.colors.primary,
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              transition: "background-color 0.2s"
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = theme.colors.primaryHover)}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = theme.colors.primary)}
          >
            {loading ? (
              "Signing in..."
            ) : (
              <>
                <Lock size={18} /> Secure Login
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #E5E7EB", textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", color: "#6B7280" }}>
            Unauthorized access is prohibited and monitored.<br/>
            Contact Technical Support ↗
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
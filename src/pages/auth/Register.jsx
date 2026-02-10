import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Droplet, UserPlus, Mail, Lock, Building, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { register } from "../../services/auth.service";
import { theme } from "../../styles/theme";


const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "hospital", // Default role
    phone: "",
    address: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(formData);
      toast.success("Registration Successful! Please Login.");
      navigate("/login");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "#F3F4F6", backgroundImage: "radial-gradient(#E5E7EB 1px, transparent 1px)", backgroundSize: "20px 20px"
    }}>
      <div style={{
        backgroundColor: "#FFFFFF", padding: "40px", borderRadius: "16px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", width: "100%", maxWidth: "500px"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px", height: "56px", backgroundColor: "#FEE2E2", borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", color: theme.colors.primary
          }}>
            <Droplet size={32} fill="currentColor" />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#111827" }}>Join eBloodCare</h2>
          <p style={{ color: "#6B7280", marginTop: "8px" }}>Create an account to manage blood inventory.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Name */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Organization / User Name</label>
            <div style={{ position: "relative" }}>
               <Building size={20} color="#9CA3AF" style={iconStyle} />
               <input required name="name" placeholder="City General Hospital" value={formData.name} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position: "relative" }}>
               <Mail size={20} color="#9CA3AF" style={iconStyle} />
               <input required type="email" name="email" placeholder="contact@hospital.com" value={formData.email} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
               <Lock size={20} color="#9CA3AF" style={iconStyle} />
               <input required type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* Role Selection */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Account Type</label>
            <select name="role" value={formData.role} onChange={handleChange} style={{ ...inputStyle, paddingLeft: "12px" }}>
              <option value="hospital">Hospital / Clinic</option>
              <option value="admin">Admin / Blood Bank</option>
              <option value="donor">Donor</option>
            </select>
          </div>

          {/* Phone & Address */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
             <div>
                <label style={labelStyle}>Phone</label>
                <div style={{ position: "relative" }}>
                   <Phone size={18} color="#9CA3AF" style={iconStyle} />
                   <input required name="phone" placeholder="9876543210" value={formData.phone} onChange={handleChange} style={inputStyle} />
                </div>
             </div>
             <div>
                <label style={labelStyle}>City</label>
                <div style={{ position: "relative" }}>
                   <MapPin size={18} color="#9CA3AF" style={iconStyle} />
                   <input required name="address" placeholder="Mumbai" value={formData.address} onChange={handleChange} style={inputStyle} />
                </div>
             </div>
          </div>

          <button 
            type="submit" disabled={loading}
            style={{ 
              width: "100%", padding: "12px", backgroundColor: theme.colors.primary, color: "#FFFFFF",
              border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "1rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
            }}
          >
            {loading ? "Creating Account..." : <><UserPlus size={20} /> Register Account</>}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <p style={{ fontSize: "0.9rem", color: "#6B7280" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: theme.colors.primary, fontWeight: "600", textDecoration: "none" }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const labelStyle = { display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "8px" };
const iconStyle = { position: "absolute", left: "12px", top: "10px" };
const inputStyle = { width: "100%", padding: "10px 10px 10px 40px", borderRadius: "8px", border: "1px solid #D1D5DB", outline: "none", fontSize: "0.95rem" };

export default Register;
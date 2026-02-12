import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MapPin,
  Phone,
  Calendar,
  UserCheck,
  Clock,
} from "lucide-react";
import { theme } from "../../styles/theme";
import { Award } from "lucide-react";
import { getDonors } from "../../services/donor.service";
import RegisterDonorModal from "../../components/common/RegisterDonorModal";
import toast from "react-hot-toast";
import CertificateModal from "../../components/common/certificate.modal";
const DonorList = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [selectedDonorId, setSelectedDonorId] = useState(null);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const res = await getDonors(search);
      setDonors(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch donors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchDonors();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Donor ID Copied!");
  };

  return (
    <div
      className="page-container"
      style={{ padding: "20px", maxWidth: "1600px", margin: "0 auto" }}
    >
      {/* 1. Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: theme.colors.textPrimary,
              margin: 0,
            }}
          >
            Donor Registry
          </h1>
          <p style={{ color: theme.colors.textSecondary, marginTop: "4px" }}>
            Manage donor records and track eligibility.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            backgroundColor: theme.colors.primary,
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: theme.shadows.card,
          }}
        >
          <Plus size={20} /> Register New Donor
        </button>
      </div>

      {/* 2. Search Bar */}
      <div
        style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: theme.shadows.card,
          marginBottom: "24px",
        }}
      >
        <div style={{ position: "relative", maxWidth: "400px" }}>
          <Search
            size={20}
            color={theme.colors.textSecondary}
            style={{ position: "absolute", left: "12px", top: "12px" }}
          />
          <input
            type="text"
            placeholder="Search by Name, Phone, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 12px 12px 40px",
              fontSize: "0.95rem",
              border: `1px solid ${theme.colors.border}`,
              borderRadius: "8px",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* 3. Responsive Grid of Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px",
        }}
      >
        {donors.map((donor) => (
          <div
            key={donor._id}
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: theme.shadows.card,
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              borderLeft: `4px solid ${theme.colors.primary}`,
            }}
          >
            {/* Header: ID and Group */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    margin: "0 0 4px 0",
                  }}
                >
                  {donor.firstName} {donor.lastName}
                </h3>
                <span
                  onClick={() => copyToClipboard(donor.donorId)}
                  style={{
                    fontSize: "0.85rem",
                    color: theme.colors.textSecondary,
                    backgroundColor: "#F3F4F6",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "inline-block",
                  }}
                  title="Click to Copy"
                >
                  {donor.donorId} 📋
                </span>
              </div>
              <button
                onClick={() => setSelectedDonorId(donor.donorId)}
                style={{
                  padding: "8px 12px",
                  background: "white",
                  color: "#2563EB",
                  border: "1px solid #2563EB",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.85rem",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#EFF6FF")
                }
                onMouseOut={(e) => (e.currentTarget.style.background = "white")}
              >
                <Award size={16} /> Certificate
              </button>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#FEE2E2",
                  color: theme.colors.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "800",
                  fontSize: "1.1rem",
                }}
              >
                {donor.bloodGroup}
              </div>
            </div>

            {/* Details */}
            <div
              style={{
                display: "grid",
                gap: "8px",
                fontSize: "0.9rem",
                color: "#4B5563",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Phone size={16} /> {donor.phone}
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <MapPin size={16} /> {donor.address || "No Address"}
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Calendar size={16} /> Age:{" "}
                {new Date().getFullYear() -
                  new Date(donor.dateOfBirth).getFullYear()}
              </div>
            </div>

            {/* Status Footer */}
            <div
              style={{
                marginTop: "auto",
                paddingTop: "12px",
                borderTop: "1px solid #F3F4F6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                className="badge"
                style={{
                  backgroundColor: "#D1FAE5",
                  color: "#065F46",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <UserCheck size={14} /> Eligible
              </span>
              <button
                style={{
                  fontSize: "0.85rem",
                  color: theme.colors.primary,
                  fontWeight: "600",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                View History →
              </button>
            </div>
          </div>
        ))}
      </div>

      {donors.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>
          No donors found. Try registering a new one.
        </div>
      )}

      {showModal && (
        <RegisterDonorModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchDonors}
        />
      )}

      {selectedDonorId && (
        <CertificateModal
          donorId={selectedDonorId}
          onClose={() => setSelectedDonorId(null)}
        />
      )}
    </div>
  );
};

export default DonorList;

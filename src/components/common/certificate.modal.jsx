import React, { useEffect, useState, useRef } from "react";
import { X, Printer, Download, Award, Share2 } from "lucide-react";
import { getCertificate } from "../../services/inventory.service";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

const CertificateModal = ({ donorId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const certificateRef = useRef(null);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await getCertificate(donorId);
        setData(res.data.data);
      } catch (error) {
        toast.error("Failed to generate certificate. Check Donor ID.");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    if (donorId) fetchCert();
  }, [donorId]);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    try {
        const canvas = await html2canvas(certificateRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("landscape", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Certificate-${data.donorName}.pdf`);
        toast.success("Certificate Downloaded!");
    } catch (err) {
        toast.error("Download failed");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", color:"white", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000}}>Generating Certificate...</div>;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1500 }}>
      <div style={{ position: "relative", width: "900px", maxWidth: "95vw" }}>
        
        {/* Actions Bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginBottom: "16px" }} className="no-print">
            <button onClick={handleDownload} style={{ padding: "10px 20px", background: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}><Download size={18} /> Download PDF</button>
            <button onClick={handlePrint} style={{ padding: "10px 20px", background: "#2563EB", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}><Printer size={18} /> Print</button>
            <button onClick={onClose} style={{ padding: "10px", background: "rgba(255,255,255,0.2)", color: "white", border: "none", borderRadius: "50%", cursor: "pointer" }}><X size={24} /></button>
        </div>

        {/* CERTIFICATE DESIGN */}
        <div ref={certificateRef} style={{ background: "white", padding: "40px", borderRadius: "10px", textAlign: "center", border: "10px double #111827", position: "relative", width: "100%", aspectRatio: "1.414/1" }}>
            
            {/* Watermark / Background Decoration */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.03, pointerEvents: "none" }}>
                <Award size={400} />
            </div>

            {/* Content */}
            <div style={{ border: "2px solid #D1D5DB", height: "100%", padding: "40px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                
                <h1 style={{ fontFamily: "serif", fontSize: "3.5rem", color: "#B91C1C", margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "2px" }}>Certificate</h1>
                <h2 style={{ fontFamily: "sans-serif", fontSize: "1.5rem", color: "#111827", margin: "0 0 30px 0", fontWeight: "300", letterSpacing: "4px" }}>OF APPRECIATION</h2>

                <p style={{ fontSize: "1.2rem", color: "#6B7280", margin: "0 0 20px 0" }}>This certificate is proudly presented to</p>

                <h2 style={{ fontSize: "2.5rem", fontFamily: "cursive", color: "#111827", borderBottom: "2px solid #111827", padding: "0 40px 10px 40px", marginBottom: "30px", minWidth: "400px" }}>
                    {data.donorName}
                </h2>

                <p style={{ fontSize: "1.1rem", color: "#4B5563", maxWidth: "600px", lineHeight: "1.6", marginBottom: "40px" }}>
                    For your selfless act of donating blood <b>({data.bloodGroup})</b>. Your contribution helps save lives and brings hope to our community. You are a true hero!
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", width: "80%", marginTop: "40px" }}>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "1.1rem" }}>{data.date}</p>
                        <div style={{ height: "1px", width: "200px", background: "#111827", margin: "0 auto" }}></div>
                        <p style={{ fontSize: "0.9rem", color: "#6B7280", marginTop: "8px" }}>DATE</p>
                    </div>

                    {/* Seal */}
                    <div style={{ width: "100px", height: "100px", borderRadius: "50%", border: "4px dashed #B91C1C", display: "flex", alignItems: "center", justifyContent: "center", color: "#B91C1C", fontWeight: "bold", transform: "rotate(-15deg)" }}>
                        <div style={{ textAlign: "center", fontSize: "0.8rem", lineHeight: "1.2" }}>OFFICIAL<br/>BLOOD BANK<br/>SEAL</div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                        <p style={{ margin: "0 0 8px 0", fontFamily: "cursive", fontSize: "1.5rem", color: "#111827" }}>Director Signature</p>
                        <div style={{ height: "1px", width: "200px", background: "#111827", margin: "0 auto" }}></div>
                        <p style={{ fontSize: "0.9rem", color: "#6B7280", marginTop: "8px" }}>SIGNATURE</p>
                    </div>
                </div>

                <div style={{ position: "absolute", bottom: "20px", fontSize: "0.8rem", color: "#9CA3AF" }}>
                    Certificate ID: {data.certId}
                </div>
            </div>
        </div>
      </div>
      
      {/* Hide everything else when printing */}
      <style>{`
        @media print {
            body * { visibility: hidden; }
            .no-print { display: none; }
            #root { display: none; }
            div[style*="position: fixed"] { position: absolute; inset: 0; background: white; }
            div[ref] { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 0; border: none; }
            div[ref] * { visibility: visible; }
        }
      `}</style>
    </div>
  );
};

export default CertificateModal;
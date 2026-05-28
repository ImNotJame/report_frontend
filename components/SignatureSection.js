import React from "react";

export default function SignatureSection({
  formData,
  setFormData,
  processSignature,
}) {
  return (
    <>
      <h2 style={{ marginTop: "3rem" }}>ลายเซ็น (Signatures)</h2>
      <div className="grid-2">
        <div
          className="form-group"
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <label>รายงานโดย (Reported By)</label>

          <div
            style={{
              border: "1.5px dashed var(--border-color)",
              borderRadius: "12px",
              padding: "0.75rem 1rem",
              background: "#f8fafc",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "80px",
              transition: "all 0.2s ease",
            }}
          >
            {!formData.reportedBySig ? (
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.25rem",
                  cursor: "pointer",
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  textTransform: "none",
                  letterSpacing: "normal",
                  textAlign: "center",
                }}
              >
                <span
                  style={{ color: "var(--primary-color)", fontWeight: "600" }}
                >
                  อัปโหลดรูปภาพลายเซ็น
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const processedSig = await processSignature(file);
                      setFormData((prev) => ({
                        ...prev,
                        reportedBySig: processedSig,
                      }));
                    }
                  }}
                  style={{ display: "none" }}
                />
              </label>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "0.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "50px",
                    width: "120px",
                  }}
                >
                  <img
                    src={formData.reportedBySig}
                    alt="Signature Preview"
                    style={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{
                    padding: "0.3rem 0.6rem",
                    fontSize: "0.75rem",
                    borderRadius: "8px",
                  }}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, reportedBySig: "" }))
                  }
                >
                  ลบลายเซ็น
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

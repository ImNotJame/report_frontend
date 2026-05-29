import React from "react";
import { Image as ImageIcon, Upload, X, Building, Plus } from "lucide-react";

export default function CompanyLogoSection({
  formData,
  handleChange,
  handleCompanyChange,
  handleLogoUpload,
  removeLogo,
  companiesList = [],
}) {
  const isNewCompany = formData.companyId === "ADD_NEW";

  return (
    <>
      <div
        className="section-header"
        style={{
          marginTop: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ImageIcon size={20} /> โลโก้บริษัท (Company Logo)
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          marginTop: "1rem",
          background: "var(--bg-card)",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
        }}
      >
        <div className="input-group">
          <label htmlFor="companyId" style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Building size={16} /> Select Company (เลือกบริษัท)
          </label>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <select
              id="companyId"
              name="companyId"
              value={formData.companyId || ""}
              onChange={handleCompanyChange}
              className="input-field"
              style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}
            >
              <option value="">-- กรุณาเลือกบริษัท (Please select a company) --</option>
              {companiesList.map((c) => (
                <option key={c.c_id} value={c.c_id}>
                  {c.c_name}
                </option>
              ))}
              <option value="ADD_NEW">+ เพิ่มบริษัทใหม่ (Add new company)</option>
            </select>

            {!isNewCompany && formData.companyId && formData.CL && (
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  overflow: "hidden",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <img
                  src={formData.CL}
                  alt="Company Logo"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {isNewCompany && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start", marginTop: "1rem" }}>
            <div className="input-group">
              <label htmlFor="companyName" style={{ fontWeight: 600 }}>
                New Company Name (ชื่อบริษัทใหม่)
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName || ""}
                onChange={handleChange}
                placeholder="กรุณากรอกชื่อบริษัทใหม่..."
                autoFocus
                className="input-field"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: 600 }}>Upload Company Logo</label>
              {formData.companyLogo ? (
                <div
                  style={{
                    position: "relative",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    width: "200px",
                    height: "150px",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <img
                    src={formData.companyLogo.preview}
                    alt="Company Logo Preview"
                    style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff" }}
                  />
                  <button
                    onClick={removeLogo}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      background: "rgba(239, 68, 68, 0.9)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "200px",
                    height: "150px",
                    border: "2px dashed #cbd5e1",
                    borderRadius: "8px",
                    cursor: "pointer",
                    color: "#64748b",
                    transition: "all 0.2s ease",
                    backgroundColor: "#f8fafc",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary-color)";
                    e.currentTarget.style.color = "var(--primary-color)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#cbd5e1";
                    e.currentTarget.style.color = "#64748b";
                  }}
                >
                  <Upload size={24} style={{ marginBottom: "0.5rem" }} />
                  <span style={{ fontSize: "0.9rem" }}>อัปโหลดโลโก้</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

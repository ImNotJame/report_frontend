import React from "react";
import { Camera, Plus, X } from "lucide-react";

export default function PhotoReportSection({
  formData,
  handleChange,
  handlePhotoUpload,
  removePhoto,
}) {
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
          <Camera size={20} /> Photo Report (รูปภาพประกอบ)
        </h2>
        <label
          className="btn btn-primary"
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Plus size={16} /> อัปโหลดรูปภาพ
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: "none" }}
          />
        </label>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
          background: "var(--bg-card)",
          padding: "1.5rem",
          borderRadius: "12px",
          minHeight: formData.photos.length > 0 ? "auto" : "100px",
          border: "2px dashed #e2e8f0",
          position: "relative",
        }}
      >
        {formData.photos.length === 0 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#94a3b8",
              textAlign: "center",
            }}
          >
            <Camera
              size={32}
              style={{ marginBottom: "0.5rem", opacity: 0.5 }}
            />
            <p>ยังไม่มีรูปภาพ (กรุณาอัปโหลด)</p>
          </div>
        )}
        {formData.photos.map((photo, idx) => (
          <div
            key={idx}
            style={{
              position: "relative",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          >
            <img
              src={photo.data}
              alt={photo.name}
              style={{ width: "100%", height: "150px", objectFit: "cover" }}
            />
            <button
              onClick={() => removePhoto(idx)}
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
        ))}
      </div>

      {/* Premium Checkbox Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          background: "var(--bg-color)",
          border: "1.5px solid var(--border-color)",
          borderRadius: "12px",
          padding: "1rem 1.25rem",
          marginTop: "1.5rem",
          marginBottom: "2rem",
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: "var(--shadow-sm)",
          width: "fit-content",
        }}
        className="checkbox-container"
      >
        <input
          type="checkbox"
          id="hasAttachment"
          name="hasAttachment"
          checked={formData.hasAttachment || false}
          onChange={handleChange}
          style={{
            width: "18px",
            height: "18px",
            cursor: "pointer",
            accentColor: "var(--primary-color)",
          }}
        />
        <label
          htmlFor="hasAttachment"
          style={{
            display: "inline-block",
            margin: 0,
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: "600",
            color: "var(--text-primary)",
          }}
        >
          มีเอกสารแนบ (Has Attachment)
        </label>
      </div>
    </>
  );
}

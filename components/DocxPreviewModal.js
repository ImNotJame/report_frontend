import React from "react";
import { FileDown, X } from "lucide-react";

export default function DocxPreviewModal({
  previewBlob,
  setPreviewBlob,
  setPreviewFilename,
  confirmDownload,
  previewPdfUrl,
  isPreviewPdfLoading,
  isUploadingConfirm = false,
  exportStatus = "",
}) {
  if (!previewBlob) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <div
        style={{
          background: "var(--surface-color)",
          border: "1px solid var(--border-color)",
          borderRadius: "24px",
          width: "95vw",
          maxWidth: "1200px",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "1.5rem 2rem",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#ffffff",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FileDown size={22} style={{ color: "var(--primary-color)" }} />
              ตรวจสอบตัวอย่างเอกสาร Word (.docx) ก่อนดาวน์โหลด
            </h3>
          </div>
          <button
            onClick={() => {
              setPreviewBlob(null);
              setPreviewFilename("");
            }}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-secondary)",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#e2e8f0";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content - Document Viewer */}
        <div
          style={{
            flex: 1,
            position: "relative",
            background: "#f8fafc",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 0,
          }}
        >
          {isPreviewPdfLoading ? (
            <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "4px solid rgba(72, 117, 184, 0.1)",
                  borderTop: "4px solid var(--primary-color)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 1rem auto",
                }}
              />
              <p style={{ fontWeight: 500 }}>
                กำลังเตรียมตัวอย่างเอกสาร... (Preparing preview...)
              </p>
            </div>
          ) : previewPdfUrl ? (
            <iframe
              src={`${previewPdfUrl}#toolbar=0&navpanes=0`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          ) : (
            <div style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
              ไม่สามารถโหลดตัวอย่างได้ (Could not load preview)
            </div>
          )}
        </div>


        {/* Modal Footer */}
        <div
          style={{
            padding: "1.5rem 2rem",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
            background: "#ffffff",
          }}
        >
          <button
            className="btn btn-outline"
            onClick={() => {
              setPreviewBlob(null);
              setPreviewFilename("");
            }}
            style={{ borderRadius: "12px" }}
            disabled={isUploadingConfirm}
          >
            ย้อนกลับไปแก้ไข (Cancel)
          </button>
          <button
            className="btn btn-primary"
            onClick={confirmDownload}
            disabled={isUploadingConfirm}
            style={{
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)",
            }}
          >
            {isUploadingConfirm ? (
              <>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.2)",
                    borderTop: "2px solid white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    display: "inline-block",
                    marginRight: "8px",
                    verticalAlign: "middle"
                  }}
                />
                {exportStatus || "กำลังบันทึกข้อมูล... (Uploading...)"}
              </>
            ) : (
              <>
                <FileDown size={18} /> ยืนยันดาวน์โหลดเอกสาร (Confirm Download)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Custom stylesheet */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

"use client";

import React from "react";
import { saveAs } from "file-saver";
import { Printer, FileDown } from "lucide-react";

import { useDailyReportForm } from "../hooks/useDailyReportForm";
import { generateDocxBlob } from "../utils/docxGenerator";
import { buildWorkSessionExportPayload } from "../utils/workSessionExport";

import ProjectInfoSection from "../components/ProjectInfoSection";
import ProjectPlanSection from "../components/ProjectPlanSection";
import JobDetailsSection from "../components/JobDetailsSection";
import WorkersSection from "../components/WorkersSection";
import PhotoReportSection from "../components/PhotoReportSection";
import SignatureSection from "../components/SignatureSection";
import DocxPreviewModal from "../components/DocxPreviewModal";
import CompanyLogoSection from "@/components/CompanyLogoSection";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");
const PDF_RETRY_DELAYS_MS = [600, 1500];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isLikelyTransientDetail = (detail = "") => {
  const normalized = String(detail).toLowerCase();
  const transientPatterns = [
    "ssl connection has been closed unexpectedly",
    "connection has been closed unexpectedly",
    "connection closed",
    "connection reset",
    "timeout",
    "timed out",
    "temporarily unavailable",
  ];
  return transientPatterns.some((pattern) => normalized.includes(pattern));
};

const parseErrorResponse = async (response) => {
  let detail = "";
  try {
    const json = await response.clone().json();
    if (typeof json?.detail === "string") {
      detail = json.detail;
    } else if (json?.detail) {
      detail = JSON.stringify(json.detail);
    } else if (typeof json?.error === "string") {
      detail = json.error;
    } else {
      detail = JSON.stringify(json);
    }
  } catch (jsonErr) {
    try {
      detail = await response.text();
    } catch (textErr) {
      detail = response.statusText || "";
    }
  }
  return detail;
};

export default function DailyReportForm() {
  const formState = useDailyReportForm();

  const handleExportPDF = async () => {
    formState.setIsExportingPDF(true);
    try {
      await formState.uploadCompanyLogo();
      const updatedFormData = await formState.uploadPendingPhotos();
      const docxBlob = await generateDocxBlob(
        updatedFormData,
        formState.plans,
        formState.jobEntries
      );
      formState.setExportTarget("pdf");
      formState.setPreviewBlob(docxBlob);
      formState.setPreviewFilename(
        `Daily_Report_${updatedFormData.workDate}.pdf`
      );
    } catch (error) {
      if (error.properties && error.properties.errors) {
        const errorMessages = error.properties.errors
          .map((e) => `${e.properties.explanation} (Tag: ${e.properties.xtag})`)
          .join("\n");
        console.error("Template Errors:", errorMessages);
        alert("Template Error found in your Word file:\n\n" + errorMessages);
      } else {
        console.error("Error:", error);
        alert("Failed to generate report. Check console for details.");
      }
    } finally {
      formState.setIsExportingPDF(false);
    }
  };

  const handleExportDocx = async () => {
    formState.setIsExportingDocx(true);
    try {
      await formState.uploadCompanyLogo();
      const updatedFormData = await formState.uploadPendingPhotos();
      const out = await generateDocxBlob(
        updatedFormData,
        formState.plans,
        formState.jobEntries
      );
      formState.setExportTarget("docx");
      formState.setPreviewBlob(out);
      formState.setPreviewFilename(
        `Daily_Report_${updatedFormData.workDate}.docx`
      );
    } catch (error) {
      if (error.properties && error.properties.errors) {
        const errorMessages = error.properties.errors
          .map((e) => `${e.properties.explanation} (Tag: ${e.properties.xtag})`)
          .join("\n");
        console.error("Template Errors:", errorMessages);
        alert("Template Error found in your Word file:\n\n" + errorMessages);
      } else {
        console.error("Docxtemplater Error:", error);
        alert("Failed to generate DOCX. Check console for details.");
      }
    } finally {
      formState.setIsExportingDocx(false);
    }
  };

  return (
    <div className="container">
      <div className="glass-card">
        <h1
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            DAILY REPORT FORM
          </span>
          รายงานความคืบหน้าประจำวัน
        </h1>

        <ProjectInfoSection
          formData={formState.formData}
          handleChange={formState.handleChange}
        />

        <CompanyLogoSection
          formData={formState.formData}
          handleChange={formState.handleChange}
          handleCompanyChange={formState.handleCompanyChange}
          handleLogoUpload={formState.handleLogoUpload}
          removeLogo={formState.removeLogo}
          companiesList={formState.companiesList}
        />

        <ProjectPlanSection
          plans={formState.plans}
          formData={formState.formData}
          addLocation={formState.addLocation}
          removeLocation={formState.removeLocation}
          addTask={formState.addTask}
          removeTask={formState.removeTask}
          handlePlanChange={formState.handlePlanChange}
          handleTaskChange={formState.handleTaskChange}
        />

        <JobDetailsSection
          jobEntries={formState.jobEntries}
          addJobEntry={formState.addJobEntry}
          removeJobEntry={formState.removeJobEntry}
          handleJobEntryChange={formState.handleJobEntryChange}
        />

        <WorkersSection
          formData={formState.formData}
          handleChange={formState.handleChange}
          getWorkerCount={formState.getWorkerCount}
          addWorker={formState.addWorker}
          removeWorker={formState.removeWorker}
        />

        <PhotoReportSection
          formData={formState.formData}
          handleChange={formState.handleChange}
          handlePhotoUpload={formState.handlePhotoUpload}
          removePhoto={formState.removePhoto}
        />



        <SignatureSection
          formData={formState.formData}
          setFormData={formState.setFormData}
          processSignature={formState.processSignature}
        />

        <div className="actions-bar" style={{ marginTop: "2rem" }}>
          <button className="btn btn-outline" onClick={handleExportDocx}>
            <FileDown size={20} /> Export Word (.docx)
          </button>
          <button className="btn btn-primary" onClick={handleExportPDF}>
            <Printer size={20} /> Export PDF (.pdf)
          </button>
        </div>

        {/* PDF Export Loading Overlay */}
        {formState.isExportingPDF && (
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
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              animation: "fadeIn 0.3s ease-out",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.5rem",
                background: "var(--surface-color, #ffffff)",
                padding: "2.5rem 3rem",
                borderRadius: "24px",
                color: "var(--text-primary, #1e293b)",
                boxShadow:
                  "var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1))",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "4px solid #e2e8f0",
                  borderTop: "4px solid var(--primary-color, #4875B8)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              <div style={{ textAlign: "center" }}>
                <h3
                  style={{
                    margin: "0 0 0.5rem 0",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                  }}
                >
                  กำลังสร้างไฟล์ PDF...
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-secondary, #64748b)",
                    fontSize: "0.9rem",
                  }}
                >
                  กรุณารอสักครู่ (Please wait)
                </p>
              </div>
            </div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* DOCX Export Loading Overlay */}
        {formState.isExportingDocx && (
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
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              animation: "fadeIn 0.3s ease-out",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.5rem",
                background: "var(--surface-color, #ffffff)",
                padding: "2.5rem 3rem",
                borderRadius: "24px",
                color: "var(--text-primary, #1e293b)",
                boxShadow:
                  "var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1))",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "4px solid #e2e8f0",
                  borderTop: "4px solid var(--primary-color, #4875B8)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              <div style={{ textAlign: "center" }}>
                <h3
                  style={{
                    margin: "0 0 0.5rem 0",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                  }}
                >
                  กำลังสร้างไฟล์ Word...
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-secondary, #64748b)",
                    fontSize: "0.9rem",
                  }}
                >
                  กรุณารอสักครู่ (Please wait)
                </p>
              </div>
            </div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Premium DOCX Preview Modal */}
        <DocxPreviewModal
          previewBlob={formState.previewBlob}
          setPreviewBlob={formState.setPreviewBlob}
          setPreviewFilename={formState.setPreviewFilename}
          confirmDownload={formState.confirmDownload}
          previewPdfUrl={formState.previewPdfUrl}
          isPreviewPdfLoading={formState.isPreviewPdfLoading}
        />
      </div>
    </div>
  );
}

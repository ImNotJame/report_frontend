import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import {
  buildWorkSessionExportPayload,
  recordWorkSessionExport,
} from "../utils/workSessionExport";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");

export function useDocumentExport(
  formData,
  setFormData,
  plans,
  jobEntries,
  uploadCompanyLogo,
  exportStatus,
  setExportStatus
) {
  const [previewBlob, setPreviewBlob] = useState(null);
  const [previewFilename, setPreviewFilename] = useState("");
  const [exportTarget, setExportTarget] = useState("docx");
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [isPreviewPdfLoading, setIsPreviewPdfLoading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isUploadingConfirm, setIsUploadingConfirm] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPdfPreview = async () => {
      if (!previewBlob) {
        if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
        setPreviewPdfUrl(null);
        return;
      }

      setIsPreviewPdfLoading(true);
      try {
        const uploadData = new FormData();
        uploadData.append("file", previewBlob, "preview.docx");

        const res = await fetch(`${API_BASE_URL}/convert-docx-to-pdf`, {
          method: "POST",
          body: uploadData,
        });

        if (!res.ok) {
          throw new Error(`Failed to generate PDF preview: ${res.statusText}`);
        }

        const pdfBlob = await res.blob();
        if (isMounted) {
          const url = URL.createObjectURL(pdfBlob);
          setPreviewPdfUrl(url);
        }
      } catch (err) {
        console.error("Error fetching PDF preview:", err);
      } finally {
        if (isMounted) {
          setIsPreviewPdfLoading(false);
        }
      }
    };

    fetchPdfPreview();

    return () => {
      isMounted = false;
    };
  }, [previewBlob]);

  const uploadPendingPhotos = async (companyUpdates = {}) => {
    const updatedPhotos = [];
    const pendingPhotosCount = formData.photos.filter((p) => p.file).length;
    let uploadedCount = 0;

    for (const photo of formData.photos) {
      if (photo.file) {
        uploadedCount++;
        setExportStatus(`กำลังอัปโหลดรูปภาพงาน (รูปที่ ${uploadedCount} จาก ${pendingPhotosCount})... (Uploading photo ${uploadedCount} of ${pendingPhotosCount}...)`);
        const formDataUpload = new FormData();
        formDataUpload.append("file", photo.file);
        try {
          const response = await fetch(`${API_BASE_URL}/upload-picture`, {
            method: "POST",
            body: formDataUpload,
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(
              error.detail
                ? typeof error.detail === "string"
                  ? error.detail
                  : JSON.stringify(error.detail)
                : error.error || "Upload failed"
            );
          }
          const result = await response.json();
          updatedPhotos.push({ data: result.url, name: photo.name });
        } catch (err) {
          console.error("error uploading pending photo", err);
          updatedPhotos.push(photo);
        }
      } else {
        updatedPhotos.push(photo);
      }
    }

    setFormData((prev) => ({
      ...prev,
      ...companyUpdates,
      photos: updatedPhotos,
    }));
    return {
      ...formData,
      ...companyUpdates,
      photos: updatedPhotos,
    };
  };

  const confirmDownload = async () => {
    if (previewBlob) {
      if (exportTarget === "pdf" && !previewPdfUrl) {
        alert("กรุณารอสักครู่ กำลังสร้างไฟล์ PDF... (Please wait, PDF is generating...)");
        return;
      }
      setIsUploadingConfirm(true);
      setExportStatus("กำลังเตรียมตัวบันทึกข้อมูลและอัปโหลดไฟล์... (Preparing upload...)");
      try {
        const companyUpdates = await uploadCompanyLogo();
        const updatedFormData = await uploadPendingPhotos(companyUpdates);

        setExportStatus("กำลังบันทึกประวัติรายงาน... (Saving report history...)");
        await recordWorkSessionExport(
          buildWorkSessionExportPayload({
            exportType: exportTarget,
            filename: previewFilename,
            formData: updatedFormData,
            plans,
            jobEntries,
          })
        );
        if (exportTarget === "pdf") {
          saveAs(previewPdfUrl, previewFilename);
        } else {
          saveAs(previewBlob, previewFilename);
        }
        setPreviewBlob(null);
        setPreviewFilename("");
      } catch (err) {
        console.error("Failed to store work session:", err);
        alert("Failed to store work session: " + err.message);
      } finally {
        setIsUploadingConfirm(false);
        setExportStatus("");
      }
    }
  };

  return {
    previewBlob,
    setPreviewBlob,
    previewFilename,
    setPreviewFilename,
    exportTarget,
    setExportTarget,
    previewPdfUrl,
    isPreviewPdfLoading,
    isExportingPDF,
    setIsExportingPDF,
    isExportingDocx,
    setIsExportingDocx,
    isUploadingConfirm,
    setIsUploadingConfirm,
    confirmDownload,
    uploadPendingPhotos,
  };
}

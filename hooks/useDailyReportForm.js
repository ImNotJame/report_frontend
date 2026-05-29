import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import {
  buildWorkSessionExportPayload,
  recordWorkSessionExport,
} from "../utils/workSessionExport";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");

export function useDailyReportForm() {
  const [formData, setFormData] = useState({
    companyId: "",
    companyName: "",
    companyLogo: null,
    projectName: "",
    workDate: new Date().toISOString().split("T")[0],
    remarks: "",
    obstacles: "",
    weather: "ปลอดโปร่ง",
    workersForeman: [],
    workersElectrician: [],
    workersIT: [],
    workersMason: [],
    workersWelder: [],
    workersPlumber: [],
    workersOthers: [],
    workersRemarks: "",
    reportedBy: "",
    checkedBy: "",
    photos: [], // Array of { data: base64, name: string }
    hasAttachment: false,
  });

  const [plans, setPlans] = useState([]);

  const [jobEntries, setJobEntries] = useState([]);

  const [previewBlob, setPreviewBlob] = useState(null);
  const [previewFilename, setPreviewFilename] = useState("");
  const [exportTarget, setExportTarget] = useState("docx");
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [isPreviewPdfLoading, setIsPreviewPdfLoading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isUploadingConfirm, setIsUploadingConfirm] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [companiesList, setCompaniesList] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/companies`);
        if (res.ok) {
          const data = await res.json();
          setCompaniesList(data);
        }
      } catch (err) {
        console.error("Failed to fetch companies", err);
      }
    };
    fetchCompanies();
  }, []);

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

  const confirmDownload = async () => {
    if (previewBlob) {
      if (exportTarget === "pdf" && !previewPdfUrl) {
        alert("กรุณารอสักครู่ กำลังสร้างไฟล์ PDF... (Please wait, PDF is generating...)");
        return;
      }
      setIsUploadingConfirm(true);
      setExportStatus("กำลังเตรียมตัวบันทึกข้อมูลและอัปโหลดไฟล์... (Preparing upload...)");
      try {
        // Defer actual uploads to R2 to only happen on confirm
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getWorkerCount = (names) => {
    if (!names) return 0;
    if (Array.isArray(names)) return names.length;
    return names.split(/[,，\s]+/).filter((n) => n.trim().length > 0).length;
  };

  const addWorker = (category, name) => {
    if (!name.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [category]: [...(prev[category] || []), name.trim()],
    }));
  };

  const removeWorker = (category, index) => {
    setFormData((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map((file) => ({
      file,
      data: URL.createObjectURL(file),
      name: file.name,
    }));

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));
  };


  const handleCompanyChange = (e) => {
    const value = e.target.value;

    if (value === "ADD_NEW") {
      setFormData((prev) => ({
        ...prev,
        companyId: "ADD_NEW",
        companyName: "",
        companyLogo: null,
        CL: null
      }));
      return;
    }


    const selectCompany = companiesList.find(
      (c) => String(c.c_id) === String(value) || String(c.id) === String(value)
    );

    if (selectCompany) {
      let backgroundLogoUrl = selectCompany.logo_url || `${API_BASE_URL}/get_logo/${value}`;

      if (backgroundLogoUrl.startsWith("/")) {
        backgroundLogoUrl = `${API_BASE_URL}${backgroundLogoUrl}`;
      }

      setFormData(prev => ({
        ...prev,
        companyId: value,
        companyName: selectCompany.c_name || selectCompany.name || "",
        CL: backgroundLogoUrl
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        companyId: value,
        companyName: "",
        CL: null
      }));
    }



  }







  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        companyLogo: {
          file,
          preview: URL.createObjectURL(file),
        },
      }));
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeLogo = () => {
    setFormData((prev) => ({
      ...prev,
      companyLogo: null,
    }));
  };

  const uploadCompanyLogo = async () => {
    try {
      let targetCompanyId = formData.companyId;
      let newCompanyName = formData.companyName;
      let uploadedLogoUrl = null;

      // If "ADD_NEW", create company first
      if (formData.companyId === "ADD_NEW" && formData.companyName) {
        setExportStatus("กำลังสร้างบริษัทใหม่... (Creating new company...)");
        const createRes = await fetch(`${API_BASE_URL}/add_company`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ c_name: formData.companyName }),
        });
        if (!createRes.ok) throw new Error("Failed to create company");
        const newCompany = await createRes.json();
        targetCompanyId = newCompany.c_id;
        newCompanyName = newCompany.c_name;

        // Update formData to point to new company
        setFormData(prev => ({ ...prev, companyId: targetCompanyId, companyName: newCompanyName }));
        // Refresh companies list
        fetch(`${API_BASE_URL}/companies`).then(res => res.json()).then(data => setCompaniesList(data));
      }

      // Then upload logo if present
      if (formData.companyLogo && formData.companyLogo.file && targetCompanyId && targetCompanyId !== "ADD_NEW") {
        setExportStatus("กำลังอัปโหลดโลโก้บริษัท... (Uploading company logo...)");
        const uploadData = new FormData();
        uploadData.append("file", formData.companyLogo.file);

        const response = await fetch(`${API_BASE_URL}/company_logo?c_id=${encodeURIComponent(targetCompanyId)}`, {
          method: "POST",
          body: uploadData,
        });
        if (!response.ok) {
          throw new Error("Failed to upload company logo");
        }
        const logoData = await response.json();
        uploadedLogoUrl = logoData.cl_file_url || `${API_BASE_URL}/get_logo/${targetCompanyId}`;
        if (uploadedLogoUrl.startsWith("/")) {
          uploadedLogoUrl = `${API_BASE_URL}${uploadedLogoUrl}`;
        }
        setFormData(prev => ({
          ...prev,
          CL: uploadedLogoUrl,
          companyLogo: prev.companyLogo ? { ...prev.companyLogo, file: null } : null
        }));
      }

      return {
        companyId: targetCompanyId,
        companyName: newCompanyName,
        CL: uploadedLogoUrl || formData.CL
      };
    } catch (err) {
      console.error("Error in company logo workflow:", err);
      // We don't throw here to avoid crashing the PDF export
    }
    return {
      companyId: formData.companyId,
      companyName: formData.companyName,
      CL: formData.CL
    };
  };

  const uploadPendingPhotos = async (companyUpdates = {}) => {
    const updatedPhotos = [];
    const pendingPhotosCount = formData.photos.filter(p => p.file).length;
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
          // If upload fails, we keep the local version so it's not lost
          updatedPhotos.push(photo);
        }
      } else {
        updatedPhotos.push(photo);
      }
    }

    setFormData((prev) => ({
      ...prev,
      ...companyUpdates,
      photos: updatedPhotos
    }));
    return {
      ...formData,
      ...companyUpdates,
      photos: updatedPhotos
    };
  };

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const addLocation = () => {
    setPlans([
      ...plans,
      {
        id: Date.now(),
        locationName: "",
        startDate: formData.workDate,
        endDate: formData.workDate,
        tasks: [],
      },
    ]);
  };

  const removeLocation = (locationId) => {
    setPlans(plans.filter((p) => p.id !== locationId));
  };

  const addTask = (locationId) => {
    setPlans(
      plans.map((p) => {
        if (p.id === locationId) {
          return {
            ...p,
            tasks: [
              ...p.tasks,
              {
                id: Date.now(),
                name: "",
                startDate: formData.workDate,
                endDate: formData.workDate,
              },
            ],
          };
        }
        return p;
      })
    );
  };

  const removeTask = (locationId, taskId) => {
    setPlans(
      plans.map((p) => {
        if (p.id === locationId) {
          return { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) };
        }
        return p;
      })
    );
  };

  const handlePlanChange = (locationId, field, value) => {
    setPlans(plans.map((p) => (p.id === locationId ? { ...p, [field]: value } : p)));
  };

  const handleTaskChange = (locationId, taskId, field, value) => {
    setPlans(
      plans.map((p) => {
        if (p.id === locationId) {
          return {
            ...p,
            tasks: p.tasks.map((t) => {
              if (t.id === taskId) {
                // If setting a start date that is after work date, auto-correct to work date
                if (field === "startDate") {
                  if (value > formData.workDate) {
                    value = formData.workDate;
                  }
                  // If setting a start date that is after the existing end date, auto-adjust end date
                  if (t.endDate && value > t.endDate) {
                    return { ...t, startDate: value, endDate: value };
                  }
                }
                // If setting an end date that is before start date or before work date, auto-correct to the maximum allowed date
                if (field === "endDate") {
                  const minAllowed = !t.startDate || formData.workDate > t.startDate ? formData.workDate : t.startDate;
                  if (value < minAllowed) {
                    return { ...t, endDate: minAllowed };
                  }
                }
                return { ...t, [field]: value };
              }
              return t;
            }),
          };
        }
        return p;
      })
    );
  };

  const addJobEntry = () => {
    setJobEntries([
      ...jobEntries,
      { id: Date.now(), detail: "", result: "", location: "", executor: "" },
    ]);
  };

  const removeJobEntry = (id) => {
    setJobEntries(jobEntries.filter((entry) => entry.id !== id));
  };

  const handleJobEntryChange = (id, field, value) => {
    setJobEntries(
      jobEntries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    );
  };

  return {
    formData,
    setFormData,
    plans,
    setPlans,
    jobEntries,
    setJobEntries,
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
    exportStatus,
    setExportStatus,
    handleChange,
    handleCompanyChange,
    getWorkerCount,
    addWorker,
    removeWorker,
    handlePhotoUpload,
    handleLogoUpload,
    removeLogo,
    uploadCompanyLogo,
    uploadPendingPhotos,
    removePhoto,
    addLocation,
    removeLocation,
    addTask,
    removeTask,
    handlePlanChange,
    handleTaskChange,
    addJobEntry,
    removeJobEntry,
    handleJobEntryChange,
    confirmDownload,
    companiesList,
  };
}

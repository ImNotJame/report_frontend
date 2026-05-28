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
    reportedBySig: "",
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
      try {
        await recordWorkSessionExport(
          buildWorkSessionExportPayload({
            exportType: exportTarget,
            filename: previewFilename,
            formData,
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

      // If "ADD_NEW", create company first
      if (formData.companyId === "ADD_NEW" && formData.companyName) {
        const createRes = await fetch(`${API_BASE_URL}/add_company`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ c_name: formData.companyName }),
        });
        if (!createRes.ok) throw new Error("Failed to create company");
        const newCompany = await createRes.json();
        targetCompanyId = newCompany.c_id;

        // Update formData to point to new company
        setFormData(prev => ({ ...prev, companyId: targetCompanyId }));
        // Refresh companies list
        fetch(`${API_BASE_URL}/companies`).then(res => res.json()).then(data => setCompaniesList(data));
      }

      // Then upload logo if present
      if (formData.companyLogo && formData.companyLogo.file && targetCompanyId && targetCompanyId !== "ADD_NEW") {
        const uploadData = new FormData();
        uploadData.append("file", formData.companyLogo.file);

        const response = await fetch(`${API_BASE_URL}/company_logo?c_id=${encodeURIComponent(targetCompanyId)}`, {
          method: "POST",
          body: uploadData,
        });
        if (!response.ok) {
          throw new Error("Failed to upload company logo");
        }
        return await response.json();
      }
    } catch (err) {
      console.error("Error in company logo workflow:", err);
      // We don't throw here to avoid crashing the PDF export
    }
    return null;
  };

  const uploadPendingPhotos = async () => {
    const updatedPhotos = [];
    for (const photo of formData.photos) {
      if (photo.file) {
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

    setFormData((prev) => ({ ...prev, photos: updatedPhotos }));
    return { ...formData, photos: updatedPhotos };
  };

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const processSignature = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxWidth = 300;
          const maxHeight = 100;
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;
          const threshold = 180;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            
            // If the pixel is transparent (alpha < 128) or light-colored (gray > threshold),
            // convert it to solid white. Otherwise, convert it to solid black.
            if (a < 128 || gray > threshold) {
              data[i] = 255;
              data[i + 1] = 255;
              data[i + 2] = 255;
              data[i + 3] = 255;
            } else {
              data[i] = 0;
              data[i + 1] = 0;
              data[i + 2] = 0;
              data[i + 3] = 255;
            }
          }
          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const addLocation = () => {
    setPlans([
      ...plans,
      {
        id: Date.now(),
        locationName: "สถานที่ใหม่",
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
                name: "งานใหม่",
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
            tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, [field]: value } : t)),
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
    processSignature,
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

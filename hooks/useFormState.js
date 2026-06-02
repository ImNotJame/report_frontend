import { useState } from "react";

export function useFormState() {
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

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const addLocation = () => {
    setPlans((prevPlans) => [
      ...prevPlans,
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
    setPlans((prevPlans) => prevPlans.filter((p) => p.id !== locationId));
  };

  const addTask = (locationId) => {
    setPlans((prevPlans) =>
      prevPlans.map((p) => {
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
    setPlans((prevPlans) =>
      prevPlans.map((p) => {
        if (p.id === locationId) {
          return { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) };
        }
        return p;
      })
    );
  };

  const handlePlanChange = (locationId, field, value) => {
    setPlans((prevPlans) =>
      prevPlans.map((p) => (p.id === locationId ? { ...p, [field]: value } : p))
    );
  };

  const handleTaskChange = (locationId, taskId, field, value) => {
    let finalValue = value;
    setPlans((prevPlans) =>
      prevPlans.map((p) => {
        if (p.id === locationId) {
          return {
            ...p,
            tasks: p.tasks.map((t) => {
              if (t.id === taskId) {
                if (field === "startDate") {
                  if (finalValue > formData.workDate) {
                    finalValue = formData.workDate;
                  }
                  if (t.endDate && finalValue > t.endDate) {
                    return { ...t, startDate: finalValue, endDate: finalValue };
                  }
                }
                if (field === "endDate") {
                  const minAllowed = !t.startDate || formData.workDate > t.startDate ? formData.workDate : t.startDate;
                  if (finalValue < minAllowed) {
                    return { ...t, endDate: minAllowed };
                  }
                }
                return { ...t, [field]: finalValue };
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
    setJobEntries((prev) => [
      ...prev,
      { id: Date.now(), detail: "", result: "", location: "", executor: "" },
    ]);
  };

  const removeJobEntry = (id) => {
    setJobEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleJobEntryChange = (id, field, value) => {
    setJobEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    );
  };

  return {
    formData,
    setFormData,
    plans,
    setPlans,
    jobEntries,
    setJobEntries,
    handleChange,
    getWorkerCount,
    addWorker,
    removeWorker,
    handlePhotoUpload,
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
  };
}

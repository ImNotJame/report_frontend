import { useState, useEffect } from "react";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");

export function useCompanyApi(formData, setFormData, setExportStatus) {
  const [companiesList, setCompaniesList] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/companies`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setCompaniesList(data);
        }
      } catch (err) {
        console.error("Failed to fetch companies", err);
      }
    };
    fetchCompanies();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCompanyChange = (e) => {
    const value = e.target.value;

    if (value === "ADD_NEW") {
      setFormData((prev) => ({
        ...prev,
        companyId: "ADD_NEW",
        companyName: "",
        companyLogo: null,
        CL: null,
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

      setFormData((prev) => ({
        ...prev,
        companyId: value,
        companyName: selectCompany.c_name || selectCompany.name || "",
        CL: backgroundLogoUrl,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        companyId: value,
        companyName: "",
        CL: null,
      }));
    }
  };

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
      e.target.value = "";
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

        setFormData((prev) => ({ ...prev, companyId: targetCompanyId, companyName: newCompanyName }));
        fetch(`${API_BASE_URL}/companies`)
          .then((res) => res.json())
          .then((data) => setCompaniesList(data));
      }

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
        setFormData((prev) => ({
          ...prev,
          CL: uploadedLogoUrl,
          companyLogo: prev.companyLogo ? { ...prev.companyLogo, file: null } : null,
        }));
      }

      return {
        companyId: targetCompanyId,
        companyName: newCompanyName,
        CL: uploadedLogoUrl || formData.CL,
      };
    } catch (err) {
      console.error("Error in company logo workflow:", err);
    }
    return {
      companyId: formData.companyId,
      companyName: formData.companyName,
      CL: formData.CL,
    };
  };

  return {
    companiesList,
    handleCompanyChange,
    handleLogoUpload,
    removeLogo,
    uploadCompanyLogo,
  };
}

import { useState } from "react";
import { useFormState } from "./useFormState";
import { useCompanyApi } from "./useCompanyApi";
import { useDocumentExport } from "./useDocumentExport";

export function useDailyReportForm() {
  const [exportStatus, setExportStatus] = useState("");

  const formState = useFormState();

  const companyApi = useCompanyApi(
    formState.formData,
    formState.setFormData,
    setExportStatus
  );

  const documentExport = useDocumentExport(
    formState.formData,
    formState.setFormData,
    formState.plans,
    formState.jobEntries,
    companyApi.uploadCompanyLogo,
    exportStatus,
    setExportStatus
  );

  return {
    ...formState,
    ...companyApi,
    ...documentExport,
    exportStatus,
    setExportStatus,
  };
}

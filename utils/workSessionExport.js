const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const buildWorkSessionExportPayload = ({
  exportType,
  filename,
  formData,
  plans,
  jobEntries,
}) => {
  // Flatten workers into a single array for easier backend processing
  const workers = [];
  const addWorker = (firstName, lastName, departmentName, location) => {
    if (firstName) {
      workers.push({
        first_name: firstName,
        last_name: lastName || "",
        department_name: departmentName,
        work_date: formData.workDate,
        location: location || "",
      });
    }
  };

  if (Array.isArray(formData.workersForeman)) {
    formData.workersForeman.forEach((w) => {
      const parts = w.split(" ");
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ");
      addWorker(firstName, lastName, "Foreman", null);
    });
  }
  // Other departments follow the same pattern if needed, or backend extracts them from formData directly
  // The backend already parses formData for departments if we pass the raw form data!

  return {
    work_date: formData.workDate,
    payload: {
      exportType,
      filename,
      formData,
      plans,
      jobEntries,
    },
    workers,
  };
};

export const recordWorkSessionExport = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/work-sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorDetail = "Unknown error";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || JSON.stringify(errorJson);
    } catch (e) {
      errorDetail = response.statusText;
    }
    throw new Error(`API Error: ${response.status} - ${errorDetail}`);
  }

  return await response.json();
};

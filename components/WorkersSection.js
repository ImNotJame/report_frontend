import React, { useState } from "react";
import { Trash2 } from "lucide-react";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");

function WorkerInput({ name, addWorker, existingWorkers = [] }) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  const deptBackendName = {
    "workersForeman": "Foreman",
    "workersElectrician": "Electrician",
    "workersIT": "IT",
    "workersMason": "Mason",
    "workersWelder": "Welder",
    "workersPlumber": "Plumber",
    "workersOthers": "Others"
  }[name];

  const fetchWorkers = async () => {
    try {
      const depRes = await fetch(`${API_BASE_URL}/get_id_by_name?name=${deptBackendName}`);
      if (!depRes.ok) return;
      const depId = await depRes.json();
      const cleanDepId = String(depId).replace(/"/g, "");

      const workersRes = await fetch(`${API_BASE_URL}/get_all_by_department_id?data=${cleanDepId}`);
      if (!workersRes.ok) return;
      const workersList = await workersRes.json();
      setSuggestions(workersList);
    } catch (e) {
      console.error("Failed to fetch workers for", deptBackendName, e);
    }
  };

  const filteredSuggestions = suggestions.filter((w) => {
    const fullName = `${w.w_firstname} ${w.w_lastname}`.trim();
    if (existingWorkers.some(worker => worker.toLowerCase() === fullName.toLowerCase())) return false;
    return fullName.toLowerCase().includes(inputValue.toLowerCase());
  });

  const handleAdd = (val) => {
    if (!val.trim()) return;
    addWorker(name, val.trim());
    setInputValue("");
    setIsFocused(false);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        placeholder="พิมพ์ชื่อแล้วกด Enter..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          fetchWorkers();
        }}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAdd(inputValue);
          }
        }}
        style={{
          width: "100%",
          border: "none",
          background: "#f1f5f9",
          padding: "0.4rem 0.8rem",
          borderRadius: "6px",
          fontSize: "0.9rem",
        }}
      />
      {isFocused && inputValue.trim().length > 0 && filteredSuggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            maxHeight: "150px",
            overflowY: "auto",
            zIndex: 10,
            listStyle: "none",
            padding: 0,
            margin: "0.2rem 0 0 0",
          }}
        >
          {filteredSuggestions.map((w, idx) => {
            const fullName = `${w.w_firstname} ${w.w_lastname}`.trim();
            return (
              <li
                key={idx}
                onMouseDown={() => handleAdd(fullName)}
                style={{
                  padding: "0.4rem 0.8rem",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  borderBottom: "1px solid #f1f5f9",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.target.style.background = "white")}
              >
                {fullName}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function WorkersSection({
  formData,
  handleChange,
  getWorkerCount,
  addWorker,
  removeWorker,
}) {
  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  return (
    <>
      <h2 style={{ marginTop: "3rem" }}>ผู้ปฏิบัติงาน (Workers)</h2>
      <table className="dynamic-table" style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th style={{ width: "30%" }}>ประเภทผู้ปฏิบัติงาน</th>
            <th>รายชื่อ </th>
            <th style={{ width: "120px", textAlign: "center" }}>จำนวน (คน)</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["ผู้จัดการ / โฟร์แมน", "workersForeman"],
            ["ช่างไฟฟ้า", "workersElectrician"],
            ["ช่างไอที", "workersIT"],
            ["ช่างปูน", "workersMason"],
            ["ช่างเชื่อม", "workersWelder"],
            ["ช่างปะปา", "workersPlumber"],
            ["อื่นๆ", "workersOthers"],
          ].map(([label, name]) => (
            <tr key={name}>
              <td
                style={{
                  fontWeight: 500,
                  verticalAlign: "top",
                  paddingTop: "1rem",
                }}
              >
                {label}
              </td>
              <td>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {formData[name].map((worker, idx) => (
                    <span
                      key={idx}
                      className="days-badge"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.2rem 0.6rem",
                        background: "var(--primary-color)",
                        color: "white",
                        cursor: "pointer",
                      }}
                      onClick={() => removeWorker(name, idx)}
                    >
                      {worker} <Trash2 size={10} />
                    </span>
                  ))}
                </div>
                <WorkerInput name={name} addWorker={addWorker} existingWorkers={formData[name]} />
              </td>
              <td
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  verticalAlign: "top",
                  paddingTop: "1rem",
                }}
              >
                {getWorkerCount(formData[name])}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: "var(--bg-card)", fontWeight: "700" }}>
            <td colSpan={2} style={{ textAlign: "right", paddingRight: "2rem" }}>
              รวมทั้งหมด (Total)
            </td>
            <td style={{ textAlign: "center", color: "var(--primary-color)" }}>
              {Object.keys(formData)
                .filter(
                  (k) => k.startsWith("workers") && k !== "workersRemarks"
                )
                .reduce((sum, key) => sum + getWorkerCount(formData[key]), 0)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="form-group" style={{ marginTop: "1.5rem" }}>
        <label>หมายเหตุผู้ปฏิบัติงาน (Workers Remarks)</label>
        <textarea
          name="workersRemarks"
          value={formData.workersRemarks}
          onChange={handleChange}
          onInput={autoResize}
          placeholder="ระบุหมายเหตุ"
          style={{ minHeight: "80px", width: "100%" }}
        ></textarea>
      </div>
    </>
  );
}

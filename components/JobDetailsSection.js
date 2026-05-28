import React from "react";
import { AlertCircle, Plus, MapPin, User, Trash2 } from "lucide-react";

export default function JobDetailsSection({
  jobEntries,
  addJobEntry,
  removeJobEntry,
  handleJobEntryChange,
}) {
  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  return (
    <>
      <div
        className="flex-row"
        style={{
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          marginTop: "3rem",
        }}
      >
        <h2>
          <AlertCircle size={20} /> รายละเอียดงาน (Job Details)
        </h2>
        <button className="btn btn-success" onClick={addJobEntry}>
          <Plus size={18} /> เพิ่มรายการงาน
        </button>
      </div>

      <table className="dynamic-table">
        <thead>
          <tr>
            <th style={{ width: "60px", textAlign: "center" }}>ลำดับ</th>
            <th>รายละเอียดการปฏิบัติงาน</th>
            <th style={{ width: "200px" }}>สถานที่</th>
            <th style={{ width: "180px" }}>ผู้ดำเนินการ</th>
            <th style={{ width: "60px" }}></th>
          </tr>
        </thead>
        <tbody>
          {jobEntries.map((entry, index) => (
            <tr key={entry.id}>
              <td
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  verticalAlign: "top",
                  paddingTop: "1.5rem",
                }}
              >
                {index + 1}
              </td>
              <td>
                <div className="flex-column">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        color: "var(--text-secondary)",
                      }}
                    >
                      รายละเอียดงาน:
                    </span>
                    <textarea
                      value={entry.detail}
                      onChange={(e) =>
                        handleJobEntryChange(entry.id, "detail", e.target.value)
                      }
                      onInput={autoResize}
                      rows={1}
                      placeholder="..."
                      maxLength={500}
                      style={{ minHeight: "40px", background: "#f8fafc" }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        color: "var(--text-secondary)",
                      }}
                    >
                      ผลการดำเนินการ:
                    </span>
                    <textarea
                      value={entry.result}
                      onChange={(e) =>
                        handleJobEntryChange(entry.id, "result", e.target.value)
                      }
                      onInput={autoResize}
                      rows={1}
                      placeholder="..."
                      maxLength={500}
                      style={{ minHeight: "40px", background: "#f8fafc" }}
                    />
                  </div>
                </div>
              </td>
              <td style={{ verticalAlign: "top", paddingTop: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "#f8fafc",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "8px",
                  }}
                >
                  <MapPin size={14} color="#64748b" />
                  <textarea
                    value={entry.location}
                    onInput={autoResize}
                    onChange={(e) =>
                      handleJobEntryChange(entry.id, "location", e.target.value)
                    }
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "0.25rem",
                    }}
                  />
                </div>
              </td>
              <td style={{ verticalAlign: "top", paddingTop: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "#f8fafc",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "8px",
                  }}
                >
                  <User size={14} color="#64748b" />
                  <textarea
                    value={entry.executor}
                    onInput={autoResize}
                    onChange={(e) =>
                      handleJobEntryChange(entry.id, "executor", e.target.value)
                    }
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "0.25rem",
                    }}
                  />
                </div>
              </td>
              <td
                style={{
                  textAlign: "center",
                  verticalAlign: "top",
                  paddingTop: "1.5rem",
                }}
              >
                <button
                  className="btn btn-danger"
                  style={{
                    padding: "0.4rem",
                    border: "none",
                    background: "transparent",
                  }}
                  onClick={() => removeJobEntry(entry.id)}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

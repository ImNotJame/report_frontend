import React, { useEffect, useRef } from "react";
import { Calendar, Plus, MapPin, Trash2 } from "lucide-react";

export default function ProjectPlanSection({
  plans,
  formData,
  addLocation,
  removeLocation,
  addTask,
  removeTask,
  handlePlanChange,
  handleTaskChange,
}) {
  const totalTasks = plans.reduce((sum, p) => sum + (p.tasks?.length || 0), 0);
  const tbodyRef = useRef(null);
  const prevPlansLength = useRef(plans.length);
  const prevTotalTasks = useRef(totalTasks);

  useEffect(() => {
    // 1. If a new location was added
    if (plans.length > prevPlansLength.current) {
      const rows = tbodyRef.current?.querySelectorAll("tr");
      if (rows && rows.length > 0) {
        // Search bottom-up for the last location name textarea
        for (let i = rows.length - 1; i >= 0; i--) {
          const textarea = rows[i].querySelector("div > textarea");
          if (textarea) {
            textarea.focus();
            break;
          }
        }
      }
    }
    // 2. If a new task was added
    else if (totalTasks > prevTotalTasks.current) {
      const rows = tbodyRef.current?.querySelectorAll("tr");
      if (rows && rows.length > 0) {
        // Search bottom-up for the last task name textarea (indent padding of 2.5rem)
        for (let i = rows.length - 1; i >= 0; i--) {
          const td = rows[i].querySelector("td");
          if (td && td.style.paddingLeft === "2.5rem") {
            const textarea = td.querySelector("textarea");
            if (textarea) {
              textarea.focus();
              break;
            }
          }
        }
      }
    }

    prevPlansLength.current = plans.length;
    prevTotalTasks.current = totalTasks;
  }, [plans.length, totalTasks]);

  const getDaysDiff = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate - startDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

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
          marginTop: "1rem",
        }}
      >
        <h2>
          <Calendar size={20} /> แผนการดำเนินโครงการ (Project Plan)
        </h2>
        <button className="btn btn-success" onClick={addLocation}>
          <Plus size={18} /> เพิ่มสถานที่
        </button>
      </div>

      <table className="dynamic-table">
        <thead>
          <tr>
            <th style={{ width: "40%" }}>สถานที่ / รายละเอียดงาน</th>
            <th>วันที่เริ่ม</th>
            <th>วันที่สิ้นสุด</th>
            <th style={{ textAlign: "center" }}>ผ่านมาแล้ว</th>
            <th style={{ textAlign: "center" }}>คงเหลือ</th>
            <th style={{ width: "80px", textAlign: "center" }}></th>
          </tr>
        </thead>
        <tbody ref={tbodyRef}>
          {plans.map((plan) => (
            <React.Fragment key={plan.id}>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <td colSpan={5}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <MapPin size={14} color="var(--primary-color)" />
                    <textarea
                      value={plan.locationName}
                      onChange={(e) =>
                        handlePlanChange(plan.id, "locationName", e.target.value)
                      }
                      onInput={autoResize}
                      rows={1}
                      placeholder="ระบุสถานที่..."
                      style={{
                        fontWeight: "600",
                        border: "none",
                        background: "transparent",
                        width: "100%",
                        minHeight: "24px",
                        padding: "0.25rem 0.5rem",
                        resize: "none",
                        overflow: "hidden",
                        color: "var(--text-primary)",
                        caretColor: "var(--text-primary)",
                      }}
                    />
                  </div>
                </td>
                <td style={{ textAlign: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.25rem",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      className="btn btn-success"
                      style={{ padding: "0.4rem", borderRadius: "6px" }}
                      onClick={() => addTask(plan.id)}
                      title="Add Task"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: "0.4rem", borderRadius: "6px" }}
                      onClick={() => removeLocation(plan.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
              {plan.tasks.map((task) => (
                <tr key={task.id}>
                  <td style={{ paddingLeft: "2.5rem" }}>
                    <textarea
                      value={task.name}
                      onChange={(e) =>
                        handleTaskChange(plan.id, task.id, "name", e.target.value)
                      }
                      onInput={autoResize}
                      rows={1}
                      placeholder="ระบุรายละเอียดงาน..."
                      style={{
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        minHeight: "24px",
                        padding: "0.25rem 0.5rem",
                        resize: "none",
                        overflow: "hidden",
                        color: "var(--text-primary)",
                        caretColor: "var(--text-primary)",
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={task.startDate}
                      max={formData.workDate}
                      onChange={(e) =>
                        handleTaskChange(
                          plan.id,
                          task.id,
                          "startDate",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={task.endDate}
                      min={!task.startDate || formData.workDate > task.startDate ? formData.workDate : task.startDate}
                      onChange={(e) =>
                        handleTaskChange(
                          plan.id,
                          task.id,
                          "endDate",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className="days-badge">
                      {getDaysDiff(task.startDate, formData.workDate)}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      className={`days-badge ${getDaysDiff(formData.workDate, task.endDate) < 3
                        ? "danger"
                        : ""
                        }`}
                    >
                      {getDaysDiff(formData.workDate, task.endDate)}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="btn btn-danger"
                      style={{
                        padding: "0.4rem",
                        borderRadius: "6px",
                        background: "transparent",
                        border: "none",
                      }}
                      onClick={() => removeTask(plan.id, task.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </>
  );
}

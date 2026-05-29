export default function ProjectInfoSection({ formData, handleChange }) {
  return (
    <>
      <div className="grid-2">
        <div className="form-group">
          <label>ชื่อโครงการ (Project Name)</label>
          <input
            type="text"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            placeholder="ระบุชื่อโครงการ..."
            maxLength={100}
          />
        </div>
        <div className="form-group">
          <label>วันที่ปฏิบัติงาน (Work Date)</label>
          <div style={{ position: "relative" }}>
            <input
              type="date"
              name="workDate"
              value={formData.workDate}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: "2rem" }}>
        <div className="form-group">
          <label>อุปสรรคและเหตุการณ์พิเศษ</label>
          <input
            placeholder="กรอกรายละเอียด..."
            type="text"
            name="obstacles"
            value={formData.obstacles}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>สภาพอากาศ (Weather)</label>
          <select 
            name="weather" 
            value={formData.weather} 
            onChange={handleChange}
            style={{ 
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%231C3E6C%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
              backgroundSize: "1.2em",
              backgroundColor: "#ffffff",
              paddingRight: "2.5rem"
            }}
          >
            <option value="ปลอดโปร่ง">ปลอดโปร่ง</option>
            <option value="ฝนตก">ฝนตก</option>
            <option value="มีเมฆมาก">มีเมฆมาก</option>
            <option value="แดดร้อน">แดดร้อน</option>
          </select>
        </div>
      </div>

      <div className="form-group" style={{ marginTop: "1rem" }}>
        <label>หมายเหตุ (Remarks)</label>
        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          placeholder="ระบุหมายเหตุเพิ่มเติม..."
          style={{ minHeight: "60px" }}
        ></textarea>
      </div>
    </>
  );
}

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
          <select name="weather" value={formData.weather} onChange={handleChange}>
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

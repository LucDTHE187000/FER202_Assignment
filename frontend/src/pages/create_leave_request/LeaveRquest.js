import React, { useState } from "react";
import "./LeaveRequest.css";

const LeaveRequest = () => {
  const [form, setForm] = useState({
    UserID: "",
    FromDate: "",
    ToDate: "",
    Reason: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [dateError, setDateError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Xóa lỗi khi người dùng thay đổi ngày
    if (e.target.name === "FromDate" || e.target.name === "ToDate") {
      setDateError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fromDate = new Date(form.FromDate);
    const toDate = new Date(form.ToDate);

    // Kiểm tra ngày bắt đầu và kết thúc không được trong quá khứ
    if (fromDate < today || toDate < today) {
      setDateError("Ngày bắt đầu và ngày kết thúc không được trong quá khứ.");
      return;
    }

    // Kiểm tra ngày bắt đầu không được lớn hơn ngày kết thúc
    if (form.FromDate > form.ToDate) {
      setDateError("Từ ngày không được lớn hơn Đến ngày.");
      return;
    }

    // Gửi dữ liệu lên backend tại đây
    setSubmitted(true);
  };

  return (
    <div className="leave-request-container">
      <h2>Đơn Xin Nghỉ Phép</h2>
      {submitted ? (
        <div className="success-message">Đã gửi đơn xin nghỉ phép!</div>
      ) : (
        <form className="leave-request-form" onSubmit={handleSubmit}>
          <div className="form-group">
            {/* ...các trường khác nếu có... */}
          </div>
          <div className="form-group">
            <label>Từ ngày</label>
            <input
              type="date"
              name="FromDate"
              value={form.FromDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Đến ngày</label>
            <input
              type="date"
              name="ToDate"
              value={form.ToDate}
              onChange={handleChange}
              required
            />
          </div>
          {dateError && (
            <div style={{ color: "red", marginBottom: 10 }}>{dateError}</div>
          )}
          <div className="form-group">
            <label>Lý do</label>
            <textarea
              name="Reason"
              value={form.Reason}
              onChange={handleChange}
              required
              rows={4}
            />
          </div>
          <button type="submit" className="submit-btn">
            Gửi đơn
          </button>
        </form>
      )}
    </div>
  );
};

export default LeaveRequest;
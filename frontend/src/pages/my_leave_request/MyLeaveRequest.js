import React, { useEffect, useState } from "react";

const DUMMY_REQUESTS = [
  {
    RequestID: 1,
    FromDate: "2025-07-01",
    ToDate: "2025-07-03",
    Reason: "Nghỉ phép cá nhân",
    StatusID: 1,
    CreatedAt: "2025-06-25",
  },
  {
    RequestID: 2,
    FromDate: "2025-08-10",
    ToDate: "2025-08-12",
    Reason: "Nghỉ ốm",
    StatusID: 2,
    CreatedAt: "2025-08-01",
  },
  {
    RequestID: 3,
    FromDate: "2025-09-05",
    ToDate: "2025-09-07",
    Reason: "Nghỉ phép gia đình",
    StatusID: 3,
    CreatedAt: "2025-08-20",
  },
];

const statusOptions = [
  { value: 1, label: "Chờ duyệt" },
  { value: 2, label: "Đã duyệt" },
  { value: 3, label: "Từ chối" },
];

const MyLeaveRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // request đang sửa
  const [editForm, setEditForm] = useState({
    FromDate: "",
    ToDate: "",
    Reason: "",
    StatusID: 1,
  });

  useEffect(() => {
    setTimeout(() => {
      setRequests(DUMMY_REQUESTS);
      setLoading(false);
    }, 500);
  }, []);

  const handleUpdate = (id) => {
    const req = requests.find((r) => r.RequestID === id);
    setEditing(id);
    setEditForm({
      FromDate: req.FromDate,
      ToDate: req.ToDate,
      Reason: req.Reason,
      StatusID: req.StatusID,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setRequests((prev) =>
      prev.map((req) =>
        req.RequestID === editing
          ? { ...req, ...editForm, StatusID: Number(editForm.StatusID) }
          : req
      )
    );
    setEditing(null);
  };

  const handleEditCancel = () => {
    setEditing(null);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa đơn này?");
    if (confirmDelete) {
      setRequests((prev) => prev.filter((req) => req.RequestID !== id));
    }
  };

  return (
    <div className="leave-request-container">
      <h2>Đơn Nghỉ Phép Của Tôi</h2>
      {loading ? (
        <p>Đang tải...</p>
      ) : requests.length === 0 ? (
        <p>Bạn chưa có đơn nghỉ phép nào.</p>
      ) : (
        <table className="leave-request-table">
          <thead>
            <tr>
              <th>Từ ngày</th>
              <th>Đến ngày</th>
              <th>Lý do</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.RequestID}>
                <td>{req.FromDate}</td>
                <td>{req.ToDate}</td>
                <td>{req.Reason}</td>
                <td>
                  {statusOptions.find((s) => s.value === req.StatusID)?.label ||
                    "Không xác định"}
                </td>
                <td>{req.CreatedAt}</td>
                <td>
                  <button
                    style={{
                      backgroundColor: "#04ef6aff",
                      color: "white",
                      marginRight: 6,
                    }}
                    onClick={() => handleUpdate(req.RequestID)}
                  >
                    Update
                  </button>
                  <button
                    style={{ backgroundColor: "#e74c3c", color: "white" }}
                    onClick={() => handleDelete(req.RequestID)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal update */}
      {editing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <form
            className="leave-request-form"
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 12,
              minWidth: 320,
              boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
              position: "relative",
            }}
            onSubmit={handleEditSubmit}
          >
            <h3
              style={{
                color: "#2d5be3",
                marginBottom: 18,
              }}
            >
              Cập nhật đơn nghỉ phép
            </h3>
            <div className="form-group">
              <label>Từ ngày</label>
              <input
                type="date"
                name="FromDate"
                value={editForm.FromDate}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Đến ngày</label>
              <input
                type="date"
                name="ToDate"
                value={editForm.ToDate}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Lý do</label>
              <textarea
                name="Reason"
                value={editForm.Reason}
                onChange={handleEditChange}
                required
                rows={3}
              />
            </div>
            
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                type="button"
                style={{
                  background: "#f11010ff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 18px",
                  cursor: "pointer",
                }}
                onClick={handleEditCancel}
              >
                Hủy
              </button>
              <button
                type="submit"
                style={{
                  background: "#2d5be3",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 18px",
                  cursor: "pointer",
                }}
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyLeaveRequest;

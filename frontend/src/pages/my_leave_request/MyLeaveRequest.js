import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import './MyLeaveRequest.css';

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
    // Thay vì load dữ liệu giả, để trống để hiển thị "không có đơn nào"
    setLoading(false);
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

  const getStatusBadge = (statusId) => {
    const status = statusOptions.find(s => s.value === statusId);
    let className = 'status-badge ';
    
    switch(statusId) {
      case 1:
        className += 'status-pending';
        break;
      case 2:
        className += 'status-approved';
        break;
      case 3:
        className += 'status-rejected';
        break;
      default:
        className += 'status-pending';
    }
    
    return <span className={className}>{status?.label || 'Không xác định'}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="my-leave-request">
      <div className="my-leave-request-container">
        <div className="my-leave-request-header">
          <h1>Đơn Nghỉ Phép Của Tôi</h1>
          <p>Quản lý và theo dõi các đơn nghỉ phép của bạn</p>
        </div>

        <div className="requests-table-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="no-requests">
              <h3>Chưa có đơn nghỉ phép nào</h3>
              <p>Bạn chưa tạo đơn nghỉ phép nào. Hãy tạo đơn mới để bắt đầu.</p>
              <Link to="/leave-request-create" className="create-request-link">
                <span>+</span> Tạo đơn nghỉ phép mới
              </Link>
            </div>
          ) : (
            <table className="requests-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Từ ngày</th>
                  <th>Đến ngày</th>
                  <th>Lý do</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.RequestID}>
                    <td>#{req.RequestID}</td>
                    <td className="date-cell">{formatDate(req.FromDate)}</td>
                    <td className="date-cell">{formatDate(req.ToDate)}</td>
                    <td className="reason-cell">{req.Reason}</td>
                    <td>{getStatusBadge(req.StatusID)}</td>
                    <td className="created-date">{formatDate(req.CreatedAt)}</td>
                    <td>
                      <div className="action-buttons">
                        {editing === req.RequestID ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-save"
                              onClick={handleEditSubmit}
                            >
                              💾 Lưu
                            </button>
                            <button
                              type="button"
                              className="btn btn-cancel"
                              onClick={handleEditCancel}
                            >
                              ✕ Hủy
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn btn-edit"
                              onClick={() => handleUpdate(req.RequestID)}
                              disabled={req.StatusID === 2} // Không cho sửa nếu đã duyệt
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              className="btn btn-delete"
                              onClick={() => handleDelete(req.RequestID)}
                              disabled={req.StatusID === 2} // Không cho xóa nếu đã duyệt
                            >
                              🗑️ Xóa
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Edit Form Modal */}
        {editing && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">
                Chỉnh sửa đơn nghỉ phép #{editing}
              </h3>
              <form className="edit-form" onSubmit={handleEditSubmit}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                  <div>
                    <label>Từ ngày:</label>
                    <input
                      type="date"
                      name="FromDate"
                      value={editForm.FromDate}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div>
                    <label>Đến ngày:</label>
                    <input
                      type="date"
                      name="ToDate"
                      value={editForm.ToDate}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label>Lý do:</label>
                  <textarea
                    name="Reason"
                    value={editForm.Reason}
                    onChange={handleEditChange}
                    required
                    rows={3}
                    placeholder="Nhập lý do nghỉ phép..."
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-cancel"
                    onClick={handleEditCancel}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="btn btn-save"
                  >
                    Cập nhật đơn
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLeaveRequest;

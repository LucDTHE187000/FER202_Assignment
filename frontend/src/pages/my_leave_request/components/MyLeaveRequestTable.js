import React from 'react';
import { Link } from 'react-router-dom';

const statusOptions = [
    { value: 1, label: "Đã duyệt" },
    { value: 2, label: "Từ chối" },
    { value: 3, label: "Chờ duyệt" },
];

const MyLeaveRequestTable = ({
    requests,
    loading,
    editing,
    editForm,
    editLoading,
    deleteLoading,
    onStartEdit,
    onCancelEdit,
    onEditChange,
    onUpdateRequest,
    onDeleteRequest
}) => {
    const getStatusBadge = (statusId) => {
        const status = statusOptions.find(s => s.value === statusId);
        let className = 'status-badge ';
        
        switch(statusId) {
            case 1:
                className += 'status-approved';
                break;
            case 2:
                className += 'status-rejected';
                break;
            case 3:
                className += 'status-pending';
                break;
            default:
                className += 'status-pending';
        }
        
        return <span className={className}>{status?.label || 'Không xác định'}</span>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const canEditOrDelete = (statusId) => {
        return statusId !== 1 && statusId !== 2; // Cannot edit/delete if approved (StatusID = 1) or rejected (StatusID = 2)
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="no-requests">
                <h3>Chưa có đơn nghỉ phép nào</h3>
                <p>Bạn chưa tạo đơn nghỉ phép nào. Hãy tạo đơn mới để bắt đầu.</p>
                <Link to="/leave-request-create" className="create-request-link">
                    <span>+</span> Tạo đơn nghỉ phép mới
                </Link>
            </div>
        );
    }

    return (
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
                                            onClick={onUpdateRequest}
                                            disabled={editLoading}
                                        >
                                            {editLoading ? '⏳' : '💾'} Lưu
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-cancel"
                                            onClick={onCancelEdit}
                                            disabled={editLoading}
                                        >
                                            ✕ Hủy
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-edit"
                                            onClick={() => onStartEdit(req)}
                                            disabled={!canEditOrDelete(req.StatusID) || deleteLoading}
                                            title={!canEditOrDelete(req.StatusID) ? 'Không thể sửa đơn đã duyệt' : ''}
                                        >
                                            ✏️ Sửa
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => onDeleteRequest(req.RequestID)}
                                            disabled={!canEditOrDelete(req.StatusID) || deleteLoading}
                                            title={!canEditOrDelete(req.StatusID) ? 'Không thể xóa đơn đã duyệt' : ''}
                                        >
                                            {deleteLoading ? '⏳' : '🗑️'} Xóa
                                        </button>
                                    </>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default MyLeaveRequestTable;

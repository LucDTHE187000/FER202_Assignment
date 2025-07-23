import React from 'react';

const LeaveRequestTable = ({ 
    requests, 
    loading, 
    processingIds, 
    currentUserId,
    onApprove, 
    onReject 
}) => {
    const getStatusBadge = (statusId) => {
        switch (statusId) {
            case 1:
                return <span className="status-badge status-approved">Đã duyệt</span>;
            case 2:
                return <span className="status-badge status-rejected">Đã từ chối</span>;
            case 3:
                return <span className="status-badge status-pending">Chờ duyệt</span>;
            default:
                return <span className="status-badge">Không xác định</span>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const calculateDays = (fromDate, toDate) => {
        if (!fromDate || !toDate) return 0;
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const timeDiff = to.getTime() - from.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return dayDiff + 1; // Include both start and end dates
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải danh sách đơn nghỉ phép...</p>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="no-requests">
                <h3>Không có đơn nghỉ phép nào</h3>
                <p>Hiện tại không có đơn nghỉ phép nào trong phạm vi quản lý của bạn.</p>
            </div>
        );
    }

    return (
        <div className="requests-table-container">
            <table className="requests-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nhân viên</th>
                        <th>Phòng ban</th>
                        <th>Từ ngày</th>
                        <th>Đến ngày</th>
                        <th>Số ngày</th>
                        <th>Lý do</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((request) => (
                        <tr key={request.RequestID}>
                            <td>{request.RequestID}</td>
                            <td>
                                <div className="user-info">
                                    <strong>{request.User?.FullName || 'N/A'}</strong>
                                    <small>({request.User?.Username || 'N/A'})</small>
                                </div>
                            </td>
                            <td>{request.User?.Department?.DepartmentName || 'N/A'}</td>
                            <td>{formatDate(request.FromDate)}</td>
                            <td>{formatDate(request.ToDate)}</td>
                            <td className="days-count">
                                {calculateDays(request.FromDate, request.ToDate)} ngày
                            </td>
                            <td className="reason-cell">
                                <div className="reason-text">{request.Reason || 'Không có lý do'}</div>
                            </td>
                            <td>{getStatusBadge(request.StatusID)}</td>
                            <td>{formatDate(request.CreatedAt)}</td>
                            <td>
                                <div className="action-buttons">
                                    {request.StatusID === 3 ? ( // Chỉ hiển thị nút action cho đơn đang chờ duyệt
                                        <>
                                            <button
                                                className="btn btn-approve"
                                                onClick={() => onApprove(request.RequestID)}
                                                disabled={
                                                    processingIds.has(request.RequestID) || 
                                                    request.UserID === currentUserId // Disable nếu là đơn của chính mình
                                                }
                                                title={request.UserID === currentUserId ? 'Bạn không thể duyệt đơn của chính mình' : ''}
                                            >
                                                {processingIds.has(request.RequestID) ? 'Đang xử lý...' : '✓ Duyệt'}
                                            </button>
                                            <button
                                                className="btn btn-reject"
                                                onClick={() => onReject(request.RequestID)}
                                                disabled={
                                                    processingIds.has(request.RequestID) || 
                                                    request.UserID === currentUserId // Disable nếu là đơn của chính mình
                                                }
                                                title={request.UserID === currentUserId ? 'Bạn không thể từ chối đơn của chính mình' : ''}
                                            >
                                                {processingIds.has(request.RequestID) ? 'Đang xử lý...' : '✕ Từ chối'}
                                            </button>
                                        </>
                                    ) : (
                                        <span className="status-text">
                                            {request.StatusID === 1 ? 'Đã duyệt' : 'Đã từ chối'}
                                        </span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LeaveRequestTable;

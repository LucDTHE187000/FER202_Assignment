import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import useManageLeaveRequest from './hooks/useManageLeaveRequest';
import LeaveRequestTable from './components/LeaveRequestTable';
import './ManageLeaveRequest.css';

const ManageLeaveRequest = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useUser();
    const {
        requests,
        loading,
        error,
        processingIds,
        canManageLeave,
        isDirector,
        isDepartmentLeader,
        currentUserId,
        approveRequest,
        rejectRequest,
        refresh
    } = useManageLeaveRequest();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Redirect if user doesn't have permission
    useEffect(() => {
        if (isAuthenticated && !loading && !canManageLeave) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, canManageLeave, loading, navigate]);

    const handleApprove = async (requestId) => {
        if (window.confirm('Bạn có chắc chắn muốn duyệt đơn nghỉ phép này?')) {
            await approveRequest(requestId);
        }
    };

    const handleReject = async (requestId) => {
        if (window.confirm('Bạn có chắc chắn muốn từ chối đơn nghỉ phép này?')) {
            await rejectRequest(requestId);
        }
    };

    const handleRefresh = () => {
        refresh();
    };

    // Show loading if still checking permissions
    if (!isAuthenticated || (isAuthenticated && loading)) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    // Show error if permission check failed
    if (!canManageLeave) {
        return (
            <div className="permission-denied">
                <h2>Không có quyền truy cập</h2>
                <p>Bạn không có quyền quản lý đơn nghỉ phép.</p>
                <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                    Về Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="manage-leave-request">
            <div className="manage-leave-request-container">
                <div className="manage-leave-request-header">
                    <h1>Quản lý đơn nghỉ phép</h1>
                    <div className="header-info">
                        <p>
                            {isDirector && 'Quản lý tất cả đơn nghỉ phép trong công ty'}
                            {isDepartmentLeader && !isDirector && 'Quản lý đơn nghỉ phép trong phòng ban'}
                        </p>
                        <div className="header-actions">
                            <button 
                                onClick={handleRefresh} 
                                className="btn btn-secondary"
                                disabled={loading}
                            >
                                🔄 Làm mới
                            </button>
                            <div className="requests-count">
                                <span className="badge">{requests.length}</span>
                                đơn nghỉ phép
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="error-container">
                        <div className="error-message">
                            <h3>Có lỗi xảy ra</h3>
                            <p>{error}</p>
                            <button onClick={handleRefresh} className="btn btn-primary">
                                Thử lại
                            </button>
                        </div>
                    </div>
                )}

                <LeaveRequestTable
                    requests={requests}
                    loading={loading}
                    processingIds={processingIds}
                    currentUserId={currentUserId}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            </div>
        </div>
    );
};

export default ManageLeaveRequest;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import useUserRoleManagement from './hooks/useUserRoleManagement';
import UserTable from './components/UserTable';
import './UserRoleManagement.css';

const UserRoleManagement = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useUser();
    const {
        users,
        availableRoles,
        loading,
        error,
        processingUserIds,
        canManageUserRoles,
        isDirector,
        assignRole,
        removeRole,
        refresh
    } = useUserRoleManagement();

    // Redirect nếu chưa đăng nhập
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Redirect nếu không có quyền
    useEffect(() => {
        if (isAuthenticated && !loading && !canManageUserRoles) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, canManageUserRoles, loading, navigate]);

    const handleAssignRole = async (userId, roleId) => {
        return await assignRole(userId, roleId);
    };

    const handleRemoveRole = async (userId, roleId) => {
        return await removeRole(userId, roleId);
    };

    const handleRefresh = () => {
        refresh();
    };

    // Hiển thị loading nếu đang kiểm tra quyền
    if (loading && canManageUserRoles === undefined) {
        return (
            <div className="user-role-management">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    // Hiển thị lỗi nếu có
    if (error) {
        return (
            <div className="user-role-management">
                <div className="error-container">
                    <div className="error-message">
                        <h3>Có lỗi xảy ra</h3>
                        <p>{error}</p>
                    </div>
                    <button className="retry-btn" onClick={handleRefresh}>
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-role-management">
            <div className="user-role-management-container">
                <div className="user-role-management-header">
                    <h1>Quản lý vai trò người dùng</h1>
                    <div className="header-info">
                        <p>Quản lý và phân quyền vai trò cho các người dùng trong hệ thống</p>
                        <div className="header-actions">
                            <div className="users-count">
                                <span>Tổng số người dùng: </span>
                                <span className="badge">{users.length}</span>
                            </div>
                            <button 
                                className="btn btn-secondary" 
                                onClick={handleRefresh}
                                disabled={loading}
                            >
                                {loading ? 'Đang tải...' : 'Làm mới'}
                            </button>
                        </div>
                    </div>
                </div>

                <UserTable 
                    users={users}
                    availableRoles={availableRoles}
                    loading={loading}
                    processingUserIds={processingUserIds}
                    onAssignRole={handleAssignRole}
                    onRemoveRole={handleRemoveRole}
                />
            </div>
        </div>
    );
};

export default UserRoleManagement;

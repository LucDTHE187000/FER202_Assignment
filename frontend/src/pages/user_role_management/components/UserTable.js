import React, { useState } from 'react';

const UserTable = ({ 
    users, 
    availableRoles,
    loading, 
    processingUserIds, 
    onAssignRole, 
    onRemoveRole 
}) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleManageRoles = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
        setShowModal(false);
    };

    const handleAssignRole = async (roleId) => {
        if (!selectedUser) return;
        
        const result = await onAssignRole(selectedUser.UserID, roleId);
        if (result.success) {
            // Cập nhật state local
            setSelectedUser(prev => ({
                ...prev,
                roles: [...prev.roles, availableRoles.find(role => role.RoleID === roleId)]
            }));
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gán vai trò');
        }
    };

    const handleRemoveRole = async (roleId) => {
        if (!selectedUser) return;
        
        const result = await onRemoveRole(selectedUser.UserID, roleId);
        if (result.success) {
            // Cập nhật state local
            setSelectedUser(prev => ({
                ...prev,
                roles: prev.roles.filter(role => role.RoleID !== roleId)
            }));
        } else {
            alert(result.message || 'Có lỗi xảy ra khi xóa vai trò');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải danh sách người dùng...</p>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="no-data-container">
                <p>Không có người dùng nào để quản lý.</p>
            </div>
        );
    }

    return (
        <>
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên đăng nhập</th>
                            <th>Họ và tên</th>
                            <th>Phòng ban</th>
                            <th>Vai trò hiện tại</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.UserID}>
                                <td>{user.UserID}</td>
                                <td>{user.Username}</td>
                                <td>
                                    <div className="user-info">
                                        <strong>{user.FullName}</strong>
                                    </div>
                                </td>
                                <td>{user.DepartmentName || 'Chưa có'}</td>
                                <td>
                                    <div className="roles-list">
                                        {user.roles && user.roles.length > 0 ? (
                                            user.roles.map(role => (
                                                <span key={role.RoleID} className="role-badge">
                                                    {role.RoleName}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="no-role">Chưa có vai trò</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.IsActive ? 'status-active' : 'status-inactive'}`}>
                                        {user.IsActive ? 'Hoạt động' : 'Ngưng hoạt động'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-manage"
                                            onClick={() => handleManageRoles(user)}
                                            disabled={processingUserIds.has(user.UserID)}
                                        >
                                            {processingUserIds.has(user.UserID) ? 'Đang xử lý...' : 'Quản lý vai trò'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal quản lý vai trò */}
            {showModal && selectedUser && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Quản lý vai trò - {selectedUser.FullName}</h3>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="current-roles">
                                <h4>Vai trò hiện tại:</h4>
                                {selectedUser.roles && selectedUser.roles.length > 0 ? (
                                    <div className="roles-list">
                                        {selectedUser.roles.map(role => (
                                            <div key={role.RoleID} className="role-item">
                                                <span className="role-badge">{role.RoleName}</span>
                                                <button
                                                    className="btn btn-remove-role"
                                                    onClick={() => handleRemoveRole(role.RoleID)}
                                                    disabled={processingUserIds.has(selectedUser.UserID)}
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-role">Chưa có vai trò nào</p>
                                )}
                            </div>

                            <div className="available-roles">
                                <h4>Thêm vai trò:</h4>
                                {/* Giới hạn: Nếu user đã có 1 role thì disable nút thêm */}
                                {selectedUser.roles && selectedUser.roles.length > 0 ? (
                                    <p className="limitation-note">
                                        <em>Người dùng chỉ có thể có 1 vai trò tại một thời điểm. Vui lòng xóa vai trò hiện tại trước khi thêm vai trò mới.</em>
                                    </p>
                                ) : (
                                    <div className="roles-list">
                                        {availableRoles.map(role => {
                                            const hasRole = selectedUser.roles?.some(userRole => userRole.RoleID === role.RoleID);
                                            return (
                                                <div key={role.RoleID} className="role-item">
                                                    <span className="role-badge">{role.RoleName}</span>
                                                    <button
                                                        className="btn btn-assign-role"
                                                        onClick={() => handleAssignRole(role.RoleID)}
                                                        disabled={hasRole || processingUserIds.has(selectedUser.UserID)}
                                                    >
                                                        {hasRole ? 'Đã có' : 'Thêm'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={handleCloseModal}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserTable;

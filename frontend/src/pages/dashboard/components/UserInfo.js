import React from 'react';
import './UserInfo.css';

const UserInfo = ({ user, loading = false }) => {
    if (loading) {
        return (
            <div className="user-info loading">
                <div className="user-info-skeleton">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-details">
                        <div className="skeleton-line skeleton-name"></div>
                        <div className="skeleton-line skeleton-email"></div>
                        <div className="skeleton-line skeleton-department"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="user-info error">
                <div className="error-message">
                    <p>Không thể tải thông tin người dùng</p>
                </div>
            </div>
        );
    }

    return (
        <div className="user-info">
            <div className="user-info-card">
                <div className="user-avatar">
                    <span className="avatar-initial">
                        {(user.FullName || user.Username || 'U').charAt(0).toUpperCase()}
                    </span>
                </div>
                
                <div className="user-details">
                    <div className="user-name">
                        <h3>{user.FullName || user.Username || 'Unknown User'}</h3>
                        <div className="user-role">
                            {user.roles && user.roles.length > 0 
                                ? user.roles.map((role, index) => (
                                    <span key={index} className="role-tag">
                                        {role.RoleName}
                                    </span>
                                ))
                                : <span className="default-role">User</span>
                            }
                        </div>
                    </div>
                    
                    <div className="user-info-grid">
                        <div className="info-item">
                            <label>Username:</label>
                            <span>{user.Username || 'N/A'}</span>
                        </div>
                        
                        <div className="info-item">
                            <label>Email:</label>
                            <span>{user.Email || 'N/A'}</span>
                        </div>
                        
                        <div className="info-item">
                            <label>Department:</label>
                            <span>{user.DepartmentName || 'N/A'}</span>
                        </div>
                        
                        <div className="info-item">
                            <label>Roles:</label>
                            <div className="roles-container">
                                {user.roles && user.roles.length > 0 
                                    ? user.roles.map((role, index) => (
                                        <span key={index} className="role-badge" title={role.Description}>
                                            {role.RoleName}
                                        </span>
                                    ))
                                    : <span className="no-roles">No roles assigned</span>
                                }
                            </div>
                        </div>
                        
                        <div className="info-item">
                            <label>Status:</label>
                            <span className={`status ${user.IsActive ? 'active' : 'inactive'}`}>
                                {user.IsActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        
                        {user.CreatedAt && (
                            <div className="info-item">
                                <label>Member since:</label>
                                <span>{new Date(user.CreatedAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;

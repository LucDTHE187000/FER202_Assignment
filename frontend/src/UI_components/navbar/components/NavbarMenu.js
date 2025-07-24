import React from 'react';
import { Link } from 'react-router-dom';

const NavbarMenu = ({ 
    isAuthenticated, 
    isDirector, 
    isDepartmentLeader, 
    isEmployee, 
    user, 
    roleIds,
    onLogout 
}) => {
    // Debug logging  
    console.log('NavbarMenu Debug:', {
        isAuthenticated,
        user,
        userRoles: user?.roles,
        roleIds,
        isDirector,
        isDepartmentLeader,
        isEmployee
    });

    if (!isAuthenticated || !user) {
        return (
            <Link to="/login" className="navbar-item login-link">
                Login
            </Link>
        );
    }

    return (
        <>
            <Link to="/dashboard" className="navbar-item">
                Dashboard
            </Link>

            {/* Các nút dành riêng cho Director */}
            {isDirector && (
                <>

                    <Link to="/user-role-management" className="navbar-item">
                        Quản lí người dùng
                    </Link>
                    <Link to="/leave-manage" className="navbar-item">
                        Quản lí đơn
                    </Link>
                    <Link to="/leave-report" className="navbar-item">
                        Xem báo cáo
                    </Link>
                </>
            )}

            {/* Các nút dành riêng cho Department Leader */}
            {isDepartmentLeader && (
                <>
                    <Link to="/leave-manage" className="navbar-item">
                        Quản lí đơn
                    </Link>
                    <Link to="/my-leave-request" className="navbar-item">
                        Đơn Nghỉ Của Tôi
                    </Link>
                    <Link to="/leave-request-create" className="navbar-item">
                        Tạo Đơn Nghỉ Phép
                    </Link>
                </>
            )}

            {/* Các nút dành riêng cho Employee */}
            {isEmployee && (
                <>
                    <Link to="/my-leave-request" className="navbar-item">
                        Đơn Nghỉ Của Tôi
                    </Link>
                    <Link to="/leave-request-create" className="navbar-item">
                        Tạo Đơn Nghỉ Phép
                    </Link>
                </>
            )}

            <div className="navbar-user">
                <span className="user-name">
                    Welcome, {user.FullName || user.Username || 'User'}
                    {/* Debug: Hiển thị roles để kiểm tra */}
                    {user.roles && user.roles.length > 0 && (
                        <small style={{ display: 'block', fontSize: '12px', opacity: 0.7 }}>
                            ({user.roles.map(role => role.RoleName).join(', ')})
                        </small>
                    )}
                </span>
                <button onClick={onLogout} className="logout-btn">
                    Logout
                </button>
            </div>
        </>
    );
};

export default NavbarMenu;

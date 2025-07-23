import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import useNavbarPermissions from './hooks/useNavbarPermissions';
import NavbarMenu from './components/NavbarMenu';
import UserDebugInfo from './components/UserDebugInfo';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const { logout } = useUser();
    const { 
        isDirector, 
        isDepartmentLeader, 
        isEmployee, 
        loading, 
        user,
        userRoles,
        roleNames,
        roleIds
    } = useNavbarPermissions();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Vẫn điều hướng về login dù có lỗi
            navigate('/login');
        }
    };

    // Debug logging để kiểm tra phân quyền
    console.log('Navbar Debug:', {
        user: user?.Username,
        roles: user?.roles,
        roleNames,
        roleIds,
        isDirector,
        isDepartmentLeader, 
        isEmployee
    });

    if (loading) {
        return (
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-brand">
                        <Link to="/" className="navbar-logo">
                            Leave Management System
                        </Link>
                    </div>
                    <div className="navbar-menu">
                        <span>Loading...</span>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="navbar">
            <UserDebugInfo user={user} />
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/" className="navbar-logo">
                        Leave Management System
                    </Link>
                </div>

                <div className="navbar-menu">
                    <NavbarMenu
                        isAuthenticated={!!user}
                        isDirector={isDirector}
                        isDepartmentLeader={isDepartmentLeader}
                        isEmployee={isEmployee}
                        user={user}
                        roleIds={roleIds}
                        onLogout={handleLogout}
                    />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
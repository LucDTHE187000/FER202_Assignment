import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, loading } = useUser();

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
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/" className="navbar-logo">
                        Leave Management System
                    </Link>
                </div>

                <div className="navbar-menu">
                    {isAuthenticated && user ? (
                        <>
                            <Link to="/dashboard" className="navbar-item">
                                Dashboard
                            </Link>
                            <Link to="/leave-request-create" className="navbar-item">
                                Tạo Đơn Nghỉ Phép
                            </Link>
                            <Link to="/my-leave-request" className="navbar-item">
                                Đơn Nghỉ Của Tôi
                            </Link>
                            <div className="navbar-user">
                                <span className="user-name">
                                    Welcome, {user.FullName || user.Username || 'User'}
                                </span>
                                <button onClick={handleLogout} className="logout-btn">
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <Link to="/login" className="navbar-item login-link">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import useDashboard from './useDashboard';
import DashboardStats from './components/DashboardStats';
import UserInfo from './components/UserInfo';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user: contextUser, isAuthenticated } = useUser();
    const {
        user,
        stats,
        loading,
        error,
        refreshData
    } = useDashboard();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return <div>Redirecting to login...</div>;
    }

    if (error) {
        return (
            <div className="dashboard">
                <div className="error-container">
                    <div className="error-message">
                        <h3>Có lỗi xảy ra</h3>
                        <p>{error}</p>
                        <button onClick={refreshData} className="retry-btn">
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                {(contextUser || user) && (
                    <p>Chào mừng trở lại, <strong>{(contextUser || user).FullName || (contextUser || user).Username || 'User'}</strong>!</p>
                )}
            </div>

            {/* User Info Section */}
            <UserInfo user={contextUser || user} loading={loading} />

            <DashboardStats stats={stats} loading={loading} />

            <div className="dashboard-content">
                <div className="dashboard-section">
                    <h2>Hoạt động gần đây</h2>
                    <div className="activity-list">
                        {loading ? (
                            <p>Đang tải...</p>
                        ) : (
                            <div className="no-activity">
                                <p>Chưa có hoạt động nào</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Thông báo</h2>
                    <div className="notifications">
                        <div className="notification-item">
                            <div className="notification-icon">ℹ️</div>
                            <div className="notification-content">
                                <p>Hệ thống đang hoạt động bình thường</p>
                                <small>Vừa cập nhật</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

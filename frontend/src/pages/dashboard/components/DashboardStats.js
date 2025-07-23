import React from 'react';
import './DashboardStats.css';

const DashboardStats = ({ stats, loading }) => {
    const statsData = [
        {
            title: 'Tổng người dùng',
            value: stats.totalUsers,
            icon: '👥',
            color: 'blue'
        },
        {
            title: 'Tổng đơn nghỉ phép',
            value: stats.totalLeaveRequests,
            icon: '📋',
            color: 'green'
        },
        {
            title: 'Đang chờ duyệt',
            value: stats.pendingRequests,
            icon: '⏳',
            color: 'orange'
        },
        {
            title: 'Đã được duyệt',
            value: stats.approvedRequests,
            icon: '✅',
            color: 'success'
        }
    ];

    if (loading) {
        return (
            <div className="dashboard-stats">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="stat-card loading">
                        <div className="stat-skeleton"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="dashboard-stats">
            {statsData.map((stat, index) => (
                <div key={index} className={`stat-card ${stat.color}`}>
                    <div className="stat-icon">
                        {stat.icon}
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-title">{stat.title}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;

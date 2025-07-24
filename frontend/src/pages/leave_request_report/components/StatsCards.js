import React from 'react';

const StatsCards = ({ stats, loading }) => {
    const statsData = [
        {
            title: 'Tổng đơn nghỉ phép',
            value: stats.overview?.totalRequests || 0,
            icon: '📋',
            color: 'blue'
        },
        {
            title: 'Đã được duyệt',
            value: stats.overview?.approvedRequests || 0,
            icon: '✅',
            color: 'success'
        },
        {
            title: 'Đang chờ duyệt',
            value: stats.overview?.pendingRequests || 0,
            icon: '⏳',
            color: 'orange'
        },
        {
            title: 'Đã từ chối',
            value: stats.overview?.rejectedRequests || 0,
            icon: '❌',
            color: 'danger'
        },
        {
            title: 'Đơn năm nay',
            value: stats.overview?.thisYearRequests || 0,
            icon: '📅',
            color: 'info'
        },
        {
            title: 'Đơn tháng này',
            value: stats.overview?.thisMonthRequests || 0,
            icon: '📆',
            color: 'warning'
        }
    ];

    if (loading) {
        return (
            <div className="stats-cards">
                {statsData.map((_, index) => (
                    <div key={index} className="stat-card loading">
                        <div className="stat-skeleton">
                            <div className="skeleton-icon"></div>
                            <div className="skeleton-content">
                                <div className="skeleton-value"></div>
                                <div className="skeleton-title"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="stats-cards">
            {statsData.map((stat, index) => (
                <div key={index} className={`stat-card ${stat.color}`}>
                    <div className="stat-icon">
                        <span>{stat.icon}</span>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stat.value.toLocaleString()}</div>
                        <div className="stat-title">{stat.title}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;

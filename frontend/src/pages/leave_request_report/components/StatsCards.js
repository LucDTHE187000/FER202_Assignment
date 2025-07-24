import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import './StatsCards.css';

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
            <Row className="g-3">
                {statsData.map((_, index) => (
                    <Col key={index} xl={2} lg={3} md={4} sm={6} xs={12}>
                        <Card className="h-100 stat-card loading">
                            <Card.Body className="d-flex align-items-center">
                                <div className="stat-skeleton">
                                    <div className="skeleton-icon"></div>
                                    <div className="skeleton-content">
                                        <div className="skeleton-value"></div>
                                        <div className="skeleton-title"></div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    }

    return (
        <Row className="g-3">
            {statsData.map((stat, index) => (
                <Col key={index} xl={2} lg={3} md={4} sm={6} xs={12}>
                    <Card className={`h-100 stat-card border-0 shadow-sm stat-${stat.color}`}>
                        <Card.Body className="d-flex align-items-center p-3">
                            <div className="stat-icon me-3 flex-shrink-0">
                                <span className="fs-2">{stat.icon}</span>
                            </div>
                            <div className="stat-content flex-grow-1">
                                <div className="stat-value fw-bold fs-4 mb-1">
                                    {stat.value.toLocaleString()}
                                </div>
                                <div className="stat-title text-muted small">
                                    {stat.title}
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default StatsCards;

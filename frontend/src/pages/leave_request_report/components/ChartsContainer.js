import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Đăng ký các components của Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement, 
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const ChartsContainer = ({ stats, loading }) => {
    if (loading) {
        return (
            <div className="charts-container">
                <div className="chart-loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải biểu đồ...</p>
                </div>
            </div>
        );
    }

    // Dữ liệu cho biểu đồ cột - thống kê theo phòng ban
    const departmentChartData = {
        labels: stats.departmentStats?.map(dept => dept.DepartmentName) || [],
        datasets: [
            {
                label: 'Tổng đơn',
                data: stats.departmentStats?.map(dept => dept.totalRequests) || [],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            },
            {
                label: 'Đã duyệt',
                data: stats.departmentStats?.map(dept => dept.approvedRequests) || [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }
        ]
    };

    // Dữ liệu cho biểu đồ đường - xu hướng theo tháng
    const monthlyTrendData = {
        labels: stats.monthlyStats?.map(month => month.monthYear) || [],
        datasets: [
            {
                label: 'Đơn nghỉ phép theo tháng',
                data: stats.monthlyStats?.map(month => month.totalRequests) || [],
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.4
            },
            {
                label: 'Đơn đã duyệt theo tháng',
                data: stats.monthlyStats?.map(month => month.approvedRequests) || [],
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.4
            }
        ]
    };

    // Dữ liệu cho biểu đồ tròn - tỷ lệ trạng thái
    const statusPieData = {
        labels: ['Đã duyệt', 'Chờ duyệt', 'Từ chối'],
        datasets: [
            {
                data: [
                    stats.overview?.approvedRequests || 0,
                    stats.overview?.pendingRequests || 0,
                    stats.overview?.rejectedRequests || 0
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(255, 99, 132, 0.8)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 2
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    };

    return (
        <div className="charts-container">
            <div className="charts-grid">
                {/* Biểu đồ cột - Thống kê theo phòng ban */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Thống kê theo phòng ban</h3>
                    </div>
                    <div className="chart-content">
                        <Bar data={departmentChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Biểu đồ tròn - Tỷ lệ trạng thái */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Tỷ lệ trạng thái đơn</h3>
                    </div>
                    <div className="chart-content">
                        <Doughnut data={statusPieData} options={pieOptions} />
                    </div>
                </div>

                {/* Biểu đồ đường - Xu hướng theo tháng */}
                <div className="chart-card chart-wide">
                    <div className="chart-header">
                        <h3>Xu hướng đơn nghỉ phép theo tháng</h3>
                    </div>
                    <div className="chart-content">
                        <Line data={monthlyTrendData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChartsContainer;

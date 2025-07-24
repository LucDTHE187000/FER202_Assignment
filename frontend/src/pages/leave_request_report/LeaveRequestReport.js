import React, { useState, useEffect } from 'react';
import useLeaveReport from './hooks/useLeaveReport';
import useLeaveReportPermissions from './hooks/useLeaveReportPermissions';
import apiService from '../../services/api';
import StatsCards from './components/StatsCards';
import ChartsContainer from './components/ChartsContainer';
import ReportTable from './components/ReportTable';
import './LeaveRequestReport.css';

const LeaveRequestReport = () => {
    const { canViewReports, loading: permissionLoading } = useLeaveReportPermissions();
    const [departments, setDepartments] = useState([]);
    const [filters, setFilters] = useState({
        departmentId: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    const {
        stats,
        detailedData,
        employeeSummary,
        loading,
        error,
        fetchReportData,
        exportToExcel
    } = useLeaveReport();

    // Fetch dữ liệu khi component mount hoặc khi có quyền
    useEffect(() => {
        if (canViewReports) {
            fetchReportData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canViewReports]); // Chỉ chạy khi canViewReports thay đổi

    // XÓA useEffect thứ hai để tránh infinite loop - sẽ gọi fetchReportData qua handleFiltersChange

    // Fetch danh sách departments cho dropdown
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await apiService.getDepartments();
                setDepartments(response.data || []);
            } catch (error) {
                console.error('Error fetching departments:', error);
                // Fallback to sample data if API fails
                setDepartments([
                    { DepartmentID: 1, DepartmentName: 'Nhân sự' },
                    { DepartmentID: 2, DepartmentName: 'Kỹ thuật' },
                    { DepartmentID: 3, DepartmentName: 'Marketing' },
                    { DepartmentID: 4, DepartmentName: 'Tài chính' }
                ]);
            }
        };

        if (canViewReports) {
            fetchDepartments();
        }
    }, [canViewReports]);

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        // Gọi API với filters mới
        if (canViewReports) {
            fetchReportData(newFilters);
        }
    };

    const handleRefresh = () => {
        fetchReportData(filters);
    };

    const handleExportExcel = () => {
        exportToExcel(employeeSummary, `BaoCaoNghiPhep_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (permissionLoading) {
        return (
            <div className="leave-request-report">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang kiểm tra quyền truy cập...</p>
                </div>
            </div>
        );
    }

    if (!canViewReports) {
        return (
            <div className="leave-request-report">
                <div className="permission-denied">
                    <h3>Không có quyền truy cập</h3>
                    <p>Bạn không có quyền xem báo cáo nghỉ phép. Chỉ Director mới có thể truy cập chức năng này.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="leave-request-report">
            {/* Header */}
            <div className="report-header">
                <h1 className="report-title">Báo cáo nghỉ phép</h1>
                <div className="report-actions">
                    <button 
                        className="refresh-button" 
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        <span>🔄</span>
                        {loading ? 'Đang tải...' : 'Làm mới'}
                    </button>
                    <button 
                        className="export-button" 
                        onClick={handleExportExcel}
                        disabled={loading || !employeeSummary || employeeSummary.length === 0}
                    >
                        <span>📊</span>
                        Xuất Excel
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <strong>Lỗi:</strong> {error}
                </div>
            )}

            {/* Stats Cards */}
            <div className="stats-container">
                <StatsCards stats={stats} loading={loading} />
            </div>

            {/* Charts */}
            <div className="charts-section">
                <ChartsContainer stats={stats} loading={loading} />
            </div>

            {/* Detailed Report Table */}
            <div className="table-section">
                <h2 style={{ 
                    marginBottom: '20px', 
                    color: '#2c3e50', 
                    fontSize: '24px',
                    fontWeight: '600'
                }}>
                    Chi tiết đơn nghỉ phép
                </h2>
                
                {/* Enhanced ReportTable with department options */}
                <ReportTable 
                    data={detailedData} 
                    loading={loading}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    departments={departments}
                />
            </div>
        </div>
    );
};

export default LeaveRequestReport;

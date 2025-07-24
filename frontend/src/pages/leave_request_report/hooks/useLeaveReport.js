import { useState, useEffect, useCallback } from 'react';
import apiService from '../../../services/api';
import useLeaveReportPermissions from './useLeaveReportPermissions';

const useLeaveReport = () => {
    const [stats, setStats] = useState({
        overview: {
            totalRequests: 0,
            approvedRequests: 0,
            rejectedRequests: 0,
            pendingRequests: 0,
            thisYearRequests: 0,
            thisMonthRequests: 0
        },
        departmentStats: [],
        monthlyStats: []
    });
    const [detailedData, setDetailedData] = useState([]);
    const [employeeSummary, setEmployeeSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        departmentId: 'all',
        fromDate: '',
        toDate: '',
        status: 'all',
        year: new Date().getFullYear()
    });

    const { canViewReports } = useLeaveReportPermissions();

    // Cập nhật bộ lọc
    const updateFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    // Main data fetching function that components expect
    const fetchReportData = useCallback(async (newFilters = {}) => {
        if (!canViewReports) return;

        try {
            setLoading(true);
            setError('');
            
            // Sử dụng filters được truyền vào hoặc filters hiện tại
            const currentFilters = Object.keys(newFilters).length > 0 ? 
                { ...filters, ...newFilters } : filters;
            
            // Update filters nếu có filters mới
            if (Object.keys(newFilters).length > 0) {
                setFilters(prev => ({ ...prev, ...newFilters }));
            }

            // Gọi trực tiếp API thay vì sử dụng các function khác để tránh vòng lặp
            const [statsResponse, detailedResponse, summaryResponse] = await Promise.all([
                apiService.getLeaveStats(),
                apiService.getDetailedReport(currentFilters),
                apiService.getEmployeeSummary(currentFilters.year)
            ]);

            // Xử lý kết quả
            if (statsResponse.success) {
                setStats(statsResponse.data);
            }
            if (detailedResponse.success) {
                setDetailedData(detailedResponse.data);
            }
            if (summaryResponse.success) {
                setEmployeeSummary(summaryResponse.data);
            }

        } catch (error) {
            console.error('Error fetching report data:', error);
            setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu báo cáo');
        } finally {
            setLoading(false);
        }
    }, [canViewReports]); // CHỈ depend vào canViewReports

    // Export to Excel
    const exportToExcel = () => {
        try {
            // Chuẩn bị dữ liệu cho Excel
            const excelData = employeeSummary.map(employee => ({
                'Mã NV': employee.UserID,
                'Họ và tên': employee.EmployeeName,
                'Tên đăng nhập': employee.Username,
                'Phòng ban': employee.DepartmentName,
                'Tổng đơn': employee.TotalRequests,
                'Đã duyệt': employee.ApprovedRequests,
                'Từ chối': employee.RejectedRequests,
                'Chờ duyệt': employee.PendingRequests,
                'Tổng ngày nghỉ': employee.TotalApprovedDays,
                'Đơn cuối': employee.LastRequestDate ? new Date(employee.LastRequestDate).toLocaleDateString('vi-VN') : 'Chưa có'
            }));

            // Tạo worksheet và workbook
            const XLSX = require('xlsx');
            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo nghỉ phép');

            // Xuất file
            const fileName = `BaoCaoNghiPhep_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);

            return { success: true, message: 'Xuất Excel thành công' };
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            return { success: false, message: 'Có lỗi xảy ra khi xuất Excel' };
        }
    };

    // Load data khi component mount hoặc khi có quyền
    useEffect(() => {
        if (canViewReports) {
            fetchReportData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canViewReports]); // Chỉ dependency là canViewReports để tránh vòng lặp

    // Không cần useEffect thứ hai vì fetchReportData đã gọi tất cả API cần thiết

    // Refresh function (alias for fetchReportData)
    const refresh = () => {
        if (canViewReports) {
            fetchReportData();
        }
    };

    return {
        stats,
        detailedData,
        employeeSummary,
        loading,
        error,
        filters,
        canViewReports,
        updateFilters,
        fetchReportData,
        exportToExcel,
        refresh
    };
};

export default useLeaveReport;

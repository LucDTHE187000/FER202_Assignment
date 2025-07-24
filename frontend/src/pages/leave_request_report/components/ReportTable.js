import React, { useState } from 'react';

const ReportTable = ({ data, loading, filters, onFiltersChange, departments = [] }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = React.useMemo(() => {
        let filteredData = data || [];
        
        // Lọc theo filters
        if (filters) {
            filteredData = filteredData.filter(item => {
                // Lọc theo phòng ban
                if (filters.departmentId && item.DepartmentID !== parseInt(filters.departmentId)) {
                    return false;
                }
                
                // Lọc theo trạng thái
                if (filters.status && item.StatusID !== parseInt(filters.status)) {
                    return false;
                }
                
                // Lọc theo từ ngày - các đơn có ngày kết thúc >= từ ngày
                if (filters.startDate) {
                    const startDate = new Date(filters.startDate);
                    const itemToDate = new Date(item.ToDate);
                    
                    // Đơn nghỉ phải có ít nhất một phần nằm trong khoảng thời gian lọc
                    if (itemToDate < startDate) {
                        return false;
                    }
                }
                
                // Lọc theo đến ngày - các đơn có ngày bắt đầu <= đến ngày  
                if (filters.endDate) {
                    const endDate = new Date(filters.endDate);
                    const itemFromDate = new Date(item.FromDate);
                    
                    // Đơn nghỉ phải có ít nhất một phần nằm trong khoảng thời gian lọc
                    if (itemFromDate > endDate) {
                        return false;
                    }
                }
                
                return true;
            });
        }
        
        // Sắp xếp dữ liệu đã lọc
        if (!sortConfig.key) return filteredData;
        
        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            
            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [data, sortConfig, filters]);

    const getStatusBadge = (status) => {
        const statusMap = {
            1: { text: 'Đã duyệt', class: 'status-approved' },
            2: { text: 'Từ chối', class: 'status-rejected' },
            3: { text: 'Chờ duyệt', class: 'status-pending' }
        };
        
        const statusInfo = statusMap[status] || { text: 'Không xác định', class: 'status-unknown' };
        return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <div className="report-table-container">
                <div className="table-loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="report-table-container">
            {/* Bộ lọc */}
            <div className="table-filters">
                <div className="filter-row">
                    <div className="filter-group">
                        <label>Phòng ban:</label>
                        <select 
                            value={filters.departmentId} 
                            onChange={(e) => onFiltersChange({ ...filters, departmentId: e.target.value })}
                        >
                            <option value="">Tất cả phòng ban</option>
                            {departments.map(dept => (
                                <option key={dept.DepartmentID} value={dept.DepartmentID}>
                                    {dept.DepartmentName}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label>Trạng thái:</label>
                        <select 
                            value={filters.status} 
                            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="3">Chờ duyệt</option>
                            <option value="1">Đã duyệt</option>
                            <option value="2">Từ chối</option>
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label>Từ ngày:</label>
                        <input 
                            type="date" 
                            value={filters.startDate}
                            onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
                        />
                    </div>
                    
                    <div className="filter-group">
                        <label>Đến ngày:</label>
                        <input 
                            type="date" 
                            value={filters.endDate}
                            onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="table-wrapper">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th 
                                onClick={() => handleSort('RequestID')}
                                className={sortConfig.key === 'RequestID' ? `sorted-${sortConfig.direction}` : ''}
                            >
                                Mã đơn
                                <span className="sort-indicator">
                                    {sortConfig.key === 'RequestID' && (
                                        sortConfig.direction === 'asc' ? '↑' : '↓'
                                    )}
                                </span>
                            </th>
                            <th 
                                onClick={() => handleSort('EmployeeName')}
                                className={sortConfig.key === 'EmployeeName' ? `sorted-${sortConfig.direction}` : ''}
                            >
                                Nhân viên
                                <span className="sort-indicator">
                                    {sortConfig.key === 'EmployeeName' && (
                                        sortConfig.direction === 'asc' ? '↑' : '↓'
                                    )}
                                </span>
                            </th>
                            <th 
                                onClick={() => handleSort('DepartmentName')}
                                className={sortConfig.key === 'DepartmentName' ? `sorted-${sortConfig.direction}` : ''}
                            >
                                Phòng ban
                                <span className="sort-indicator">
                                    {sortConfig.key === 'DepartmentName' && (
                                        sortConfig.direction === 'asc' ? '↑' : '↓'
                                    )}
                                </span>
                            </th>
                            <th 
                                onClick={() => handleSort('FromDate')}
                                className={sortConfig.key === 'FromDate' ? `sorted-${sortConfig.direction}` : ''}
                            >
                                Ngày bắt đầu
                                <span className="sort-indicator">
                                    {sortConfig.key === 'FromDate' && (
                                        sortConfig.direction === 'asc' ? '↑' : '↓'
                                    )}
                                </span>
                            </th>
                            <th 
                                onClick={() => handleSort('ToDate')}
                                className={sortConfig.key === 'ToDate' ? `sorted-${sortConfig.direction}` : ''}
                            >
                                Ngày kết thúc
                                <span className="sort-indicator">
                                    {sortConfig.key === 'ToDate' && (
                                        sortConfig.direction === 'asc' ? '↑' : '↓'
                                    )}
                                </span>
                            </th>
                            <th>
                                Số ngày
                            </th>
                            <th>
                                Lý do
                            </th>
                            <th 
                                onClick={() => handleSort('StatusID')}
                                className={sortConfig.key === 'StatusID' ? `sorted-${sortConfig.direction}` : ''}
                            >
                                Trạng thái
                                <span className="sort-indicator">
                                    {sortConfig.key === 'StatusID' && (
                                        sortConfig.direction === 'asc' ? '↑' : '↓'
                                    )}
                                </span>
                            </th>
                            <th 
                                onClick={() => handleSort('CreatedAt')}
                                className={sortConfig.key === 'CreatedAt' ? `sorted-${sortConfig.direction}` : ''}
                            >
                                Ngày tạo
                                <span className="sort-indicator">
                                    {sortConfig.key === 'CreatedAt' && (
                                        sortConfig.direction === 'asc' ? '↑' : '↓'
                                    )}
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="no-data">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((request) => (
                                <tr key={request.RequestID}>
                                    <td>{request.RequestID}</td>
                                    <td>{request.EmployeeName}</td>
                                    <td>{request.DepartmentName}</td>
                                    <td>{formatDate(request.FromDate)}</td>
                                    <td>{formatDate(request.ToDate)}</td>
                                    <td>{request.TotalDays || 'N/A'}</td>
                                    <td className="reason-cell" title={request.Reason}>
                                        {request.Reason && request.Reason.length > 50 
                                            ? `${request.Reason.substring(0, 50)}...` 
                                            : request.Reason || 'Không có'}
                                    </td>
                                    <td>{getStatusBadge(request.StatusID)}</td>
                                    <td>{formatDate(request.CreatedAt)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Thông tin phân trang */}
            {sortedData.length > 0 && (
                <div className="table-footer">
                    <div className="table-info">
                        Hiển thị {sortedData.length} kết quả
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportTable;

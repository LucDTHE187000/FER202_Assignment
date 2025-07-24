const DBContext = require('./DBContext');
const LeaveRequest = require('../model/LeaveRequest');
const sql = require('mssql');

class LeaveRequestDBContext extends DBContext {
    constructor() {
        super();
    }

    async list() {
        try {
            const query = `
                SELECT lr.*, 
                       u.FullName as RequestorName, u.Username, u.DepartmentID,
                       d.DepartmentName,
                       ls.StatusName,
                       approver.FullName as ApproverName
                FROM LeaveRequest lr
                LEFT JOIN [User] u ON lr.UserID = u.UserID
                LEFT JOIN Department d ON u.DepartmentID = d.DepartmentID
                LEFT JOIN LeaveStatus ls ON lr.StatusID = ls.StatusID
                LEFT JOIN [User] approver ON lr.ApprovedBy = approver.UserID
                ORDER BY lr.CreatedAt DESC
            `;
            
            const result = await this.executeQuery(query);
            return result.recordset.map(row => {
                const leaveRequest = LeaveRequest.fromDatabase(row);
                // Add additional user and department info to the leave request object
                leaveRequest.User = {
                    FullName: row.RequestorName,
                    Username: row.Username,
                    DepartmentID: row.DepartmentID,
                    Department: {
                        DepartmentName: row.DepartmentName
                    }
                };
                return leaveRequest;
            });
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            throw error;
        }
    }

    async get(id) {
        try {
            const query = `
                SELECT lr.*, 
                       u.FullName as RequestorName, u.Username, u.DepartmentID,
                       d.DepartmentName,
                       ls.StatusName,
                       approver.FullName as ApproverName
                FROM LeaveRequest lr
                LEFT JOIN [User] u ON lr.UserID = u.UserID
                LEFT JOIN Department d ON u.DepartmentID = d.DepartmentID
                LEFT JOIN LeaveStatus ls ON lr.StatusID = ls.StatusID
                LEFT JOIN [User] approver ON lr.ApprovedBy = approver.UserID
                WHERE lr.RequestID = @id
            `;
            
            const result = await this.executeQuery(query, { id: id });
            
            if (result.recordset.length === 0) {
                return null;
            }

            const row = result.recordset[0];
            const leaveRequest = LeaveRequest.fromDatabase(row);
            // Add additional user and department info to the leave request object
            leaveRequest.User = {
                FullName: row.RequestorName,
                Username: row.Username,
                DepartmentID: row.DepartmentID,
                Department: {
                    DepartmentName: row.DepartmentName
                }
            };
            return leaveRequest;
        } catch (error) {
            console.error('Error fetching leave request by ID:', error);
            throw error;
        }
    }

    async insert(leaveRequestModel) {
        try {
            const validation = leaveRequestModel.validate();
            if (!validation.isValid) {
                throw new Error('Validation failed: ' + validation.errors.join(', '));
            }

            const query = `
                INSERT INTO LeaveRequest (UserID, FromDate, ToDate, Reason, StatusID, CreatedAt, UpdatedAt)
                OUTPUT INSERTED.*
                VALUES (@UserID, @FromDate, @ToDate, @Reason, @StatusID, @CreatedAt, @UpdatedAt)
            `;

            const data = leaveRequestModel.toDatabase();
            data.CreatedAt = new Date();
            data.UpdatedAt = new Date();
            data.StatusID = 3; // Default to Pending status
            
            const result = await this.executeQuery(query, data);
            return LeaveRequest.fromDatabase(result.recordset[0]);
        } catch (error) {
            console.error('Error inserting leave request:', error);
            throw error;
        }
    }

    async update(leaveRequestModel) {
        try {
            const query = `
                UPDATE LeaveRequest 
                SET FromDate = @FromDate, 
                    ToDate = @ToDate, 
                    Reason = @Reason, 
                    StatusID = @StatusID, 
                    ApprovedBy = @ApprovedBy,
                    UpdatedAt = @UpdatedAt
                OUTPUT INSERTED.*
                WHERE RequestID = @RequestID
            `;

            const data = leaveRequestModel.toDatabase();
            data.UpdatedAt = new Date();
            
            const result = await this.executeQuery(query, data);
            
            if (result.recordset.length === 0) {
                throw new Error('Leave request not found');
            }
            
            return LeaveRequest.fromDatabase(result.recordset[0]);
        } catch (error) {
            console.error('Error updating leave request:', error);
            throw error;
        }
    }

    async delete(leaveRequestModel) {
        try {
            const query = `DELETE FROM LeaveRequest WHERE RequestID = @RequestID`;
            
            const result = await this.executeQuery(query, { RequestID: leaveRequestModel.RequestID });
            
            if (result.rowsAffected[0] === 0) {
                throw new Error('Leave request not found');
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting leave request:', error);
            throw error;
        }
    }

    // Additional methods specific to LeaveRequest
    async getByUserId(userId) {
        try {
            const query = `
                SELECT lr.*, 
                       u.FullName as RequestorName, u.Username, u.DepartmentID,
                       d.DepartmentName,
                       ls.StatusName,
                       approver.FullName as ApproverName
                FROM LeaveRequest lr
                LEFT JOIN [User] u ON lr.UserID = u.UserID
                LEFT JOIN Department d ON u.DepartmentID = d.DepartmentID
                LEFT JOIN LeaveStatus ls ON lr.StatusID = ls.StatusID
                LEFT JOIN [User] approver ON lr.ApprovedBy = approver.UserID
                WHERE lr.UserID = @userId
                ORDER BY lr.CreatedAt DESC
            `;
            
            const result = await this.executeQuery(query, { userId: userId });
            return result.recordset.map(row => {
                const leaveRequest = LeaveRequest.fromDatabase(row);
                // Add additional user and department info to the leave request object
                leaveRequest.User = {
                    FullName: row.RequestorName,
                    Username: row.Username,
                    DepartmentID: row.DepartmentID,
                    Department: {
                        DepartmentName: row.DepartmentName
                    }
                };
                return leaveRequest;
            });
        } catch (error) {
            console.error('Error fetching leave requests by user:', error);
            throw error;
        }
    }

    // Method to get leave requests by department ID for department leaders
    async getByDepartmentId(departmentId) {
        try {
            const query = `
                SELECT lr.*, 
                       u.FullName as RequestorName, u.Username, u.DepartmentID,
                       d.DepartmentName,
                       ls.StatusName,
                       approver.FullName as ApproverName
                FROM LeaveRequest lr
                LEFT JOIN [User] u ON lr.UserID = u.UserID
                LEFT JOIN Department d ON u.DepartmentID = d.DepartmentID
                LEFT JOIN LeaveStatus ls ON lr.StatusID = ls.StatusID
                LEFT JOIN [User] approver ON lr.ApprovedBy = approver.UserID
                WHERE u.DepartmentID = @departmentId
                ORDER BY lr.CreatedAt DESC
            `;
            
            const result = await this.executeQuery(query, { departmentId: departmentId });
            return result.recordset.map(row => {
                const leaveRequest = LeaveRequest.fromDatabase(row);
                // Add additional department info to the leave request object
                leaveRequest.User = {
                    FullName: row.RequestorName,
                    Username: row.Username,
                    DepartmentID: row.DepartmentID,
                    Department: {
                        DepartmentName: row.DepartmentName
                    }
                };
                return leaveRequest;
            });
        } catch (error) {
            console.error('Error fetching leave requests by department:', error);
            throw error;
        }
    }

    async getByStatus(statusId) {
        try {
            const query = `
                SELECT lr.*, 
                       u.FullName as RequestorName, u.Username, u.DepartmentID,
                       d.DepartmentName,
                       ls.StatusName,
                       approver.FullName as ApproverName
                FROM LeaveRequest lr
                LEFT JOIN [User] u ON lr.UserID = u.UserID
                LEFT JOIN Department d ON u.DepartmentID = d.DepartmentID
                LEFT JOIN LeaveStatus ls ON lr.StatusID = ls.StatusID
                LEFT JOIN [User] approver ON lr.ApprovedBy = approver.UserID
                WHERE lr.StatusID = @statusId
                ORDER BY lr.CreatedAt DESC
            `;
            
            const result = await this.executeQuery(query, { statusId: statusId });
            return result.recordset.map(row => {
                const leaveRequest = LeaveRequest.fromDatabase(row);
                // Add additional user and department info to the leave request object
                leaveRequest.User = {
                    FullName: row.RequestorName,
                    Username: row.Username,
                    DepartmentID: row.DepartmentID,
                    Department: {
                        DepartmentName: row.DepartmentName
                    }
                };
                return leaveRequest;
            });
        } catch (error) {
            console.error('Error fetching leave requests by status:', error);
            throw error;
        }
    }

    async approveRequest(requestId, approvedBy) {
        try {
            const query = `
                UPDATE LeaveRequest 
                SET StatusID = 1, ApprovedBy = @approvedBy, UpdatedAt = @UpdatedAt
                OUTPUT INSERTED.*
                WHERE RequestID = @requestId
            `;
            
            const params = {
                requestId: requestId,
                approvedBy: approvedBy,
                UpdatedAt: new Date()
            };
            
            const result = await this.executeQuery(query, params);
            
            if (result.recordset.length === 0) {
                throw new Error('Leave request not found');
            }
            
            return LeaveRequest.fromDatabase(result.recordset[0]);
        } catch (error) {
            console.error('Error approving leave request:', error);
            throw error;
        }
    }

    async rejectRequest(requestId, rejectedBy) {
        try {
            const query = `
                UPDATE LeaveRequest 
                SET StatusID = 2, ApprovedBy = @rejectedBy, UpdatedAt = @UpdatedAt
                OUTPUT INSERTED.*
                WHERE RequestID = @requestId
            `;
            
            const params = {
                requestId: requestId,
                rejectedBy: rejectedBy,
                UpdatedAt: new Date()
            };
            
            const result = await this.executeQuery(query, params);
            
            if (result.recordset.length === 0) {
                throw new Error('Leave request not found');
            }
            
            return LeaveRequest.fromDatabase(result.recordset[0]);
        } catch (error) {
            console.error('Error rejecting leave request:', error);
            throw error;
        }
    }

    async getByDateRange(fromDate, toDate) {
        try {
            const query = `
                SELECT lr.*, 
                       u.FullName as RequestorName, u.Username,
                       ls.StatusName,
                       approver.FullName as ApproverName
                FROM LeaveRequest lr
                LEFT JOIN [User] u ON lr.UserID = u.UserID
                LEFT JOIN LeaveStatus ls ON lr.StatusID = ls.StatusID
                LEFT JOIN [User] approver ON lr.ApprovedBy = approver.UserID
                WHERE lr.FromDate >= @fromDate AND lr.ToDate <= @toDate
                ORDER BY lr.FromDate
            `;
            
            const result = await this.executeQuery(query, { fromDate: fromDate, toDate: toDate });
            return result.recordset.map(row => LeaveRequest.fromDatabase(row));
        } catch (error) {
            console.error('Error fetching leave requests by date range:', error);
            throw error;
        }
    }

    // Method để kiểm tra date overlap cho một user
    async checkDateOverlap(userId, fromDate, toDate, excludeRequestId = null) {
        try {
            let query = `
                SELECT RequestID, FromDate, ToDate
                FROM LeaveRequest
                WHERE UserID = @userId
                AND StatusID IN (1, 3)  -- Chỉ kiểm tra đơn đã duyệt (1) và đang chờ duyệt (3)
                AND (
                    (@fromDate <= ToDate AND @toDate >= FromDate)
                )
            `;
            
            const params = {
                userId: userId,
                fromDate: fromDate,
                toDate: toDate
            };

            // Loại trừ request hiện tại nếu đang update
            if (excludeRequestId) {
                query += ` AND RequestID != @excludeRequestId`;
                params.excludeRequestId = excludeRequestId;
            }

            console.log('Executing date overlap query:', query);
            console.log('With params:', params);

            const result = await this.executeQuery(query, params);
            console.log('Date overlap query result:', result.recordset);
            return result.recordset;
        } catch (error) {
            console.error('Error checking date overlap:', error);
            throw error;
        }
    }

    // === REPORT METHODS ===
    
    // Lấy thống kê tổng quan về leave requests
    async getLeaveStats() {
        try {
            console.log('Getting leave statistics from DB...');
            
            // Query để lấy thống kê tổng quan
            const statsQuery = `
                SELECT 
                    COUNT(*) as totalRequests,
                    COUNT(CASE WHEN lr.StatusID = 1 THEN 1 END) as approvedRequests,
                    COUNT(CASE WHEN lr.StatusID = 2 THEN 1 END) as rejectedRequests,
                    COUNT(CASE WHEN lr.StatusID = 3 THEN 1 END) as pendingRequests,
                    COUNT(CASE WHEN YEAR(lr.FromDate) = YEAR(GETDATE()) THEN 1 END) as thisYearRequests,
                    COUNT(CASE WHEN YEAR(lr.FromDate) = YEAR(GETDATE()) AND MONTH(lr.FromDate) = MONTH(GETDATE()) THEN 1 END) as thisMonthRequests
                FROM LeaveRequest lr
                LEFT JOIN [User] u ON lr.UserID = u.UserID
                WHERE u.IsActive = 1
            `;

            const statsResult = await this.executeQuery(statsQuery);
            const stats = statsResult.recordset[0];

            // Query để lấy thống kê theo phòng ban
            const departmentStatsQuery = `
                SELECT 
                    d.DepartmentName,
                    d.DepartmentID,
                    COUNT(lr.RequestID) as totalRequests,
                    COUNT(CASE WHEN lr.StatusID = 1 THEN 1 END) as approvedRequests,
                    COUNT(CASE WHEN lr.StatusID = 2 THEN 1 END) as rejectedRequests,
                    COUNT(CASE WHEN lr.StatusID = 3 THEN 1 END) as pendingRequests,
                    COUNT(DISTINCT u.UserID) as totalEmployees
                FROM Department d
                LEFT JOIN [User] u ON d.DepartmentID = u.DepartmentID AND u.IsActive = 1
                LEFT JOIN LeaveRequest lr ON u.UserID = lr.UserID
                GROUP BY d.DepartmentID, d.DepartmentName
                ORDER BY d.DepartmentName
            `;

            const departmentStatsResult = await this.executeQuery(departmentStatsQuery);
            const departmentStats = departmentStatsResult.recordset;

            // Query để lấy thống kê theo tháng (12 tháng gần nhất)
            const monthlyStatsQuery = `
                SELECT 
                    YEAR(lr.FromDate) as year,
                    MONTH(lr.FromDate) as month,
                    DATENAME(MONTH, lr.FromDate) + ' ' + CAST(YEAR(lr.FromDate) AS VARCHAR) as monthYear,
                    COUNT(*) as totalRequests,
                    COUNT(CASE WHEN lr.StatusID = 1 THEN 1 END) as approvedRequests
                FROM LeaveRequest lr
                LEFT JOIN [User] u ON lr.UserID = u.UserID
                WHERE u.IsActive = 1 
                    AND lr.FromDate >= DATEADD(MONTH, -12, GETDATE())
                GROUP BY YEAR(lr.FromDate), MONTH(lr.FromDate), DATENAME(MONTH, lr.FromDate)
                ORDER BY YEAR(lr.FromDate), MONTH(lr.FromDate)
            `;

            const monthlyStatsResult = await this.executeQuery(monthlyStatsQuery);
            const monthlyStats = monthlyStatsResult.recordset;

            return {
                overview: stats,
                departmentStats,
                monthlyStats
            };
        } catch (error) {
            console.error('Error getting leave stats from DB:', error);
            throw error;
        }
    }

    // Lấy báo cáo chi tiết với bộ lọc
    async getDetailedReport(filters = {}) {
        try {
            console.log('Getting detailed leave report from DB...');
            
            const { departmentId, fromDate, toDate, status } = filters;

            let whereConditions = ['u.IsActive = 1'];
            let queryParams = {};

            // Thêm điều kiện lọc theo phòng ban
            if (departmentId && departmentId !== 'all') {
                whereConditions.push('u.DepartmentID = @departmentId');
                queryParams.departmentId = parseInt(departmentId);
            }

            // Thêm điều kiện lọc theo ngày
            if (fromDate) {
                whereConditions.push('lr.FromDate >= @fromDate');
                queryParams.fromDate = fromDate;
            }

            if (toDate) {
                whereConditions.push('lr.ToDate <= @toDate');
                queryParams.toDate = toDate;
            }

            // Thêm điều kiện lọc theo trạng thái
            if (status && status !== 'all') {
                whereConditions.push('lr.StatusID = @status');
                queryParams.status = parseInt(status);
            }

            const query = `
                SELECT 
                    lr.RequestID,
                    lr.FromDate,
                    lr.ToDate,
                    lr.Reason,
                    lr.CreatedAt,
                    lr.StatusID,
                    ls.StatusName,
                    u.UserID,
                    u.FullName as EmployeeName,
                    u.Username,
                    d.DepartmentID,
                    d.DepartmentName,
                    approver.FullName as ApproverName,
                    DATEDIFF(DAY, lr.FromDate, lr.ToDate) + 1 as TotalDays
                FROM LeaveRequest lr
                LEFT JOIN [User] u ON lr.UserID = u.UserID
                LEFT JOIN Department d ON u.DepartmentID = d.DepartmentID
                LEFT JOIN LeaveStatus ls ON lr.StatusID = ls.StatusID
                LEFT JOIN [User] approver ON lr.ApprovedBy = approver.UserID
                WHERE ${whereConditions.join(' AND ')}
                ORDER BY lr.CreatedAt DESC
            `;

            const result = await this.executeQuery(query, queryParams);
            return result.recordset;
        } catch (error) {
            console.error('Error getting detailed report from DB:', error);
            throw error;
        }
    }

    // Lấy tổng hợp theo nhân viên
    async getEmployeeSummary(year = null) {
        try {
            console.log('Getting employee leave summary from DB...');
            
            const currentYear = year || new Date().getFullYear();

            const query = `
                SELECT 
                    u.UserID,
                    u.FullName as EmployeeName,
                    u.Username,
                    d.DepartmentName,
                    COUNT(lr.RequestID) as TotalRequests,
                    COUNT(CASE WHEN lr.StatusID = 1 THEN 1 END) as ApprovedRequests,
                    COUNT(CASE WHEN lr.StatusID = 2 THEN 1 END) as RejectedRequests,
                    COUNT(CASE WHEN lr.StatusID = 3 THEN 1 END) as PendingRequests,
                    COALESCE(SUM(CASE WHEN lr.StatusID = 1 THEN DATEDIFF(DAY, lr.FromDate, lr.ToDate) + 1 ELSE 0 END), 0) as TotalApprovedDays,
                    COALESCE(MAX(lr.CreatedAt), NULL) as LastRequestDate
                FROM [User] u
                LEFT JOIN Department d ON u.DepartmentID = d.DepartmentID
                LEFT JOIN LeaveRequest lr ON u.UserID = lr.UserID 
                    AND YEAR(lr.FromDate) = @year
                WHERE u.IsActive = 1
                GROUP BY u.UserID, u.FullName, u.Username, d.DepartmentName
                ORDER BY d.DepartmentName, u.FullName
            `;

            const result = await this.executeQuery(query, { year: currentYear });
            return result.recordset;
        } catch (error) {
            console.error('Error getting employee summary from DB:', error);
            throw error;
        }
    }
}

module.exports = LeaveRequestDBContext;

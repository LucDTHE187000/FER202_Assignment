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
                       u.FullName as RequestorName, u.Username,
                       ls.StatusName,
                       approver.FullName as ApproverName
                FROM LeaveRequest lr
                LEFT JOIN [User] u ON lr.UserID = u.UserID
                LEFT JOIN LeaveStatus ls ON lr.StatusID = ls.StatusID
                LEFT JOIN [User] approver ON lr.ApprovedBy = approver.UserID
                ORDER BY lr.CreatedAt DESC
            `;
            
            const result = await this.executeQuery(query);
            return result.recordset.map(row => LeaveRequest.fromDatabase(row));
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            throw error;
        }
    }

    async get(id) {
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
                WHERE lr.RequestID = @id
            `;
            
            const result = await this.executeQuery(query, { id: id });
            
            if (result.recordset.length === 0) {
                return null;
            }
            
            return LeaveRequest.fromDatabase(result.recordset[0]);
        } catch (error) {
            console.error('Error fetching leave request:', error);
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
                       u.FullName as RequestorName, u.Username,
                       ls.StatusName,
                       approver.FullName as ApproverName
                FROM LeaveRequest lr
                LEFT JOIN [User] u ON lr.UserID = u.UserID
                LEFT JOIN LeaveStatus ls ON lr.StatusID = ls.StatusID
                LEFT JOIN [User] approver ON lr.ApprovedBy = approver.UserID
                WHERE lr.UserID = @userId
                ORDER BY lr.CreatedAt DESC
            `;
            
            const result = await this.executeQuery(query, { userId: userId });
            return result.recordset.map(row => LeaveRequest.fromDatabase(row));
        } catch (error) {
            console.error('Error fetching leave requests by user:', error);
            throw error;
        }
    }

    async getByStatus(statusId) {
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
                WHERE lr.StatusID = @statusId
                ORDER BY lr.CreatedAt DESC
            `;
            
            const result = await this.executeQuery(query, { statusId: statusId });
            return result.recordset.map(row => LeaveRequest.fromDatabase(row));
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
}

module.exports = LeaveRequestDBContext;

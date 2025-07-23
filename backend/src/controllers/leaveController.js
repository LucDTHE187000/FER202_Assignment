const LeaveRequestDBContext = require('../dal/LeaveRequestDBContext');
const LeaveRequest = require('../model/LeaveRequest');

class LeaveController {
    constructor() {
        this.leaveRequestDB = new LeaveRequestDBContext();
    }

    // GET /api/leave
    async getAll(req, res) {
        try {
            const leaveRequests = await this.leaveRequestDB.list();
            
            res.json({
                success: true,
                data: leaveRequests.map(lr => lr.toJSON()),
                count: leaveRequests.length
            });
        } catch (error) {
            console.error('Error in getAll leave requests:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch leave requests',
                message: error.message
            });
        }
    }

    // POST /api/leave
    async create(req, res) {
        try {
            const { FromDate, ToDate, Reason } = req.body;
            const userId = req.user.UserID;

            // Tạo leave request mới
            const leaveRequest = new LeaveRequest({
                UserID: userId,
                FromDate: FromDate,
                ToDate: ToDate,
                Reason: Reason,
                StatusID: 3 // Pending
            });

            // Validate dữ liệu
            const validation = leaveRequest.validate();
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: validation.errors
                });
            }

            // Lưu vào database
            const savedLeaveRequest = await this.leaveRequestDB.insert(leaveRequest);

            res.status(201).json({
                success: true,
                data: savedLeaveRequest.toJSON(),
                message: 'Leave request created successfully'
            });
        } catch (error) {
            console.error('Error in create leave request:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create leave request',
                message: error.message
            });
        }
    }

    // PUT /api/leave/:id
    async update(req, res) {
        try {
            const requestId = parseInt(req.params.id);
            const { FromDate, ToDate, Reason } = req.body;
            const userId = req.user.UserID;

            if (isNaN(requestId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid request ID'
                });
            }

            // Lấy leave request cũ
            const existingRequest = await this.leaveRequestDB.get(requestId);
            if (!existingRequest) {
                return res.status(404).json({
                    success: false,
                    error: 'Leave request not found'
                });
            }

            // Kiểm tra quyền sửa (chỉ user tạo request mới được sửa)
            if (existingRequest.UserID !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'You can only update your own leave requests'
                });
            }

            // Cập nhật thông tin
            existingRequest.FromDate = FromDate || existingRequest.FromDate;
            existingRequest.ToDate = ToDate || existingRequest.ToDate;
            existingRequest.Reason = Reason || existingRequest.Reason;
            existingRequest.UpdatedAt = new Date();

            // Validate
            const validation = existingRequest.validate();
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: validation.errors
                });
            }

            // Lưu cập nhật
            const updatedRequest = await this.leaveRequestDB.update(existingRequest);

            res.json({
                success: true,
                data: updatedRequest.toJSON(),
                message: 'Leave request updated successfully'
            });
        } catch (error) {
            console.error('Error in update leave request:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update leave request',
                message: error.message
            });
        }
    }

    // DELETE /api/leave/:id
    async remove(req, res) {
        try {
            const requestId = parseInt(req.params.id);
            const userId = req.user.UserID;

            if (isNaN(requestId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid request ID'
                });
            }

            // Lấy leave request
            const existingRequest = await this.leaveRequestDB.get(requestId);
            if (!existingRequest) {
                return res.status(404).json({
                    success: false,
                    error: 'Leave request not found'
                });
            }

            // Kiểm tra quyền xóa
            if (existingRequest.UserID !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'You can only delete your own leave requests'
                });
            }

            // Xóa request
            await this.leaveRequestDB.delete(existingRequest);

            res.json({
                success: true,
                message: 'Leave request deleted successfully'
            });
        } catch (error) {
            console.error('Error in remove leave request:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete leave request',
                message: error.message
            });
        }
    }

    // POST /api/leave/:id/approve
    async approve(req, res) {
        try {
            const requestId = parseInt(req.params.id);
            const approverId = req.user.UserID;

            if (isNaN(requestId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid request ID'
                });
            }

            // Approve request
            const approvedRequest = await this.leaveRequestDB.approveRequest(requestId, approverId);

            res.json({
                success: true,
                data: approvedRequest.toJSON(),
                message: 'Leave request approved successfully'
            });
        } catch (error) {
            console.error('Error in approve leave request:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to approve leave request',
                message: error.message
            });
        }
    }

    // GET /api/leave/timeline
    async getTimeline(req, res) {
        try {
            // Chỉ director mới có thể xem timeline
            const userRoles = req.user.roles || [];
            const isDirector = userRoles.some(role => role.RoleID === 1 || role.RoleName === 'Director');

            if (!isDirector) {
                return res.status(403).json({
                    success: false,
                    error: 'Only directors can access timeline'
                });
            }

            const { fromDate, toDate } = req.query;
            let leaveRequests;

            if (fromDate && toDate) {
                leaveRequests = await this.leaveRequestDB.getByDateRange(fromDate, toDate);
            } else {
                leaveRequests = await this.leaveRequestDB.list();
            }

            res.json({
                success: true,
                data: leaveRequests.map(lr => lr.toJSON()),
                count: leaveRequests.length
            });
        } catch (error) {
            console.error('Error in getTimeline:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch timeline',
                message: error.message
            });
        }
    }
}

// Export instance của controller
const leaveController = new LeaveController();

module.exports = {
    getAll: (req, res) => leaveController.getAll(req, res),
    create: (req, res) => leaveController.create(req, res),
    update: (req, res) => leaveController.update(req, res),
    remove: (req, res) => leaveController.remove(req, res),
    approve: (req, res) => leaveController.approve(req, res),
    getTimeline: (req, res) => leaveController.getTimeline(req, res)
};

const LeaveRequestDBContext = require('../dal/LeaveRequestDBContext');
const LeaveRequest = require('../model/LeaveRequest');

class LeaveRequestController {
    constructor() {
        this.leaveRequestDB = new LeaveRequestDBContext();
    }

    // GET /api/leave-requests
    async getAllLeaveRequests(req, res) {
        try {
            const leaveRequests = await this.leaveRequestDB.list();
            const leaveRequestJsons = leaveRequests.map(lr => lr.toJSON());
            
            res.json({
                success: true,
                data: leaveRequestJsons,
                count: leaveRequestJsons.length
            });
        } catch (error) {
            console.error('Error in getAllLeaveRequests:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch leave requests',
                message: error.message
            });
        }
    }

    // GET /api/leave-requests/:id
    async getLeaveRequestById(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid leave request ID'
                });
            }

            const leaveRequest = await this.leaveRequestDB.get(parseInt(id));
            
            if (!leaveRequest) {
                return res.status(404).json({
                    success: false,
                    error: 'Leave request not found'
                });
            }

            res.json({
                success: true,
                data: leaveRequest.toJSON()
            });
        } catch (error) {
            console.error('Error in getLeaveRequestById:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch leave request',
                message: error.message
            });
        }
    }

    // POST /api/leave-requests
    async createLeaveRequest(req, res) {
        try {
            const { UserID, FromDate, ToDate, Reason, StatusID } = req.body;
            
            if (!UserID || !FromDate || !ToDate) {
                return res.status(400).json({
                    success: false,
                    error: 'UserID, FromDate, and ToDate are required'
                });
            }

            const newLeaveRequest = new LeaveRequest({
                UserID: parseInt(UserID),
                FromDate: new Date(FromDate),
                ToDate: new Date(ToDate),
                Reason: Reason || '',
                StatusID: StatusID || 3, // Default to Pending status (ID = 3)
                ApprovedBy: null, // Will be set when approved
                CreatedAt: new Date(),
                UpdatedAt: new Date()
            });

            // Validate the leave request
            const validation = newLeaveRequest.validate();
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: validation.errors
                });
            }

            // Kiểm tra date overlap với các đơn nghỉ phép khác của user
            console.log('Checking date overlap for user:', parseInt(UserID), 'from:', FromDate, 'to:', ToDate);
            const overlappingRequests = await this.leaveRequestDB.checkDateOverlap(
                parseInt(UserID), 
                new Date(FromDate), 
                new Date(ToDate)
            );
            
            console.log('Overlapping requests found:', overlappingRequests);

            if (overlappingRequests && overlappingRequests.length > 0) {
                const overlappingDates = overlappingRequests.map(req => 
                    `${req.FromDate.toISOString().split('T')[0]} đến ${req.ToDate.toISOString().split('T')[0]}`
                ).join(', ');

                console.log('Overlap detected, rejecting request');
                return res.status(400).json({
                    success: false,
                    error: 'Khoảng thời gian nghỉ phép bị trùng lặp',
                    details: `Bạn đã có đơn nghỉ phép trong khoảng thời gian: ${overlappingDates}. Vui lòng chọn khoảng thời gian khác.`
                });
            }

            const createdLeaveRequest = await this.leaveRequestDB.insert(newLeaveRequest);

            res.status(201).json({
                success: true,
                data: createdLeaveRequest.toJSON(),
                message: 'Leave request created successfully'
            });
        } catch (error) {
            console.error('Error in createLeaveRequest:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create leave request',
                message: error.message
            });
        }
    }

    // PUT /api/leave-requests/:id
    async updateLeaveRequest(req, res) {
        try {
            const { id } = req.params;
            const { FromDate, ToDate, Reason, StatusID } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid leave request ID'
                });
            }

            // Check if leave request exists
            const existingLeaveRequest = await this.leaveRequestDB.get(parseInt(id));
            if (!existingLeaveRequest) {
                return res.status(404).json({
                    success: false,
                    error: 'Leave request not found'
                });
            }

            // Update leave request data
            if (FromDate !== undefined) existingLeaveRequest.FromDate = new Date(FromDate);
            if (ToDate !== undefined) existingLeaveRequest.ToDate = new Date(ToDate);
            if (Reason !== undefined) existingLeaveRequest.Reason = Reason;
            if (StatusID !== undefined) existingLeaveRequest.StatusID = parseInt(StatusID);

            // Kiểm tra date overlap nếu thay đổi ngày nghỉ
            if (FromDate !== undefined && ToDate !== undefined) {
                const overlappingRequests = await this.leaveRequestDB.checkDateOverlap(
                    existingLeaveRequest.UserID,
                    existingLeaveRequest.FromDate,
                    existingLeaveRequest.ToDate,
                    parseInt(id) // Loại trừ request hiện tại
                );

                if (overlappingRequests && overlappingRequests.length > 0) {
                    const overlappingDates = overlappingRequests.map(req => 
                        `${req.FromDate.toISOString().split('T')[0]} đến ${req.ToDate.toISOString().split('T')[0]}`
                    ).join(', ');

                    return res.status(400).json({
                        success: false,
                        error: 'Khoảng thời gian nghỉ phép bị trùng lặp',
                        details: `Bạn đã có đơn nghỉ phép trong khoảng thời gian: ${overlappingDates}. Vui lòng chọn khoảng thời gian khác.`
                    });
                }
            }

            const updatedLeaveRequest = await this.leaveRequestDB.update(existingLeaveRequest);

            res.json({
                success: true,
                data: updatedLeaveRequest.toJSON(),
                message: 'Leave request updated successfully'
            });
        } catch (error) {
            console.error('Error in updateLeaveRequest:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update leave request',
                message: error.message
            });
        }
    }

    // DELETE /api/leave-requests/:id
    async deleteLeaveRequest(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid leave request ID'
                });
            }

            const existingLeaveRequest = await this.leaveRequestDB.get(parseInt(id));
            if (!existingLeaveRequest) {
                return res.status(404).json({
                    success: false,
                    error: 'Leave request not found'
                });
            }

            await this.leaveRequestDB.delete(existingLeaveRequest);

            res.json({
                success: true,
                message: 'Leave request deleted successfully'
            });
        } catch (error) {
            console.error('Error in deleteLeaveRequest:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete leave request',
                message: error.message
            });
        }
    }

    // GET /api/leave-requests/user/:userId
    async getLeaveRequestsByUser(req, res) {
        try {
            const { userId } = req.params;

            if (!userId || isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid user ID'
                });
            }

            const leaveRequests = await this.leaveRequestDB.getByUserId(parseInt(userId));
            const leaveRequestJsons = leaveRequests.map(lr => lr.toJSON());

            res.json({
                success: true,
                data: leaveRequestJsons,
                count: leaveRequestJsons.length
            });
        } catch (error) {
            console.error('Error in getLeaveRequestsByUser:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch leave requests by user',
                message: error.message
            });
        }
    }

    // GET /api/leave-requests/status/:statusId
    async getLeaveRequestsByStatus(req, res) {
        try {
            const { statusId } = req.params;

            if (!statusId || isNaN(statusId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid status ID'
                });
            }

            const leaveRequests = await this.leaveRequestDB.getByStatus(parseInt(statusId));
            const leaveRequestJsons = leaveRequests.map(lr => lr.toJSON());

            res.json({
                success: true,
                data: leaveRequestJsons,
                count: leaveRequestJsons.length
            });
        } catch (error) {
            console.error('Error in getLeaveRequestsByStatus:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch leave requests by status',
                message: error.message
            });
        }
    }

    // PUT /api/leave-requests/:id/approve
    async approveLeaveRequest(req, res) {
        try {
            const { id } = req.params;
            const { approvedBy } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid leave request ID'
                });
            }

            if (!approvedBy || isNaN(approvedBy)) {
                return res.status(400).json({
                    success: false,
                    error: 'ApprovedBy user ID is required'
                });
            }

            const approvedLeaveRequest = await this.leaveRequestDB.approveRequest(parseInt(id), parseInt(approvedBy));

            res.json({
                success: true,
                data: approvedLeaveRequest.toJSON(),
                message: 'Leave request approved successfully'
            });
        } catch (error) {
            console.error('Error in approveLeaveRequest:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to approve leave request',
                message: error.message
            });
        }
    }

    // PUT /api/leave-requests/:id/reject
    async rejectLeaveRequest(req, res) {
        try {
            const { id } = req.params;
            const { rejectedBy } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid leave request ID'
                });
            }

            if (!rejectedBy || isNaN(rejectedBy)) {
                return res.status(400).json({
                    success: false,
                    error: 'RejectedBy user ID is required'
                });
            }

            const rejectedLeaveRequest = await this.leaveRequestDB.rejectRequest(parseInt(id), parseInt(rejectedBy));

            res.json({
                success: true,
                data: rejectedLeaveRequest.toJSON(),
                message: 'Leave request rejected successfully'
            });
        } catch (error) {
            console.error('Error in rejectLeaveRequest:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to reject leave request',
                message: error.message
            });
        }
    }

    // GET /api/leave-requests/date-range
    async getLeaveRequestsByDateRange(req, res) {
        try {
            const { fromDate, toDate } = req.query;

            if (!fromDate || !toDate) {
                return res.status(400).json({
                    success: false,
                    error: 'fromDate and toDate query parameters are required'
                });
            }

            const leaveRequests = await this.leaveRequestDB.getByDateRange(new Date(fromDate), new Date(toDate));
            const leaveRequestJsons = leaveRequests.map(lr => lr.toJSON());

            res.json({
                success: true,
                data: leaveRequestJsons,
                count: leaveRequestJsons.length
            });
        } catch (error) {
            console.error('Error in getLeaveRequestsByDateRange:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch leave requests by date range',
                message: error.message
            });
        }
    }

    // Alias methods để tương thích với leaveRoutes.js
    async getAll(req, res) {
        return this.getAllLeaveRequests(req, res);
    }

    // Method để lấy leave requests của user hiện tại đang đăng nhập
    async getMyLeaveRequests(req, res) {
        try {
            // Kiểm tra xem user có được authenticate không
            if (!req.user || !req.user.UserID) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized - User not authenticated'
                });
            }

            const userId = req.user.UserID;
            const leaveRequests = await this.leaveRequestDB.getByUserId(userId);
            const leaveRequestJsons = leaveRequests.map(lr => lr.toJSON());
            
            res.json({
                success: true,
                data: leaveRequestJsons,
                count: leaveRequestJsons.length
            });
        } catch (error) {
            console.error('Error in getMyLeaveRequests:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch user leave requests',
                message: error.message
            });
        }
    }

    // Method mới để get leave requests của một user cụ thể
    async getLeaveRequestsByUserId(userId, req, res) {
        try {
            const leaveRequests = await this.leaveRequestDB.getByUserId(userId);
            const leaveRequestJsons = leaveRequests.map(lr => lr.toJSON());
            
            res.json({
                success: true,
                data: leaveRequestJsons,
                count: leaveRequestJsons.length
            });
        } catch (error) {
            console.error('Error in getLeaveRequestsByUserId:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch user leave requests',
                message: error.message
            });
        }
    }

    async create(req, res) {
        return this.createLeaveRequest(req, res);
    }

    async update(req, res) {
        return this.updateLeaveRequest(req, res);
    }

    async remove(req, res) {
        return this.deleteLeaveRequest(req, res);
    }

    async approve(req, res) {
        // Lấy approvedBy từ req.user (middleware đã gán user vào request)
        const approvedBy = req.user ? req.user.UserID : null;
        
        if (!approvedBy) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        // Gán approvedBy vào body để sử dụng method hiện có
        req.body.approvedBy = approvedBy;
        return this.approveLeaveRequest(req, res);
    }

    async getTimeline(req, res) {
        try {
            // Kiểm tra quyền director
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
                leaveRequests = await this.leaveRequestDB.getByDateRange(new Date(fromDate), new Date(toDate));
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

module.exports = LeaveRequestController;

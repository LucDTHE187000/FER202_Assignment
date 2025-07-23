const UserDBContext = require('../dal/UserDBContext');
const LeaveRequestDBContext = require('../dal/LeaveRequestDBContext');
const DepartmentDBContext = require('../dal/DepartmentDBContext');

class DashboardController {
    constructor() {
        this.userDB = new UserDBContext();
        this.leaveRequestDB = new LeaveRequestDBContext();
        this.departmentDB = new DepartmentDBContext();
    }

    // GET /api/dashboard/stats
    async getStats(req, res) {
        try {
            // Lấy các thống kê cơ bản
            const [users, leaveRequests, departments] = await Promise.all([
                this.userDB.list(),
                this.leaveRequestDB.list(),
                this.departmentDB.list()
            ]);

            // Tính toán các chỉ số thống kê
            const totalUsers = users.length;
            const totalLeaveRequests = leaveRequests.length;
            const totalDepartments = departments.length;

            // Đếm số đơn theo trạng thái
            const pendingRequests = leaveRequests.filter(req => req.StatusID === 3).length; // Pending
            const approvedRequests = leaveRequests.filter(req => req.StatusID === 1).length; // Approved
            const rejectedRequests = leaveRequests.filter(req => req.StatusID === 2).length; // Rejected

            // Thống kê theo tháng hiện tại
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();

            const thisMonthRequests = leaveRequests.filter(req => {
                const reqDate = new Date(req.CreatedAt);
                return reqDate.getMonth() === currentMonth && reqDate.getFullYear() === currentYear;
            }).length;

            const stats = {
                totalUsers,
                totalLeaveRequests,
                totalDepartments,
                pendingRequests,
                approvedRequests,
                rejectedRequests,
                thisMonthRequests,
                activeUsers: users.filter(user => user.IsActive).length,
                inactiveUsers: users.filter(user => !user.IsActive).length
            };

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('Error in getStats:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi lấy thống kê',
                message: error.message
            });
        }
    }

    // GET /api/dashboard/activities
    async getRecentActivities(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;

            // Lấy các hoạt động gần đây (leave requests mới nhất)
            const recentLeaveRequests = await this.leaveRequestDB.list();
            
            // Sắp xếp theo thời gian tạo mới nhất
            const sortedRequests = recentLeaveRequests
                .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))
                .slice(0, limit);

            // Tạo danh sách activities
            const activities = await Promise.all(
                sortedRequests.map(async (request) => {
                    try {
                        const user = await this.userDB.get(request.UserID);
                        return {
                            id: request.RequestID,
                            type: 'leave_request',
                            title: `${user?.FullName || 'Unknown User'} đã tạo đơn nghỉ phép`,
                            description: `Từ ${new Date(request.FromDate).toLocaleDateString()} đến ${new Date(request.ToDate).toLocaleDateString()}`,
                            createdAt: request.CreatedAt,
                            status: this.getStatusName(request.StatusID),
                            user: {
                                id: user?.UserID,
                                name: user?.FullName,
                                username: user?.Username
                            }
                        };
                    } catch (error) {
                        console.error('Error processing activity:', error);
                        return {
                            id: request.RequestID,
                            type: 'leave_request',
                            title: 'Đơn nghỉ phép mới',
                            description: `Từ ${new Date(request.FromDate).toLocaleDateString()} đến ${new Date(request.ToDate).toLocaleDateString()}`,
                            createdAt: request.CreatedAt,
                            status: this.getStatusName(request.StatusID),
                            user: null
                        };
                    }
                })
            );

            res.json({
                success: true,
                data: activities.filter(activity => activity !== null)
            });

        } catch (error) {
            console.error('Error in getRecentActivities:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi lấy hoạt động gần đây',
                message: error.message
            });
        }
    }

    // GET /api/dashboard/user-stats/:userId
    async getUserStats(req, res) {
        try {
            const { userId } = req.params;

            if (!userId || isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid user ID'
                });
            }

            const user = await this.userDB.get(parseInt(userId));
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User không tìm thấy'
                });
            }

            // Lấy các đơn nghỉ phép của user
            const userLeaveRequests = await this.leaveRequestDB.getByUserId(parseInt(userId));

            // Tính toán thống kê cá nhân
            const totalRequests = userLeaveRequests.length;
            const pendingRequests = userLeaveRequests.filter(req => req.StatusID === 3).length;
            const approvedRequests = userLeaveRequests.filter(req => req.StatusID === 1).length;
            const rejectedRequests = userLeaveRequests.filter(req => req.StatusID === 2).length;

            // Tính tổng số ngày nghỉ đã được duyệt
            const approvedDays = userLeaveRequests
                .filter(req => req.StatusID === 1)
                .reduce((total, req) => {
                    const fromDate = new Date(req.FromDate);
                    const toDate = new Date(req.ToDate);
                    const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
                    return total + days;
                }, 0);

            const userStats = {
                user: user.toJSON(),
                totalRequests,
                pendingRequests,
                approvedRequests,
                rejectedRequests,
                approvedDays,
                remainingDays: 20 - approvedDays // Giả sử mỗi năm có 20 ngày nghỉ phép
            };

            res.json({
                success: true,
                data: userStats
            });

        } catch (error) {
            console.error('Error in getUserStats:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi lấy thống kê user',
                message: error.message
            });
        }
    }

    // Helper method để lấy tên trạng thái
    getStatusName(statusId) {
        const statusMap = {
            1: 'Đã duyệt',
            2: 'Từ chối',
            3: 'Chờ duyệt'
        };
        return statusMap[statusId] || 'Không xác định';
    }

    // GET /api/dashboard/monthly-stats
    async getMonthlyStats(req, res) {
        try {
            const year = parseInt(req.query.year) || new Date().getFullYear();

            // Lấy tất cả leave requests trong năm
            const leaveRequests = await this.leaveRequestDB.list();
            const yearRequests = leaveRequests.filter(req => {
                const reqDate = new Date(req.CreatedAt);
                return reqDate.getFullYear() === year;
            });

            // Tính toán thống kê theo tháng
            const monthlyStats = Array.from({ length: 12 }, (_, month) => {
                const monthRequests = yearRequests.filter(req => {
                    const reqDate = new Date(req.CreatedAt);
                    return reqDate.getMonth() === month;
                });

                return {
                    month: month + 1,
                    monthName: new Date(year, month).toLocaleString('vi-VN', { month: 'long' }),
                    totalRequests: monthRequests.length,
                    pendingRequests: monthRequests.filter(req => req.StatusID === 3).length,
                    approvedRequests: monthRequests.filter(req => req.StatusID === 1).length,
                    rejectedRequests: monthRequests.filter(req => req.StatusID === 2).length
                };
            });

            res.json({
                success: true,
                data: {
                    year,
                    monthlyStats
                }
            });

        } catch (error) {
            console.error('Error in getMonthlyStats:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi lấy thống kê theo tháng',
                message: error.message
            });
        }
    }
}

module.exports = DashboardController;

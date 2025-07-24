const LeaveRequestDBContext = require('../dal/LeaveRequestDBContext');
const UserDBContext = require('../dal/UserDBContext');
const DepartmentDBContext = require('../dal/DepartmentDBContext');

class LeaveReportController {
    constructor() {
        this.leaveRequestDB = new LeaveRequestDBContext();
        this.userDB = new UserDBContext();
        this.departmentDB = new DepartmentDBContext();
    }

    // GET /api/leave-reports/stats
    async getLeaveStats(req, res) {
        try {
            console.log('Getting leave statistics...');
            
            const statsData = await this.leaveRequestDB.getLeaveStats();

            console.log(`Leave stats retrieved successfully`);
            res.json({
                success: true,
                data: statsData,
                message: 'Thống kê được tải thành công'
            });
        } catch (error) {
            console.error('Error in getLeaveStats:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể tải thống kê nghỉ phép',
                error: error.message
            });
        }
    }

    // GET /api/leave-reports/detailed
    async getDetailedReport(req, res) {
        try {
            console.log('Getting detailed leave report...');
            
            const filters = {
                departmentId: req.query.departmentId,
                fromDate: req.query.fromDate,
                toDate: req.query.toDate,
                status: req.query.status
            };

            const detailedData = await this.leaveRequestDB.getDetailedReport(filters);

            console.log(`Found ${detailedData.length} detailed leave records`);
            res.json({
                success: true,
                data: detailedData,
                message: 'Báo cáo chi tiết được tải thành công'
            });
        } catch (error) {
            console.error('Error in getDetailedReport:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể tải báo cáo chi tiết',
                error: error.message
            });
        }
    }

    // GET /api/leave-reports/employee-summary
    async getEmployeeSummary(req, res) {
        try {
            console.log('Getting employee leave summary...');
            
            const year = req.query.year;
            const employeeSummary = await this.leaveRequestDB.getEmployeeSummary(year);

            console.log(`Found ${employeeSummary.length} employee summaries for year ${year || new Date().getFullYear()}`);
            res.json({
                success: true,
                data: employeeSummary,
                message: 'Tổng hợp nhân viên được tải thành công'
            });
        } catch (error) {
            console.error('Error in getEmployeeSummary:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể tải tổng hợp nhân viên',
                error: error.message
            });
        }
    }
}

module.exports = LeaveReportController;

const express = require('express');
const UserController = require('../controllers/UserController');
const LeaveRequestController = require('../controllers/LeaveRequestController');
const AuthController = require('../controllers/AuthController');
const DashboardController = require('../controllers/DashboardController');
const DepartmentController = require('../controllers/DepartmentController');
const UserRoleController = require('../controllers/UserRoleController');

const router = express.Router();

// Initialize controllers
const userController = new UserController();
const leaveRequestController = new LeaveRequestController();
const authController = new AuthController();
const dashboardController = new DashboardController();
const departmentController = new DepartmentController();
const userRoleController = new UserRoleController();

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        // Test database connection by trying to get a simple query
        const DBContext = require('../dal/DBContext');
        const dbContext = new DBContext();
        await dbContext.executeQuery('SELECT 1 as test');
        
        res.json({
            success: true,
            message: 'Database connection is healthy',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Database connection failed',
            message: error.message
        });
    }
});

// User routes
router.get('/users', (req, res) => userController.getAllUsers(req, res));
router.get('/users/:id', (req, res) => userController.getUserById(req, res));
router.post('/users', (req, res) => userController.createUser(req, res));
router.put('/users/:id', (req, res) => userController.updateUser(req, res));
router.delete('/users/:id', (req, res) => userController.deleteUser(req, res));
router.get('/users/username/:username', (req, res) => userController.getUserByUsername(req, res));
router.get('/users/department/:departmentId', (req, res) => userController.getUsersByDepartment(req, res));
router.get('/users/:id/roles', (req, res) => userController.getUserRoles(req, res));

// Leave Request routes
router.get('/leave-requests', (req, res) => leaveRequestController.getAllLeaveRequests(req, res));
router.get('/leave-requests/:id', (req, res) => leaveRequestController.getLeaveRequestById(req, res));
router.post('/leave-requests', (req, res) => leaveRequestController.createLeaveRequest(req, res));
router.put('/leave-requests/:id', (req, res) => leaveRequestController.updateLeaveRequest(req, res));
router.delete('/leave-requests/:id', (req, res) => leaveRequestController.deleteLeaveRequest(req, res));
router.get('/leave-requests/user/:userId', (req, res) => leaveRequestController.getLeaveRequestsByUser(req, res));
router.get('/leave-requests/status/:statusId', (req, res) => leaveRequestController.getLeaveRequestsByStatus(req, res));
router.put('/leave-requests/:id/approve', (req, res) => leaveRequestController.approveLeaveRequest(req, res));
router.put('/leave-requests/:id/reject', (req, res) => leaveRequestController.rejectLeaveRequest(req, res));
router.get('/leave-requests/date-range', (req, res) => leaveRequestController.getLeaveRequestsByDateRange(req, res));

// Auth routes
router.post('/auth/login', (req, res) => authController.login(req, res));
router.post('/auth/register', (req, res) => authController.register(req, res));
router.post('/auth/logout', (req, res) => authController.logout(req, res));
router.post('/auth/refresh', (req, res) => authController.refreshToken(req, res));
router.get('/auth/me', (req, res, next) => authController.authenticateToken(req, res, next), (req, res) => authController.getCurrentUser(req, res));

// Department routes
router.get('/departments', (req, res) => departmentController.getAllDepartments(req, res));
router.get('/departments/:id', (req, res) => departmentController.getDepartmentById(req, res));
router.post('/departments', (req, res) => departmentController.createDepartment(req, res));
router.put('/departments/:id', (req, res) => departmentController.updateDepartment(req, res));
router.delete('/departments/:id', (req, res) => departmentController.deleteDepartment(req, res));

// User Role Management routes
router.get('/user-roles', (req, res) => userRoleController.getAllUsersWithRoles(req, res));
router.get('/user-roles/roles', (req, res) => userRoleController.getAllRoles(req, res));
router.post('/user-roles/assign', (req, res) => userRoleController.assignRole(req, res));
router.delete('/user-roles/remove', (req, res) => userRoleController.removeRole(req, res));

// Dashboard routes
router.get('/dashboard/stats', (req, res) => dashboardController.getStats(req, res));
router.get('/dashboard/activities', (req, res) => dashboardController.getRecentActivities(req, res));
router.get('/dashboard/user-stats/:userId', (req, res) => dashboardController.getUserStats(req, res));
router.get('/dashboard/monthly-stats', (req, res) => dashboardController.getMonthlyStats(req, res));

module.exports = router;

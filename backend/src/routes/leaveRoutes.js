const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const LeaveRequestController = require('../controllers/LeaveRequestController');

// Initialize controller
const leaveRequestController = new LeaveRequestController();

// Test endpoint without auth
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Leave routes working!',
        timestamp: new Date().toISOString()
    });
});

router.get('/', authenticateToken, (req, res) => leaveRequestController.getAll(req, res));
router.post('/', authenticateToken, (req, res) => leaveRequestController.create(req, res));
router.get('/timeline', authenticateToken, (req, res) => leaveRequestController.getTimeline(req, res)); // Chỉ director
router.get('/user/:userId', authenticateToken, (req, res) => leaveRequestController.getLeaveRequestsByUser(req, res));
router.get('/department/:departmentId', authenticateToken, (req, res) => leaveRequestController.getLeaveRequestsByDepartment(req, res));
router.get('/:id', authenticateToken, (req, res) => leaveRequestController.getLeaveRequestById(req, res));
router.put('/:id', authenticateToken, (req, res) => leaveRequestController.update(req, res));
router.delete('/:id', authenticateToken, (req, res) => leaveRequestController.remove(req, res));
router.post('/:id/approve', authenticateToken, (req, res) => leaveRequestController.approveLeaveRequest(req, res));
router.post('/:id/reject', authenticateToken, (req, res) => leaveRequestController.rejectLeaveRequest(req, res));

module.exports = router;

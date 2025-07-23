const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const LeaveRequestController = require('../controllers/LeaveRequestController');

// Initialize controller
const leaveRequestController = new LeaveRequestController();

router.get('/', authenticateToken, (req, res) => leaveRequestController.getMyLeaveRequests(req, res));
router.post('/', authenticateToken, (req, res) => leaveRequestController.create(req, res));
router.get('/timeline', authenticateToken, (req, res) => leaveRequestController.getTimeline(req, res)); // Chỉ director
router.get('/:userId', authenticateToken, (req, res) => leaveRequestController.getLeaveRequestsByUser(req, res));
router.put('/:id', authenticateToken, (req, res) => leaveRequestController.update(req, res));
router.delete('/:id', authenticateToken, (req, res) => leaveRequestController.remove(req, res));
router.post('/:id/approve', authenticateToken, (req, res) => leaveRequestController.approve(req, res));
module.exports = router;

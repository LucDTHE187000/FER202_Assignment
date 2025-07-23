const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const leaveController = require('../controllers/leaveController');

router.get('/', authenticateToken, leaveController.getAll);
router.post('/', authenticateToken, leaveController.create);
router.put('/:id', authenticateToken, leaveController.update);
router.delete('/:id', authenticateToken, leaveController.remove);
router.post('/:id/approve', authenticateToken, leaveController.approve);
router.get('/timeline', authenticateToken, leaveController.getTimeline); // Chỉ director

module.exports = router;

const { poolPromise } = require('../dal/DBContext');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Lấy tất cả đơn của user hiện tại (hoặc tất cả nếu là director)
exports.getAll = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { UserID, roles } = req.user;
    let query = '';
    if (roles.includes('director')) {
      query = `SELECT lr.*, u.FullName, ls.StatusName, ls.Description as StatusDescription
               FROM LeaveRequest lr
               JOIN [User] u ON lr.UserID = u.UserID
               JOIN LeaveStatus ls ON lr.StatusID = ls.StatusID`;
    } else if (roles.includes('department leader')) {
      // Lấy các đơn của phòng ban mình quản lý
      query = `SELECT lr.*, u.FullName, ls.StatusName, ls.Description as StatusDescription
               FROM LeaveRequest lr
               JOIN [User] u ON lr.UserID = u.UserID
               JOIN LeaveStatus ls ON lr.StatusID = ls.StatusID
               WHERE u.DepartmentID = (SELECT DepartmentID FROM [User] WHERE UserID = ${UserID})`;
    } else {
      // Nhân viên chỉ xem đơn của mình
      query = `SELECT lr.*, u.FullName, ls.StatusName, ls.Description as StatusDescription
               FROM LeaveRequest lr
               JOIN [User] u ON lr.UserID = u.UserID
               JOIN LeaveStatus ls ON lr.StatusID = ls.StatusID
               WHERE lr.UserID = ${UserID}`;
    }
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Tạo đơn nghỉ mới
exports.create = async (req, res) => {
  try {
    const { UserID } = req.user;
    const { FromDate, ToDate, Reason } = req.body;
    if (!FromDate || !ToDate || !Reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const pool = await poolPromise;
    const now = new Date();
    const result = await pool.request()
      .input('UserID', UserID)
      .input('FromDate', FromDate)
      .input('ToDate', ToDate)
      .input('Reason', Reason)
      .input('StatusID', 3) // 3: Pending
      .input('ApprovedBy', null)
      .input('CreatedAt', now)
      .input('UpdatedAt', now)
      .query(`INSERT INTO LeaveRequest (UserID, FromDate, ToDate, Reason, StatusID, ApprovedBy, CreatedAt, UpdatedAt)
              VALUES (@UserID, @FromDate, @ToDate, @Reason, @StatusID, @ApprovedBy, @CreatedAt, @UpdatedAt);
              SELECT SCOPE_IDENTITY() AS RequestID;`);
    res.status(201).json({ message: 'Leave request created', RequestID: result.recordset[0].RequestID });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Sửa đơn (chỉ khi chưa duyệt và là chủ đơn)
exports.update = async (req, res) => {
  try {
    const { UserID } = req.user;
    const { id } = req.params;
    const { FromDate, ToDate, Reason } = req.body;
    const pool = await poolPromise;
    // Kiểm tra quyền
    const check = await pool.request().query(`SELECT * FROM LeaveRequest WHERE RequestID = ${id} AND UserID = ${UserID} AND StatusID = 3`);
    if (check.recordset.length === 0) {
      return res.status(403).json({ message: 'Not allowed to update this request' });
    }
    await pool.request()
      .input('RequestID', id)
      .input('FromDate', FromDate)
      .input('ToDate', ToDate)
      .input('Reason', Reason)
      .input('UpdatedAt', new Date())
      .query(`UPDATE LeaveRequest SET FromDate=@FromDate, ToDate=@ToDate, Reason=@Reason, UpdatedAt=@UpdatedAt WHERE RequestID=@RequestID`);
    res.json({ message: 'Leave request updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Xóa đơn (chỉ khi chưa duyệt và là chủ đơn)
exports.remove = async (req, res) => {
  try {
    const { UserID } = req.user;
    const { id } = req.params;
    const pool = await poolPromise;
    // Kiểm tra quyền
    const check = await pool.request().query(`SELECT * FROM LeaveRequest WHERE RequestID = ${id} AND UserID = ${UserID} AND StatusID = 3`);
    if (check.recordset.length === 0) {
      return res.status(403).json({ message: 'Not allowed to delete this request' });
    }
    await pool.request().input('RequestID', id).query('DELETE FROM LeaveRequest WHERE RequestID=@RequestID');
    res.json({ message: 'Leave request deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Duyệt đơn (chỉ quản lý/phòng ban hoặc director)
exports.approve = async (req, res) => {
  try {
    const { UserID, roles } = req.user;
    const { id } = req.params;
    const { status, comment } = req.body; // status: 1=Approved, 2=Rejected
    if (![1,2].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const pool = await poolPromise;
    // Kiểm tra quyền duyệt
    let checkQuery = '';
    if (roles.includes('director')) {
      checkQuery = `SELECT * FROM LeaveRequest WHERE RequestID = ${id}`;
    } else if (roles.includes('department leader')) {
      checkQuery = `SELECT lr.* FROM LeaveRequest lr JOIN [User] u ON lr.UserID = u.UserID WHERE lr.RequestID = ${id} AND u.DepartmentID = (SELECT DepartmentID FROM [User] WHERE UserID = ${UserID})`;
    } else {
      return res.status(403).json({ message: 'Not allowed to approve this request' });
    }
    const check = await pool.request().query(checkQuery);
    if (check.recordset.length === 0) {
      return res.status(403).json({ message: 'Not allowed to approve this request' });
    }
    // Cập nhật trạng thái
    await pool.request()
      .input('RequestID', id)
      .input('StatusID', status)
      .input('ApprovedBy', UserID)
      .input('UpdatedAt', new Date())
      .input('Comment', comment || '')
      .query('UPDATE LeaveRequest SET StatusID=@StatusID, ApprovedBy=@ApprovedBy, UpdatedAt=@UpdatedAt, Reason=ISNULL(Reason, N"")+N"\n[Manager comment]: "+@Comment WHERE RequestID=@RequestID');
    res.json({ message: 'Leave request updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// API lấy timeline nghỉ của tất cả nhân viên (chỉ director)
exports.getTimeline = async (req, res) => {
  try {
    const { roles } = req.user;
    if (!roles.includes('director')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const pool = await poolPromise;
    // Lấy tất cả nhân viên và các đơn nghỉ
    const users = await pool.request().query('SELECT UserID, Username, FullName FROM [User]');
    const leaves = await pool.request().query('SELECT UserID, FromDate, ToDate, Reason, StatusID FROM LeaveRequest');
    // Map status
    const statusMap = { 1: 'Approved', 2: 'Rejected', 3: 'Pending' };
    // Tìm min/max date để vẽ timeline
    let minDate = null, maxDate = null;
    leaves.recordset.forEach(l => {
      const from = new Date(l.FromDate), to = new Date(l.ToDate);
      if (!minDate || from < minDate) minDate = from;
      if (!maxDate || to > maxDate) maxDate = to;
    });
    if (!minDate || !maxDate) {
      return res.json(users.recordset.map(u => ({ ...u, Leaves: [] })));
    }
    const totalDays = (maxDate - minDate) / (1000*60*60*24) + 1;
    // Gắn leave vào từng user
    const userMap = {};
    users.recordset.forEach(u => userMap[u.UserID] = { ...u, Leaves: [] });
    leaves.recordset.forEach(l => {
      if (!userMap[l.UserID]) return;
      const from = new Date(l.FromDate), to = new Date(l.ToDate);
      const left = ((from - minDate) / (1000*60*60*24)) / totalDays * 100;
      const width = ((to - from) / (1000*60*60*24) + 1) / totalDays * 100;
      userMap[l.UserID].Leaves.push({
        FromDate: from.toLocaleDateString('en-GB'),
        ToDate: to.toLocaleDateString('en-GB'),
        Reason: l.Reason,
        Status: statusMap[l.StatusID] || 'Unknown',
        left,
        width
      });
    });
    res.json(Object.values(userMap));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

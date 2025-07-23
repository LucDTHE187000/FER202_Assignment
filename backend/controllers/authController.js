const { poolPromise } = require('../dal/DBContext');
const jwt = require('jsonwebtoken');

// Auth controller (sample)
exports.register = async (req, res) => {
  const { Username, Password, FullName, DepartmentID } = req.body;
  if (!Username || !Password || !DepartmentID) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const pool = await poolPromise;
    // Check if username exists
    const userCheck = await pool.request()
      .input('Username', Username)
      .query('SELECT * FROM [User] WHERE Username = @Username');
    if (userCheck.recordset.length > 0) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    // Không hash password nữa
    const now = new Date();
    const result = await pool.request()
      .input('Username', Username)
      .input('PasswordHash', Password) // Lưu plain text
      .input('FullName', FullName || null)
      .input('DepartmentID', DepartmentID)
      .input('CreatedAt', now)
      .input('UpdatedAt', now)
      .input('IsActive', true)
      .query(`INSERT INTO [User] (Username, PasswordHash, FullName, DepartmentID, CreatedAt, UpdatedAt, IsActive)
              VALUES (@Username, @PasswordHash, @FullName, @DepartmentID, @CreatedAt, @UpdatedAt, @IsActive);
              SELECT SCOPE_IDENTITY() AS UserID;`);
    const UserID = result.recordset[0].UserID;
    // Gán role mặc định (nhân viên)
    await pool.request()
      .input('UserID', UserID)
      .input('RoleID', 2)
      .query('INSERT INTO UserRole (UserID, RoleID) VALUES (@UserID, @RoleID)');
    res.status(201).json({ message: 'Register successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { Username, Password } = req.body;
  if (!Username || !Password) {
    return res.status(400).json({ message: 'Missing username or password' });
  }
  try {
    const pool = await poolPromise;
    const userRes = await pool.request()
      .input('Username', Username)
      .query('SELECT * FROM [User] WHERE Username = @Username AND IsActive = 1');
    if (userRes.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = userRes.recordset[0];
    // So sánh plain text
    if (Password !== user.PasswordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Lấy role
    const roleRes = await pool.request()
      .input('UserID', user.UserID)
      .query('SELECT r.RoleID, r.RoleName FROM UserRole ur JOIN Role r ON ur.RoleID = r.RoleID WHERE ur.UserID = @UserID');
    const roles = roleRes.recordset.map(r => r.RoleName);
    // Tạo token
    const token = jwt.sign({ UserID: user.UserID, Username: user.Username, roles }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });
    res.json({ token, user: { UserID: user.UserID, Username: user.Username, FullName: user.FullName, DepartmentID: user.DepartmentID, roles } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

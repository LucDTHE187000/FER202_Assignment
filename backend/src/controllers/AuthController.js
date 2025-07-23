const UserDBContext = require('../dal/UserDBContext');
const User = require('../model/User');//test update
const bcrypt = require('bcrypt'); // Sẽ cần cài đặt: npm install bcrypt
const jwt = require('jsonwebtoken'); // Sẽ cần cài đặt: npm install jsonwebtoken
const sql = require('mssql');

class AuthController {
    constructor() {
        this.userDB = new UserDBContext();
        this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
    }

    // POST /api/auth/login
    async login(req, res) {
        try {
            const { username, password, Username, Password } = req.body;

            // Support both lowercase and uppercase field names
            const loginUsername = username || Username;
            const loginPassword = password || Password;

            // Validate input
            if (!loginUsername || !loginPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Username và password là bắt buộc'
                });
            }

            // Tìm user theo username
            const user = await this.userDB.findByUsername(loginUsername);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Tên đăng nhập hoặc mật khẩu không chính xác'
                });
            }

            // Kiểm tra user có active không
            if (!user.IsActive) {
                return res.status(401).json({
                    success: false,
                    error: 'Tài khoản đã bị vô hiệu hóa'
                });
            }

            // Kiểm tra password (tạm thời dùng plaintext, sau này sẽ dùng bcrypt)
            const isValidPassword = await this.validatePassword(loginPassword, user.PasswordHash);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: 'Tên đăng nhập hoặc mật khẩu không chính xác'
                });
            }

            // Tạo JWT token
            const token = jwt.sign(
                { 
                    userId: user.UserID, 
                    username: user.Username,
                    departmentId: user.DepartmentID
                },
                this.JWT_SECRET,
                { expiresIn: this.JWT_EXPIRES_IN }
            );

            // Trả về thông tin user và token (không bao gồm password)
            const userResponse = user.toJSON();
            delete userResponse.PasswordHash;

            res.json({
                success: true,
                message: 'Đăng nhập thành công',
                data: {
                    token,
                    user: userResponse
                }
            });

        } catch (error) {
            console.error('Error in login:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi đăng nhập',
                message: error.message
            });
        }
    }

    // POST /api/auth/register
    async register(req, res) {
        try {
            const { username, password, confirmPassword, fullName, departmentId,
                    Username, Password, ConfirmPassword, FullName, DepartmentID } = req.body;

            // Support both lowercase and uppercase field names
            const regUsername = username || Username;
            const regPassword = password || Password;
            const regConfirmPassword = confirmPassword || ConfirmPassword;
            const regFullName = fullName || FullName;
            const regDepartmentId = departmentId || DepartmentID;

            // Validate input
            if (!regUsername || !regPassword || !regConfirmPassword || !regFullName || !regDepartmentId) {
                return res.status(400).json({
                    success: false,
                    error: 'Tất cả các trường đều bắt buộc'
                });
            }

            // Kiểm tra mật khẩu xác nhận
            if (regPassword !== regConfirmPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Mật khẩu xác nhận không khớp'
                });
            }

            // Kiểm tra username đã tồn tại
            const existingUser = await this.userDB.findByUsername(regUsername);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: 'Tên đăng nhập đã tồn tại'
                });
            }

            // Hash password
            const hashedPassword = await this.hashPassword(password);

            // Tạo user mới
            const userData = {
                Username: username,
                PasswordHash: hashedPassword,
                FullName: fullName,
                DepartmentID: parseInt(departmentId),
                IsActive: true
            };

            const user = new User(userData);
            const validation = user.validate();
            
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Dữ liệu không hợp lệ',
                    details: validation.errors
                });
            }

            // Lưu user vào database
            const savedUser = await this.userDB.insert(user);
            
            // Gán role mặc định "employee" (RoleID = 4) cho user mới
            // Tạm thời comment để test
            /*
            try {
                await this.assignDefaultRole(savedUser.UserID, 4); // 4 = employee role
            } catch (roleError) {
                console.error('Warning: Could not assign default role to new user:', roleError);
                // Không throw error vì user đã được tạo thành công
            }
            */
            
            // Trả về thông tin user (không bao gồm password)
            const userResponse = savedUser.toJSON();
            delete userResponse.PasswordHash;

            res.status(201).json({
                success: true,
                message: 'Đăng ký tài khoản thành công',
                data: {
                    user: userResponse
                }
            });

        } catch (error) {
            console.error('Error in register:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi đăng ký tài khoản',
                message: error.message
            });
        }
    }

    // POST /api/auth/logout
    async logout(req, res) {
        try {
            // Trong implementation đơn giản, chỉ cần client xóa token
            // Trong production có thể implement blacklist token
            res.json({
                success: true,
                message: 'Đăng xuất thành công'
            });
        } catch (error) {
            console.error('Error in logout:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi đăng xuất',
                message: error.message
            });
        }
    }

    // POST /api/auth/refresh
    async refreshToken(req, res) {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).json({
                    success: false,
                    error: 'Token không được cung cấp'
                });
            }

            // Verify token (cho phép expired token để refresh)
            const decoded = jwt.verify(token, this.JWT_SECRET, { ignoreExpiration: true });
            
            // Kiểm tra user vẫn tồn tại và active
            const user = await this.userDB.get(decoded.userId);
            if (!user || !user.IsActive) {
                return res.status(401).json({
                    success: false,
                    error: 'Token không hợp lệ'
                });
            }

            // Tạo token mới
            const newToken = jwt.sign(
                { 
                    userId: user.UserID, 
                    username: user.Username,
                    departmentId: user.DepartmentID
                },
                this.JWT_SECRET,
                { expiresIn: this.JWT_EXPIRES_IN }
            );

            res.json({
                success: true,
                message: 'Token được làm mới thành công',
                data: {
                    token: newToken
                }
            });

        } catch (error) {
            console.error('Error in refresh token:', error);
            res.status(401).json({
                success: false,
                error: 'Token không hợp lệ',
                message: error.message
            });
        }
    }

    // GET /api/auth/me
    async getCurrentUser(req, res) {
        try {
            const user = req.user; // Sẽ được set bởi auth middleware

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Không tìm thấy thông tin user'
                });
            }

            const userResponse = user.toJSON();
            delete userResponse.PasswordHash;

            res.json({
                success: true,
                data: userResponse
            });

        } catch (error) {
            console.error('Error in getCurrentUser:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi lấy thông tin user',
                message: error.message
            });
        }
    }

    // Helper method để validate password
    async validatePassword(plainPassword, hashedPassword) {
        try {
            // Tạm thời so sánh plaintext (dành cho demo)
            // Trong production nên dùng bcrypt
            if (hashedPassword.startsWith('$2b$')) {
                // Nếu password đã được hash bằng bcrypt
                return await bcrypt.compare(plainPassword, hashedPassword);
            } else {
                // Tạm thời so sánh plaintext
                return plainPassword === hashedPassword;
            }
        } catch (error) {
            console.error('Error validating password:', error);
            return false;
        }
    }

    // Helper method để hash password (cho việc tạo user mới)
    async hashPassword(plainPassword) {
        try {
            const saltRounds = 10;
            return await bcrypt.hash(plainPassword, saltRounds);
        } catch (error) {
            console.error('Error hashing password:', error);
            throw new Error('Không thể mã hóa mật khẩu');
        }
    }

    // Middleware để verify JWT token
    authenticateToken(req, res, next) {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access token không được cung cấp'
            });
        }

        jwt.verify(token, this.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    error: 'Token không hợp lệ hoặc đã hết hạn'
                });
            }

            try {
                // Lấy thông tin user từ database
                const user = await this.userDB.get(decoded.userId);
                if (!user || !user.IsActive) {
                    return res.status(401).json({
                        success: false,
                        error: 'User không tồn tại hoặc đã bị vô hiệu hóa'
                    });
                }

                req.user = user;
                req.tokenData = decoded;
                next();
            } catch (error) {
                console.error('Error in authenticateToken:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Lỗi server khi xác thực token'
                });
            }
        });
    }

    // Helper method để gán role mặc định cho user mới
    async assignDefaultRole(userId, roleId) {
        try {
            const pool = this.userDB.getPool();
            const request = pool.request();
            
            const query = `
                INSERT INTO UserRole (UserID, RoleID)
                VALUES (${userId}, ${roleId})
            `;
            
            await request.query(query);
            console.log(`Successfully assigned role ${roleId} to user ${userId}`);
        } catch (error) {
            console.error('Error assigning default role:', error);
            throw error;
        }
    }
}

module.exports = AuthController;

const UserRoleDBContext = require('../dal/UserRoleDBContext');
const UserRole = require('../model/UserRole');

class UserRoleController {
    constructor() {
        this.userRoleDB = new UserRoleDBContext();
    }

    // GET /api/user-roles
    async getAllUserRoles(req, res) {
        try {
            const userRoles = await this.userRoleDB.list();
            
            res.json({
                success: true,
                data: userRoles.map(ur => ur.toJSON())
            });
        } catch (error) {
            console.error('Error fetching user roles:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi lấy danh sách user roles'
            });
        }
    }

    // GET /api/user-roles/:id
    async getUserRoleById(req, res) {
        try {
            const userRoleId = parseInt(req.params.id);
            
            if (isNaN(userRoleId)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID user role không hợp lệ'
                });
            }

            const userRole = await this.userRoleDB.get(userRoleId);
            
            if (!userRole) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy user role'
                });
            }

            res.json({
                success: true,
                data: userRole.toJSON()
            });
        } catch (error) {
            console.error('Error fetching user role:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi lấy user role'
            });
        }
    }

    // POST /api/user-roles
    async createUserRole(req, res) {
        try {
            const { UserID, RoleID } = req.body;
            
            if (!UserID || !RoleID) {
                return res.status(400).json({
                    success: false,
                    error: 'UserID và RoleID là bắt buộc'
                });
            }

            const userRole = new UserRole({
                UserID: UserID,
                RoleID: RoleID
            });

            const validation = userRole.validate();
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Dữ liệu không hợp lệ',
                    details: validation.errors
                });
            }

            const newUserRole = await this.userRoleDB.insert(userRole);
            
            res.status(201).json({
                success: true,
                data: newUserRole.toJSON(),
                message: 'User role được tạo thành công'
            });
        } catch (error) {
            console.error('Error creating user role:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi tạo user role'
            });
        }
    }

    // DELETE /api/user-roles/:id
    async deleteUserRole(req, res) {
        try {
            const userRoleId = parseInt(req.params.id);
            
            if (isNaN(userRoleId)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID user role không hợp lệ'
                });
            }

            const userRole = await this.userRoleDB.get(userRoleId);
            
            if (!userRole) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy user role'
                });
            }

            await this.userRoleDB.delete(userRole);
            
            res.json({
                success: true,
                message: 'User role đã được xóa thành công'
            });
        } catch (error) {
            console.error('Error deleting user role:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi xóa user role'
            });
        }
    }
}

module.exports = UserRoleController;
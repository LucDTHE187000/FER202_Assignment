const UserDBContext = require('../dal/UserDBContext');
const User = require('../model/User');

class UserRoleController {
    constructor() {
        this.userDB = new UserDBContext();
    }

    // GET /api/user-roles
    async getAllUsersWithRoles(req, res) {
        try {
            console.log('Getting all users with roles...');
            
            // Lấy tất cả user (đã include roles và department name)
            const users = await this.userDB.list();
            
            console.log(`Found ${users.length} users with roles and departments`);
            res.json({
                success: true,
                data: users,
                message: 'Users retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getAllUsersWithRoles:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể tải danh sách người dùng',
                error: error.message
            });
        }
    }

    // POST /api/user-roles/assign
    async assignRole(req, res) {
        try {
            const { userId, roleId } = req.body;
            
            if (!userId || !roleId) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin userId hoặc roleId'
                });
            }

            // Kiểm tra user có tồn tại không
            const user = await this.userDB.get(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng'
                });
            }

            // Kiểm tra user đã có role này chưa
            const userRoles = await this.userDB.getUserRoles(userId);
            const hasRole = userRoles.some(role => role.RoleID === roleId);
            
            if (hasRole) {
                return res.status(400).json({
                    success: false,
                    message: 'Người dùng đã có vai trò này'
                });
            }

            // Thêm role cho user
            await this.userDB.addUserRole(userId, roleId);
            
            console.log(`Role ${roleId} assigned to user ${userId}`);
            res.json({
                success: true,
                message: 'Gán vai trò thành công'
            });
        } catch (error) {
            console.error('Error in assignRole:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể gán vai trò',
                error: error.message
            });
        }
    }

    // DELETE /api/user-roles/remove
    async removeRole(req, res) {
        try {
            const { userId, roleId } = req.body;
            
            if (!userId || !roleId) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin userId hoặc roleId'
                });
            }

            // Kiểm tra user có tồn tại không
            const user = await this.userDB.get(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng'
                });
            }

            // Kiểm tra user có role này không
            const userRoles = await this.userDB.getUserRoles(userId);
            const hasRole = userRoles.some(role => role.RoleID === roleId);
            
            if (!hasRole) {
                return res.status(400).json({
                    success: false,
                    message: 'Người dùng không có vai trò này'
                });
            }

            // Xóa role của user
            await this.userDB.removeUserRole(userId, roleId);
            
            console.log(`Role ${roleId} removed from user ${userId}`);
            res.json({
                success: true,
                message: 'Xóa vai trò thành công'
            });
        } catch (error) {
            console.error('Error in removeRole:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể xóa vai trò',
                error: error.message
            });
        }
    }

    // GET /api/user-roles/roles
    async getAllRoles(req, res) {
        try {
            console.log('Getting all available roles...');
            
            // Query để lấy tất cả roles
            const query = 'SELECT RoleID, RoleName, Description FROM Role ORDER BY RoleName';
            const result = await this.userDB.executeQuery(query);
            
            const roles = result.recordset.map(row => ({
                RoleID: row.RoleID,
                RoleName: row.RoleName,
                Description: row.Description
            }));
            
            console.log(`Found ${roles.length} available roles`);
            res.json({
                success: true,
                data: roles,
                message: 'Roles retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getAllRoles:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể tải danh sách vai trò',
                error: error.message
            });
        }
    }
}

module.exports = UserRoleController;

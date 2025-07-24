const DBContext = require('./DBContext');
const User = require('../model/User');
const Role = require('../model/Role');
const sql = require('mssql');

class UserDBContext extends DBContext {
    constructor() {
        super();
    }

    async list() {
        try {
            const query = `
                SELECT u.*, d.DepartmentName 
                FROM [User] u
                LEFT JOIN Department d ON u.DepartmentID = d.DepartmentID
                WHERE u.IsActive = 1
                ORDER BY u.UserID
            `;
            
            const result = await this.executeQuery(query);
            
            // Lấy roles cho từng user
            const users = await Promise.all(result.recordset.map(async (row) => {
                const user = User.fromDatabase(row);
                const roles = await this.getUserRoles(user.UserID);
                user.roles = roles;
                return user;
            }));
            
            return users;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    async get(id) {
        try {
            const query = `
                SELECT u.*, d.DepartmentName 
                FROM [User] u
                LEFT JOIN Department d ON u.DepartmentID = d.DepartmentID
                WHERE u.UserID = @id AND u.IsActive = 1
            `;
            
            const result = await this.executeQuery(query, { id: id });
            
            if (result.recordset.length === 0) {
                return null;
            }
            
            const user = User.fromDatabase(result.recordset[0]);
            
            // Lấy roles của user
            const roles = await this.getUserRoles(user.UserID);
            user.roles = roles;
            
            return user;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    async insert(userModel) {
        try {
            const validation = userModel.validate();
            if (!validation.isValid) {
                throw new Error('Validation failed: ' + validation.errors.join(', '));
            }

            const query = `
                INSERT INTO [User] (Username, PasswordHash, FullName, DepartmentID, CreatedAt, UpdatedAt, IsActive)
                OUTPUT INSERTED.*
                VALUES (@Username, @PasswordHash, @FullName, @DepartmentID, @CreatedAt, @UpdatedAt, @IsActive)
            `;

            const data = userModel.toDatabase();
            data.CreatedAt = new Date();
            data.UpdatedAt = new Date();
            
            const result = await this.executeQuery(query, data);
            return User.fromDatabase(result.recordset[0]);
        } catch (error) {
            console.error('Error inserting user:', error);
            throw error;
        }
    }

    async update(userModel) {
        try {
            const validation = userModel.validate();
            if (!validation.isValid) {
                throw new Error('Validation failed: ' + validation.errors.join(', '));
            }

            const query = `
                UPDATE [User] 
                SET Username = @Username, 
                    PasswordHash = @PasswordHash, 
                    FullName = @FullName, 
                    DepartmentID = @DepartmentID, 
                    UpdatedAt = @UpdatedAt,
                    IsActive = @IsActive
                OUTPUT INSERTED.*
                WHERE UserID = @UserID
            `;

            const data = userModel.toDatabase();
            data.UpdatedAt = new Date();
            
            const result = await this.executeQuery(query, data);
            
            if (result.recordset.length === 0) {
                throw new Error('User not found');
            }
            
            return User.fromDatabase(result.recordset[0]);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async delete(userModel) {
        try {
            // Soft delete by setting IsActive to false
            const query = `
                UPDATE [User] 
                SET IsActive = 0, UpdatedAt = @UpdatedAt
                WHERE UserID = @UserID
            `;

            const params = {
                UserID: userModel.UserID,
                UpdatedAt: new Date()
            };
            
            const result = await this.executeQuery(query, params);
            
            if (result.rowsAffected[0] === 0) {
                throw new Error('User not found');
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Additional methods specific to User
    async findByUsername(username) {
        try {
            const query = `
                SELECT u.*, d.DepartmentName 
                FROM [User] u
                LEFT JOIN Department d ON u.DepartmentID = d.DepartmentID
                WHERE u.Username = @username AND u.IsActive = 1
            `;
            
            const result = await this.executeQuery(query, { username: username });
            
            if (result.recordset.length === 0) {
                return null;
            }
            
            const user = User.fromDatabase(result.recordset[0]);
            
            // Lấy roles của user
            const roles = await this.getUserRoles(user.UserID);
            user.roles = roles;
            
            return user;
        } catch (error) {
            console.error('Error finding user by username:', error);
            throw error;
        }
    }

    async getUsersByDepartment(departmentId) {
        try {
            const query = `
                SELECT u.*, d.DepartmentName 
                FROM [User] u
                LEFT JOIN Department d ON u.DepartmentID = d.DepartmentID
                WHERE u.DepartmentID = @departmentId AND u.IsActive = 1
                ORDER BY u.FullName
            `;
            
            const result = await this.executeQuery(query, { departmentId: departmentId });
            
            // Lấy roles cho từng user
            const users = await Promise.all(result.recordset.map(async (row) => {
                const user = User.fromDatabase(row);
                const roles = await this.getUserRoles(user.UserID);
                user.roles = roles;
                return user;
            }));
            
            return users;
        } catch (error) {
            console.error('Error fetching users by department:', error);
            throw error;
        }
    }

    async getUserRoles(userId) {
        try {
            const query = `
                SELECT r.* 
                FROM Role r
                INNER JOIN UserRole ur ON r.RoleID = ur.RoleID
                WHERE ur.UserID = @userId
            `;
            
            const result = await this.executeQuery(query, { userId: userId });
            // Trả về mảng roles đơn giản, không cần UserRole model
            return result.recordset.map(row => ({
                RoleID: row.RoleID,
                RoleName: row.RoleName,
                Description: row.Description
            }));
        } catch (error) {
            console.error('Error fetching user roles:', error);
            throw error;
        }
    }

    // Method để thêm role cho user
    async addUserRole(userId, roleId) {
        try {
            const query = `
                INSERT INTO UserRole (UserID, RoleID)
                VALUES (@userId, @roleId)
            `;
            
            await this.executeQuery(query, {
                userId: userId,
                roleId: roleId
            });
            
            return true;
        } catch (error) {
            console.error('Error adding user role:', error);
            throw error;
        }
    }

    // Method để xóa role của user
    async removeUserRole(userId, roleId) {
        try {
            const query = `
                DELETE FROM UserRole 
                WHERE UserID = @userId AND RoleID = @roleId
            `;
            
            await this.executeQuery(query, {
                userId: userId,
                roleId: roleId
            });
            
            return true;
        } catch (error) {
            console.error('Error removing user role:', error);
            throw error;
        }
    }

    // Method để gán role mặc định cho user mới
    async assignDefaultRole(userId, roleId) {
        try {
            const query = `
                INSERT INTO UserRole (UserID, RoleID)
                VALUES (@userId, @roleId)
            `;
            
            await this.executeQuery(query, {
                userId: userId,
                roleId: roleId
            });
            
            console.log(`Successfully assigned role ${roleId} to user ${userId}`);
            return true;
        } catch (error) {
            console.error('Error assigning default role:', error);
            throw error;
        }
    }
}

module.exports = UserDBContext;

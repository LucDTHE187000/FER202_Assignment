const DBContext = require('./DBContext');
const UserRole = require('../model/UserRole');
const sql = require('mssql');

class UserRoleDBContext extends DBContext {
    constructor() {
        super();
    }

    async list() {
        try {
            const query = `
                SELECT ur.*, 
                       u.FullName as UserName, u.Username,
                       r.RoleName
                FROM UserRole ur
                LEFT JOIN [User] u ON ur.UserID = u.UserID
                LEFT JOIN Role r ON ur.RoleID = r.RoleID
                ORDER BY ur.AssignedAt DESC
            `;
            
            const result = await this.executeQuery(query);
            return result.recordset.map(row => UserRole.fromDatabase(row));
        } catch (error) {
            console.error('Error fetching user roles:', error);
            throw error;
        }
    }

    async get(id) {
        try {
            const query = `
                SELECT ur.*, 
                       u.FullName as UserName, u.Username,
                       r.RoleName
                FROM UserRole ur
                LEFT JOIN [User] u ON ur.UserID = u.UserID
                LEFT JOIN Role r ON ur.RoleID = r.RoleID
                WHERE ur.UserRoleID = @id
            `;
            
            const result = await this.executeQuery(query, { id: id });
            
            if (result.recordset.length === 0) {
                return null;
            }
            
            return UserRole.fromDatabase(result.recordset[0]);
        } catch (error) {
            console.error('Error fetching user role:', error);
            throw error;
        }
    }

    async insert(userRoleModel) {
        try {
            const query = `
                INSERT INTO UserRole (UserID, RoleID, AssignedAt)
                OUTPUT INSERTED.*
                VALUES (@UserID, @RoleID, @AssignedAt)
            `;
            
            const result = await this.executeQuery(query, {
                UserID: userRoleModel.UserID,
                RoleID: userRoleModel.RoleID,
                AssignedAt: userRoleModel.AssignedAt
            });
            
            return UserRole.fromDatabase(result.recordset[0]);
        } catch (error) {
            console.error('Error inserting user role:', error);
            throw error;
        }
    }

    async update(userRoleModel) {
        try {
            const query = `
                UPDATE UserRole 
                SET UserID = @UserID, RoleID = @RoleID, AssignedAt = @AssignedAt
                OUTPUT INSERTED.*
                WHERE UserRoleID = @UserRoleID
            `;
            
            const result = await this.executeQuery(query, userRoleModel.toDatabase());
            
            if (result.recordset.length === 0) {
                return null;
            }
            
            return UserRole.fromDatabase(result.recordset[0]);
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    }

    async delete(userRoleModel) {
        try {
            const query = `DELETE FROM UserRole WHERE UserRoleID = @UserRoleID`;
            
            const result = await this.executeQuery(query, { 
                UserRoleID: userRoleModel.UserRoleID 
            });
            
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error deleting user role:', error);
            throw error;
        }
    }

    // Additional methods specific to UserRole
    async getUserRolesByUserId(userId) {
        try {
            const query = `
                SELECT ur.*, 
                       u.FullName as UserName, u.Username,
                       r.RoleName
                FROM UserRole ur
                LEFT JOIN [User] u ON ur.UserID = u.UserID
                LEFT JOIN Role r ON ur.RoleID = r.RoleID
                WHERE ur.UserID = @userId
                ORDER BY ur.AssignedAt DESC
            `;
            
            const result = await this.executeQuery(query, { userId: userId });
            return result.recordset.map(row => UserRole.fromDatabase(row));
        } catch (error) {
            console.error('Error fetching user roles by userId:', error);
            throw error;
        }
    }

    async getUserRolesByRoleId(roleId) {
        try {
            const query = `
                SELECT ur.*, 
                       u.FullName as UserName, u.Username,
                       r.RoleName
                FROM UserRole ur
                LEFT JOIN [User] u ON ur.UserID = u.UserID
                LEFT JOIN Role r ON ur.RoleID = r.RoleID
                WHERE ur.RoleID = @roleId
                ORDER BY ur.AssignedAt DESC
            `;
            
            const result = await this.executeQuery(query, { roleId: roleId });
            return result.recordset.map(row => UserRole.fromDatabase(row));
        } catch (error) {
            console.error('Error fetching user roles by roleId:', error);
            throw error;
        }
    }
}

module.exports = UserRoleDBContext;
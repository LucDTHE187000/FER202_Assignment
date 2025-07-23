const DBContext = require('./DBContext');
const Department = require('../model/Department');
const sql = require('mssql');

class DepartmentDBContext extends DBContext {
    constructor() {
        super();
    }

    async list() {
        try {
            const query = `
                SELECT d.*, 
                       manager.FullName as ManagerName, manager.Username as ManagerUsername
                FROM Department d
                LEFT JOIN [User] manager ON d.ManagerID = manager.UserID
                ORDER BY d.DepartmentName
            `;
            
            const result = await this.executeQuery(query);
            return result.recordset.map(row => Department.fromDatabase(row));
        } catch (error) {
            console.error('Error fetching departments:', error);
            throw error;
        }
    }

    async get(id) {
        try {
            const query = `
                SELECT d.*, 
                       manager.FullName as ManagerName, manager.Username as ManagerUsername
                FROM Department d
                LEFT JOIN [User] manager ON d.ManagerID = manager.UserID
                WHERE d.DepartmentID = @id
            `;
            
            const result = await this.executeQuery(query, { id: id });
            
            if (result.recordset.length === 0) {
                return null;
            }
            
            return Department.fromDatabase(result.recordset[0]);
        } catch (error) {
            console.error('Error fetching department:', error);
            throw error;
        }
    }

    async insert(departmentModel) {
        try {
            const validation = departmentModel.validate();
            if (!validation.isValid) {
                throw new Error('Validation failed: ' + validation.errors.join(', '));
            }

            const query = `
                INSERT INTO Department (DepartmentName, ManagerID)
                OUTPUT INSERTED.*
                VALUES (@DepartmentName, @ManagerID)
            `;

            const data = departmentModel.toDatabase();
            
            const result = await this.executeQuery(query, data);
            return Department.fromDatabase(result.recordset[0]);
        } catch (error) {
            console.error('Error inserting department:', error);
            throw error;
        }
    }

    async update(departmentModel) {
        try {
            const validation = departmentModel.validate();
            if (!validation.isValid) {
                throw new Error('Validation failed: ' + validation.errors.join(', '));
            }

            const query = `
                UPDATE Department 
                SET DepartmentName = @DepartmentName, 
                    ManagerID = @ManagerID
                OUTPUT INSERTED.*
                WHERE DepartmentID = @DepartmentID
            `;

            const data = departmentModel.toDatabase();
            
            const result = await this.executeQuery(query, data);
            
            if (result.recordset.length === 0) {
                throw new Error('Department not found');
            }
            
            return Department.fromDatabase(result.recordset[0]);
        } catch (error) {
            console.error('Error updating department:', error);
            throw error;
        }
    }

    async delete(departmentModel) {
        try {
            // Check if department has users before deleting
            const checkQuery = `SELECT COUNT(*) as UserCount FROM [User] WHERE DepartmentID = @DepartmentID`;
            const checkResult = await this.executeQuery(checkQuery, { DepartmentID: departmentModel.DepartmentID });
            
            if (checkResult.recordset[0].UserCount > 0) {
                throw new Error('Cannot delete department that has users assigned to it');
            }

            const query = `DELETE FROM Department WHERE DepartmentID = @DepartmentID`;
            
            const result = await this.executeQuery(query, { DepartmentID: departmentModel.DepartmentID });
            
            if (result.rowsAffected[0] === 0) {
                throw new Error('Department not found');
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting department:', error);
            throw error;
        }
    }

    // Additional methods specific to Department
    async findByName(name) {
        try {
            const query = `
                SELECT d.*, 
                       manager.FullName as ManagerName, manager.Username as ManagerUsername
                FROM Department d
                LEFT JOIN [User] manager ON d.ManagerID = manager.UserID
                WHERE d.DepartmentName = @name
            `;
            
            const result = await this.executeQuery(query, { name: name });
            
            if (result.recordset.length === 0) {
                return null;
            }
            
            return Department.fromDatabase(result.recordset[0]);
        } catch (error) {
            console.error('Error finding department by name:', error);
            throw error;
        }
    }

    async getDepartmentUsers(departmentId) {
        try {
            const query = `
                SELECT u.* 
                FROM [User] u
                WHERE u.DepartmentID = @departmentId AND u.IsActive = 1
                ORDER BY u.FullName
            `;
            
            const result = await this.executeQuery(query, { departmentId: departmentId });
            return result.recordset;
        } catch (error) {
            console.error('Error fetching department users:', error);
            throw error;
        }
    }

    async getDepartmentStats(departmentId) {
        try {
            const query = `
                SELECT 
                    COUNT(u.UserID) as TotalUsers,
                    COUNT(CASE WHEN u.IsActive = 1 THEN 1 END) as ActiveUsers,
                    COUNT(CASE WHEN u.IsActive = 0 THEN 1 END) as InactiveUsers
                FROM [User] u
                WHERE u.DepartmentID = @departmentId
            `;
            
            const result = await this.executeQuery(query, { departmentId: departmentId });
            return result.recordset[0];
        } catch (error) {
            console.error('Error fetching department stats:', error);
            throw error;
        }
    }
}

module.exports = DepartmentDBContext;

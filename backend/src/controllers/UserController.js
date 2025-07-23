const UserDBContext = require('../dal/UserDBContext');
const User = require('../model/User');

class UserController {
    constructor() {
        this.userDB = new UserDBContext();
    }

    // GET /api/users
    async getAllUsers(req, res) {
        try {
            const users = await this.userDB.list();
            const userJsons = users.map(user => user.toJSON());
            
            res.json({
                success: true,
                data: userJsons,
                count: userJsons.length
            });
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch users',
                message: error.message
            });
        }
    }

    // GET /api/users/:id
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid user ID'
                });
            }

            const user = await this.userDB.get(parseInt(id));
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            res.json({
                success: true,
                data: user.toJSON()
            });
        } catch (error) {
            console.error('Error in getUserById:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch user',
                message: error.message
            });
        }
    }

    // POST /api/users
    async createUser(req, res) {
        try {
            const { Username, PasswordHash, FullName, DepartmentID } = req.body;
            
            if (!Username || !PasswordHash || !DepartmentID) {
                return res.status(400).json({
                    success: false,
                    error: 'Username, PasswordHash, and DepartmentID are required'
                });
            }

            // Check if username already exists
            const existingUser = await this.userDB.findByUsername(Username);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Username already exists'
                });
            }

            const newUser = new User({
                Username,
                PasswordHash,
                FullName,
                DepartmentID: parseInt(DepartmentID)
            });

            const createdUser = await this.userDB.insert(newUser);

            res.status(201).json({
                success: true,
                data: createdUser.toJSON(),
                message: 'User created successfully'
            });
        } catch (error) {
            console.error('Error in createUser:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create user',
                message: error.message
            });
        }
    }

    // PUT /api/users/:id
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { Username, PasswordHash, FullName, DepartmentID, IsActive } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid user ID'
                });
            }

            // Check if user exists
            const existingUser = await this.userDB.get(parseInt(id));
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Update user data
            if (Username !== undefined) existingUser.Username = Username;
            if (PasswordHash !== undefined) existingUser.PasswordHash = PasswordHash;
            if (FullName !== undefined) existingUser.FullName = FullName;
            if (DepartmentID !== undefined) existingUser.DepartmentID = parseInt(DepartmentID);
            if (IsActive !== undefined) existingUser.IsActive = Boolean(IsActive);

            const updatedUser = await this.userDB.update(existingUser);

            res.json({
                success: true,
                data: updatedUser.toJSON(),
                message: 'User updated successfully'
            });
        } catch (error) {
            console.error('Error in updateUser:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update user',
                message: error.message
            });
        }
    }

    // DELETE /api/users/:id
    async deleteUser(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid user ID'
                });
            }

            const existingUser = await this.userDB.get(parseInt(id));
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            await this.userDB.delete(existingUser);

            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Error in deleteUser:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete user',
                message: error.message
            });
        }
    }

    // GET /api/users/username/:username
    async getUserByUsername(req, res) {
        try {
            const { username } = req.params;

            if (!username) {
                return res.status(400).json({
                    success: false,
                    error: 'Username is required'
                });
            }

            const user = await this.userDB.findByUsername(username);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            res.json({
                success: true,
                data: user.toJSON()
            });
        } catch (error) {
            console.error('Error in getUserByUsername:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch user',
                message: error.message
            });
        }
    }

    // GET /api/users/department/:departmentId
    async getUsersByDepartment(req, res) {
        try {
            const { departmentId } = req.params;

            if (!departmentId || isNaN(departmentId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid department ID'
                });
            }

            const users = await this.userDB.getUsersByDepartment(parseInt(departmentId));
            const userJsons = users.map(user => user.toJSON());

            res.json({
                success: true,
                data: userJsons,
                count: userJsons.length
            });
        } catch (error) {
            console.error('Error in getUsersByDepartment:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch users by department',
                message: error.message
            });
        }
    }

    // GET /api/users/:id/roles
    async getUserRoles(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid user ID'
                });
            }

            const roles = await this.userDB.getUserRoles(parseInt(id));

            res.json({
                success: true,
                data: roles,
                count: roles.length
            });
        } catch (error) {
            console.error('Error in getUserRoles:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch user roles',
                message: error.message
            });
        }
    }
}

module.exports = UserController;

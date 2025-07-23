class User {
    constructor(data = {}) {
        this.UserID = data.UserID || null;
        this.Username = data.Username || '';
        this.PasswordHash = data.PasswordHash || '';
        this.FullName = data.FullName || '';
        this.DepartmentID = data.DepartmentID || null;
        this.CreatedAt = data.CreatedAt || new Date();
        this.UpdatedAt = data.UpdatedAt || new Date();
        this.IsActive = data.IsActive !== undefined ? data.IsActive : true;
        
        // Thêm trường roles là một mảng chứa các Role của user
        this.roles = data.roles || [];
    }

    // Validation methods
    validate() {
        const errors = [];
        
        if (!this.Username || this.Username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        }
        
        if (!this.PasswordHash) {
            errors.push('Password is required');
        }
        
        if (!this.DepartmentID) {
            errors.push('Department ID is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Convert to database format
    toDatabase() {
        return {
            UserID: this.UserID,
            Username: this.Username,
            PasswordHash: this.PasswordHash,
            FullName: this.FullName,
            DepartmentID: this.DepartmentID,
            CreatedAt: this.CreatedAt,
            UpdatedAt: this.UpdatedAt,
            IsActive: this.IsActive
            // Note: roles không được include vì nó không phải column của table User
        };
    }

    // Convert from database format
    static fromDatabase(data) {
        return new User(data);
    }

    // Convert to JSON for API response
    toJSON() {
        return {
            UserID: this.UserID,
            Username: this.Username,
            FullName: this.FullName,
            DepartmentID: this.DepartmentID,
            CreatedAt: this.CreatedAt,
            UpdatedAt: this.UpdatedAt,
            IsActive: this.IsActive,
            roles: this.roles
            // Note: PasswordHash is excluded from JSON response for security
        };
    }

    // Role management methods
    addRole(role) {
        if (role && !this.hasRole(role.RoleID || role)) {
            this.roles.push(role);
        }
    }

    removeRole(roleId) {
        this.roles = this.roles.filter(role => 
            (role.RoleID || role) !== roleId
        );
    }

    hasRole(roleId) {
        return this.roles.some(role => 
            (role.RoleID || role) === roleId
        );
    }

    getRoleNames() {
        return this.roles.map(role => 
            role.RoleName || role.toString()
        );
    }

    clearRoles() {
        this.roles = [];
    }
}

module.exports = User;

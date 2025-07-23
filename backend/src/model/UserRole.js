class UserRole {
    constructor(data = {}) {
        this.UserRoleID = data.UserRoleID || null;
        this.UserID = data.UserID || null;
        this.RoleID = data.RoleID || null;
        this.AssignedAt = data.AssignedAt || new Date();
    }

    // Validation methods
    validate() {
        const errors = [];
        
        if (!this.UserID) {
            errors.push('UserID is required');
        }
        
        if (!this.RoleID) {
            errors.push('RoleID is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Convert to database format
    toDatabase() {
        return {
            UserRoleID: this.UserRoleID,
            UserID: this.UserID,
            RoleID: this.RoleID,
            AssignedAt: this.AssignedAt
        };
    }

    // Convert from database format
    static fromDatabase(data) {
        return new UserRole(data);
    }

    // Convert to JSON for API response
    toJSON() {
        return {
            UserRoleID: this.UserRoleID,
            UserID: this.UserID,
            RoleID: this.RoleID,
            AssignedAt: this.AssignedAt
        };
    }
}

module.exports = UserRole;
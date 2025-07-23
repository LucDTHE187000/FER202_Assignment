class Role {
    constructor(data = {}) {
        this.RoleID = data.RoleID || null;
        this.RoleName = data.RoleName || '';
        this.Description = data.Description || '';
    }

    // Validation methods
    validate() {
        const errors = [];
        
        if (!this.RoleName || this.RoleName.length < 2) {
            errors.push('Role name must be at least 2 characters long');
        }
        
        if (!this.Description) {
            errors.push('Description is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Convert to database format
    toDatabase() {
        return {
            RoleID: this.RoleID,
            RoleName: this.RoleName,
            Description: this.Description
        };
    }

    // Convert from database format
    static fromDatabase(data) {
        return new Role(data);
    }

    // Convert to JSON for API response
    toJSON() {
        return {
            RoleID: this.RoleID,
            RoleName: this.RoleName,
            Description: this.Description
        };
    }

    // Static methods for common roles
    static getRoleTypes() {
        return {
            DIRECTOR: 1,
            DEPARTMENT_LEADER: 2
        };
    }
}

module.exports = Role;

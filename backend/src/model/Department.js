class Department {
    constructor(data = {}) {
        this.DepartmentID = data.DepartmentID || null;
        this.DepartmentName = data.DepartmentName || '';
        this.ManagerID = data.ManagerID || null;
    }

    // Validation methods
    validate() {
        const errors = [];
        
        if (!this.DepartmentName || this.DepartmentName.length < 2) {
            errors.push('Department name must be at least 2 characters long');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Convert to database format
    toDatabase() {
        return {
            DepartmentID: this.DepartmentID,
            DepartmentName: this.DepartmentName,
            ManagerID: this.ManagerID
        };
    }

    // Convert from database format
    static fromDatabase(data) {
        return new Department(data);
    }

    // Convert to JSON for API response
    toJSON() {
        return {
            DepartmentID: this.DepartmentID,
            DepartmentName: this.DepartmentName,
            ManagerID: this.ManagerID
        };
    }
}

module.exports = Department;

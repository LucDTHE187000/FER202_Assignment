class LeaveStatus {
    constructor(data = {}) {
        this.StatusID = data.StatusID || null;
        this.StatusName = data.StatusName || '';
        this.Description = data.Description || '';
    }

    // Validation methods
    validate() {
        const errors = [];
        
        if (!this.StatusName || this.StatusName.length < 2) {
            errors.push('Status name must be at least 2 characters long');
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
            StatusID: this.StatusID,
            StatusName: this.StatusName,
            Description: this.Description
        };
    }

    // Convert from database format
    static fromDatabase(data) {
        return new LeaveStatus(data);
    }

    // Convert to JSON for API response
    toJSON() {
        return {
            StatusID: this.StatusID,
            StatusName: this.StatusName,
            Description: this.Description
        };
    }

    // Static methods for common statuses
    static getStatusTypes() {
        return {
            APPROVED: 1,
            REJECTED: 2,
            PENDING: 3
        };
    }
}

module.exports = LeaveStatus;

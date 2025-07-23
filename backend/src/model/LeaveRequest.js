class LeaveRequest {
    constructor(data = {}) {
        this.RequestID = data.RequestID || null;
        this.UserID = data.UserID || null;
        this.FromDate = data.FromDate || null;
        this.ToDate = data.ToDate || null;
        this.Reason = data.Reason || '';
        this.StatusID = data.StatusID || 3; // Default to Pending
        this.ApprovedBy = data.ApprovedBy || null;
        this.CreatedAt = data.CreatedAt || new Date();
        this.UpdatedAt = data.UpdatedAt || new Date();
    }

    // Validation methods
    validate() {
        const errors = [];
        
        if (!this.UserID) {
            errors.push('User ID is required');
        }
        
        if (!this.FromDate) {
            errors.push('From Date is required');
        }
        
        if (!this.ToDate) {
            errors.push('To Date is required');
        }
        
        if (this.FromDate && this.ToDate) {
            const fromDate = new Date(this.FromDate);
            const toDate = new Date(this.ToDate);
            
            if (fromDate > toDate) {
                errors.push('From Date cannot be later than To Date');
            }
            
            if (fromDate < new Date().setHours(0, 0, 0, 0)) {
                errors.push('From Date cannot be in the past');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Calculate number of leave days
    getLeaveDays() {
        if (!this.FromDate || !this.ToDate) {
            return 0;
        }
        
        const fromDate = new Date(this.FromDate);
        const toDate = new Date(this.ToDate);
        const timeDifference = toDate.getTime() - fromDate.getTime();
        const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1; // +1 to include both start and end date
        
        return daysDifference;
    }

    // Convert to database format
    toDatabase() {
        return {
            RequestID: this.RequestID,
            UserID: this.UserID,
            FromDate: this.FromDate,
            ToDate: this.ToDate,
            Reason: this.Reason,
            StatusID: this.StatusID,
            ApprovedBy: this.ApprovedBy,
            CreatedAt: this.CreatedAt,
            UpdatedAt: this.UpdatedAt
        };
    }

    // Convert from database format
    static fromDatabase(data) {
        return new LeaveRequest(data);
    }

    // Convert to JSON for API response
    toJSON() {
        return {
            RequestID: this.RequestID,
            UserID: this.UserID,
            FromDate: this.FromDate,
            ToDate: this.ToDate,
            Reason: this.Reason,
            StatusID: this.StatusID,
            ApprovedBy: this.ApprovedBy,
            CreatedAt: this.CreatedAt,
            UpdatedAt: this.UpdatedAt,
            LeaveDays: this.getLeaveDays()
        };
    }
}

module.exports = LeaveRequest;

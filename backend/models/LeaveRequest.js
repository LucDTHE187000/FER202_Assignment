// LeaveRequest model
class LeaveRequest {
  constructor({ RequestID, UserID, FromDate, ToDate, Reason, StatusID, ApprovedBy, CreatedAt, UpdatedAt }) {
    this.RequestID = RequestID;
    this.UserID = UserID;
    this.FromDate = FromDate;
    this.ToDate = ToDate;
    this.Reason = Reason;
    this.StatusID = StatusID;
    this.ApprovedBy = ApprovedBy;
    this.CreatedAt = CreatedAt;
    this.UpdatedAt = UpdatedAt;
  }
}

module.exports = LeaveRequest;

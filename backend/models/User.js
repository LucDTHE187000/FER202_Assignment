// User model
class User {
  constructor({ UserID, Username, PasswordHash, FullName, DepartmentID, CreatedAt, UpdatedAt, IsActive }) {
    this.UserID = UserID;
    this.Username = Username;
    this.PasswordHash = PasswordHash;
    this.FullName = FullName;
    this.DepartmentID = DepartmentID;
    this.CreatedAt = CreatedAt;
    this.UpdatedAt = UpdatedAt;
    this.IsActive = IsActive;
  }
}

module.exports = User;

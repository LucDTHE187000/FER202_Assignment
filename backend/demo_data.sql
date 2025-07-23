-- Insert demo users cho testing
-- Password sẽ là plaintext tạm thời (trong production nên hash)

USE AssignmentDB;

-- Tạo demo departments trước
INSERT INTO Department (DepartmentName) VALUES 
('IT Department'),
('HR Department'),
('Finance Department'),
('Marketing Department');

-- Tạo demo users
INSERT INTO [User] (Username, PasswordHash, FullName, DepartmentID, IsActive) VALUES 
('admin', '123456', 'Administrator', 1, 1),
('user1', '123456', 'Nguyen Van A', 1, 1),
('user2', '123456', 'Tran Thi B', 2, 1),
('manager1', '123456', 'Le Van C', 1, 1),
('hr_manager', '123456', 'Pham Thi D', 2, 1);

-- Tạo demo leave statuses
INSERT INTO LeaveStatus (StatusName, Description) VALUES 
('Approved', 'Request has been approved'),
('Rejected', 'Request has been rejected'),  
('Pending', 'Request is pending approval');

-- Tạo demo leave requests
INSERT INTO LeaveRequest (UserID, FromDate, ToDate, Reason, StatusID) VALUES 
(2, '2025-01-10', '2025-01-12', 'Personal leave', 3),
(3, '2025-01-15', '2025-01-17', 'Sick leave', 1),
(2, '2025-01-20', '2025-01-22', 'Family emergency', 2),
(4, '2025-01-25', '2025-01-27', 'Vacation', 3);

-- Tạo demo roles
INSERT INTO Role (RoleName, Description) VALUES 
('Director', 'Company director with full access'),
('Department Leader', 'Department manager with limited access');

SELECT 'Demo data inserted successfully' as Result;

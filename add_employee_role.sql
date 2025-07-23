-- Script để thêm role "employee" vào database
USE AssignmentDB;

-- Thêm role "employee" với RoleID = 4
SET IDENTITY_INSERT [dbo].[Role] ON;

INSERT INTO [dbo].[Role] ([RoleID], [RoleName], [Description]) 
VALUES (4, N'employee', N'employee of a department');

SET IDENTITY_INSERT [dbo].[Role] OFF;

-- Kiểm tra kết quả
SELECT * FROM [dbo].[Role];

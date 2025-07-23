# Backend API - Leave Management System

## Cấu trúc dự án

```
backend/
├── src/
│   ├── model/              # Các lớp đối tượng (Entity classes)
│   │   ├── User.js
│   │   ├── Department.js
│   │   ├── LeaveRequest.js
│   │   ├── LeaveStatus.js
│   │   └── Role.js
│   ├── dal/                # Data Access Layer
│   │   ├── DBContext.js    # Base DBContext class
│   │   ├── UserDBContext.js
│   │   ├── DepartmentDBContext.js
│   │   └── LeaveRequestDBContext.js
│   ├── controller/         # API Controllers
│   │   ├── UserController.js
│   │   └── LeaveRequestController.js
│   └── routes/            # Route definitions
│       └── api.js
├── .env                   # Environment variables
├── app.js                 # Main server file
└── package.json
```

## Cài đặt và chạy

1. **Cài đặt dependencies:**
```bash
cd backend
npm install
```

2. **Cấu hình database trong file .env:**
```
DB_SERVER=localhost
DB_DATABASE=AssignmentDB
DB_USER=dat
DB_PASSWORD=123
DB_PORT=1433
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

3. **Chạy server:**
```bash
# Development mode với nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- `GET /` - Server status
- `GET /api/health` - Database connection status

### User Management
- `GET /api/users` - Lấy danh sách tất cả users
- `GET /api/users/:id` - Lấy user theo ID
- `POST /api/users` - Tạo user mới
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user (soft delete)
- `GET /api/users/username/:username` - Tìm user theo username
- `GET /api/users/department/:departmentId` - Lấy users theo department
- `GET /api/users/:id/roles` - Lấy roles của user

### Leave Request Management
- `GET /api/leave-requests` - Lấy tất cả leave requests
- `GET /api/leave-requests/:id` - Lấy leave request theo ID
- `POST /api/leave-requests` - Tạo leave request mới
- `PUT /api/leave-requests/:id` - Cập nhật leave request
- `DELETE /api/leave-requests/:id` - Xóa leave request
- `GET /api/leave-requests/user/:userId` - Lấy leave requests theo user
- `GET /api/leave-requests/status/:statusId` - Lấy leave requests theo status
- `PUT /api/leave-requests/:id/approve` - Approve leave request
- `PUT /api/leave-requests/:id/reject` - Reject leave request
- `GET /api/leave-requests/date-range?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD` - Lấy leave requests theo khoảng thời gian

## Ví dụ API Requests

### 1. Tạo User mới
```javascript
POST /api/users
{
    "Username": "john_doe",
    "PasswordHash": "hashed_password",
    "FullName": "John Doe",
    "DepartmentID": 1
}
```

### 2. Tạo Leave Request
```javascript
POST /api/leave-requests
{
    "UserID": 1,
    "FromDate": "2025-08-01",
    "ToDate": "2025-08-05",
    "Reason": "Annual vacation"
}
```

### 3. Approve Leave Request
```javascript
PUT /api/leave-requests/1/approve
{
    "approvedBy": 2
}
```

## Database Schema

Hệ thống sử dụng các bảng sau trong SQL Server:
- `User` - Thông tin người dùng
- `Department` - Phòng ban
- `LeaveRequest` - Đơn xin nghỉ phép
- `LeaveStatus` - Trạng thái đơn nghỉ phép
- `Role` - Vai trò người dùng
- `UserRole` - Quan hệ User-Role
- `Feature` - Chức năng hệ thống
- `FeatureRole` - Phân quyền chức năng

## Kiến trúc MVC

### Models (src/model/)
- Định nghĩa các lớp đối tượng đại diện cho entities trong database
- Có validation và các phương thức utility
- Chuyển đổi giữa database format và JSON format

### Data Access Layer (src/dal/)
- `DBContext.js`: Base class cho database operations
- Các class con implement CRUD operations cho từng entity
- Sử dụng SQL Server với mssql package

### Controllers (src/controller/)
- Xử lý HTTP requests
- Validation input
- Gọi DAL methods
- Trả về JSON responses

### Routes (src/routes/)
- Định nghĩa API endpoints
- Map routes với controller methods

## Dependencies

- **express**: Web framework
- **mssql**: SQL Server driver
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables
- **body-parser**: Parse HTTP request bodies
- **nodemon**: Development auto-reload (dev dependency)

## Error Handling

Tất cả API endpoints đều có error handling và trả về consistent error format:

```javascript
{
    "success": false,
    "error": "Error message",
    "message": "Detailed error description"
}
```

## Success Response Format

```javascript
{
    "success": true,
    "data": {...}, // hoặc [...]
    "count": 10,   // cho list endpoints
    "message": "Success message"
}
```

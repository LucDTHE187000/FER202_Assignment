# Leave Management System

Ứng dụng quản lý đơn nghỉ phép gồm backend (Node.js/Express, MSSQL) và frontend (ReactJS).

## Cấu trúc thư mục

```
Assignment/
├── backend/         # API server (Node.js, Express, MSSQL)
├── frontend/        # Ứng dụng ReactJS
├── InitSQL.sql      # Script tạo database và bảng
├── README.md
└── .gitignore
```

## Hướng dẫn cài đặt

### 1. Database
- Chạy file `InitSQL.sql` trên SQL Server để tạo database và các bảng cần thiết.
- Cập nhật thông tin kết nối trong `backend/dal/DBContext.js` nếu cần.

### 2. Backend
```bash
cd backend
npm install
npm run dev # hoặc npm start
```
- Server sẽ chạy ở port 5001 (hoặc PORT trong .env)

### 3. Frontend
```bash
cd frontend
npm install
npm start
```
- Ứng dụng React sẽ chạy ở port 3000 (mặc định)

## Sử dụng
- Truy cập `http://localhost:3000` để sử dụng giao diện web.
- API backend: `http://localhost:5001/api`

## Đóng góp
Mọi ý kiến đóng góp, pull request đều được hoan nghênh!
# Node.js Backend với Authentication và MongoDB

## Mô tả Project
Đây là một backend Node.js hoàn chỉnh với hệ thống authentication và kết nối MongoDB. Project bao gồm:
- Đăng ký và đăng nhập người dùng
- JWT token authentication
- Mã hóa mật khẩu với bcrypt
- Middleware bảo vệ routes
- Kết nối MongoDB với Mongoose
- Validation dữ liệu
- Error handling

## Cấu trúc Project
```
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── users.js
│   └── utils/
│       └── validation.js
├── .env
├── app.js
└── server.js
```

## API Endpoints
- POST /api/auth/register - Đăng ký
- POST /api/auth/login - Đăng nhập
- GET /api/users/profile - Lấy thông tin profile (cần token)
- PUT /api/users/profile - Cập nhật profile (cần token)

## Environment Variables
- PORT: Cổng server
- MONGODB_URI: Kết nối MongoDB
- JWT_SECRET: Secret key cho JWT
- JWT_EXPIRE: Thời gian hết hạn token
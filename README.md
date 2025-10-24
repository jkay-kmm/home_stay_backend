# Node.js Backend với Authentication và MongoDB

Backend Node.js hoàn chỉnh với hệ thống authentication và kết nối MongoDB.

## Tính năng

- ✅ Đăng ký và đăng nhập người dùng
- ✅ JWT token authentication
- ✅ Mã hóa mật khẩu với bcrypt
- ✅ Middleware bảo vệ routes
- ✅ Kết nối MongoDB với Mongoose
- ✅ Validation dữ liệu
- ✅ Error handling
- ✅ CORS support

## Cài đặt

1. Clone project và cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` và cấu hình:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nodejs-auth
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

3. Khởi động MongoDB trên máy local hoặc sử dụng MongoDB Atlas

4. Chạy server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Đăng ký
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

#### Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "123456"
}
```

#### Lấy thông tin user hiện tại
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### User Routes (`/api/users`)

#### Lấy profile user
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Cập nhật profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

#### Lấy tất cả users (Admin only)
```http
GET /api/users
Authorization: Bearer <admin_token>
```

#### Lấy user theo ID (Admin only)
```http
GET /api/users/:id
Authorization: Bearer <admin_token>
```

## Cấu trúc Project

```
├── src/
│   ├── config/
│   │   └── database.js          # Cấu hình kết nối MongoDB
│   ├── controllers/
│   │   ├── authController.js    # Logic xử lý authentication
│   │   └── userController.js    # Logic xử lý user operations
│   ├── middleware/
│   │   ├── auth.js              # Middleware xác thực và phân quyền
│   │   └── errorHandler.js      # Middleware xử lý lỗi
│   ├── models/
│   │   └── User.js              # Schema MongoDB cho User
│   ├── routes/
│   │   ├── auth.js              # Routes cho authentication
│   │   └── users.js             # Routes cho user operations
│   └── utils/
│       └── validation.js        # Utility cho validation
├── .env                         # Environment variables
├── .gitignore                   # Git ignore file
├── app.js                       # Express app configuration
├── package.json                 # Dependencies và scripts
└── server.js                    # Entry point của application
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Cổng server | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/nodejs-auth |
| `JWT_SECRET` | Secret key cho JWT tokens | (required) |
| `JWT_EXPIRE` | Thời gian hết hạn JWT token | 30d |

## Cách sử dụng

1. **Đăng ký user mới:**
   - Gửi POST request đến `/api/auth/register`
   - Nhận về token và thông tin user

2. **Đăng nhập:**
   - Gửi POST request đến `/api/auth/login`
   - Nhận về token để sử dụng cho các request tiếp theo

3. **Truy cập protected routes:**
   - Thêm header `Authorization: Bearer <token>` vào request
   - Token sẽ được validate tự động

## Security Features

- **Password Hashing:** Sử dụng bcrypt với salt rounds = 10
- **JWT Tokens:** Secure token-based authentication
- **Input Validation:** Validate tất cả input data
- **Error Handling:** Comprehensive error handling middleware
- **CORS:** Configured cho cross-origin requests

## Development

Để chạy trong development mode:
```bash
npm run dev
```

Server sẽ tự động restart khi có thay đổi file nhờ nodemon.

## Testing API

Bạn có thể test API bằng các công cụ như:
- Postman
- Insomnia
- Thunder Client (VS Code extension)
- curl

Example với curl:
```bash
# Đăng ký
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'

# Đăng nhập
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

## License

ISC
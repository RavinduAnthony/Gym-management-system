# FitZone Gym Management Backend

RESTful API for FitZone Gym Management System built with Node.js, Express, and MongoDB.

## Features

- ✅ User authentication with JWT (access & refresh tokens)
- ✅ Role-based authorization (member, trainer, admin)
- ✅ User management (CRUD operations)
- ✅ Trainer management
- ✅ Membership packages
- ✅ Input validation with Joi
- ✅ Error handling
- ✅ Request rate limiting
- ✅ Security with Helmet & CORS
- ✅ Logging with Winston
- ✅ API documentation with Swagger

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Joi
- **Security:** Helmet, CORS, bcryptjs
- **Logging:** Winston
- **Documentation:** Swagger (swagger-jsdoc, swagger-ui-express)
- **Development:** Nodemon

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
```bash
cd gym-management-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gym-management
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRE=30d
CORS_ORIGIN=http://localhost:5173
```

4. **Start MongoDB**

Make sure MongoDB is running on your machine:
```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# Or run mongod directly
mongod
```

5. **Run the application**

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Documentation

Once the server is running, access the interactive API documentation at:

**Swagger UI:** http://localhost:5000/api-docs

## Project Structure

```
gym-management-backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # MongoDB connection
│   │   └── swagger.js   # Swagger configuration
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── trainerController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # Authentication & authorization
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validate.js
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Trainer.js
│   │   ├── Membership.js
│   │   └── Attendance.js
│   ├── routes/          # API routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── trainerRoutes.js
│   │   └── index.js
│   ├── services/        # Business logic
│   │   ├── authService.js
│   │   ├── userService.js
│   │   └── trainerService.js
│   ├── utils/           # Utility functions
│   │   ├── ApiError.js
│   │   ├── asyncHandler.js
│   │   └── logger.js
│   ├── validators/      # Joi validation schemas
│   │   ├── userValidator.js
│   │   └── trainerValidator.js
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── logs/                # Log files
├── .env                 # Environment variables
├── .env.example         # Example environment variables
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (protected)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get user by ID (protected)
- `PUT /api/users/:id` - Update user (protected)
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/stats` - Get user statistics (admin only)

### Trainers
- `GET /api/trainers` - Get all trainers
- `GET /api/trainers/:id` - Get trainer by ID
- `POST /api/trainers` - Create trainer (admin only)
- `PUT /api/trainers/:id` - Update trainer (admin only)
- `DELETE /api/trainers/:id` - Delete trainer (admin only)

## Testing the API

### Using Swagger UI

1. Navigate to http://localhost:5000/api-docs
2. Click "Authorize" and enter your JWT token
3. Try out the API endpoints interactively

### Using cURL

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "mobileNumber": "0771234567",
    "nicNumber": "991234567V",
    "address": "123 Main St, Colombo",
    "height": 175,
    "weight": 70,
    "packageType": "standard"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get all users (with token):**
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/gym-management |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_REFRESH_EXPIRE` | Refresh token expiration | 30d |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |

## Security Features

- Password hashing with bcryptjs
- JWT authentication with access & refresh tokens
- Role-based authorization
- Request rate limiting
- CORS protection
- Helmet security headers
- Input validation with Joi
- MongoDB injection prevention

## Error Handling

The API uses a centralized error handling system:
- All errors are caught and formatted consistently
- Validation errors return detailed field-level messages
- Authentication errors return appropriate status codes
- Stack traces are included in development mode only

## Logging

Winston logger is configured to:
- Log to console in development
- Save logs to `logs/combined.log`
- Save error logs to `logs/error.log`
- Rotate log files when they reach 5MB

## Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (to be implemented)
npm run test:watch # Run tests in watch mode
```

## Connecting Frontend

Update your React frontend to connect to this backend:

```javascript
const API_URL = 'http://localhost:5000/api';

// Register user
const response = await fetch(`${API_URL}/auth/register`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(userData),
});

// Get users with authentication
const response = await fetch(`${API_URL}/users`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## Future Enhancements

- [ ] Unit and integration tests
- [ ] Email service for password reset
- [ ] File upload for profile pictures
- [ ] Attendance tracking API
- [ ] Payment integration
- [ ] Workout plan management
- [ ] Notifications system

## License

ISC

## Support

For support, email support@fitzone.com

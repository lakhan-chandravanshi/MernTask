# Backend Authentication System

A secure and scalable authentication system built with Node.js, Express.js, TypeScript, Prisma, JWT, Redis, and BullMQ.

## Features

- ✅ User registration and login with secure password hashing (bcrypt)
- ✅ JWT-based authentication and authorization
- ✅ Single active device/session per user (Redis-managed)
- ✅ Logout from current device and login from new device
- ✅ Redis for session, token, and device management
- ✅ File upload using Multer (avatar upload)
- ✅ BullMQ + Redis for background email tasks
- ✅ Input validation using Zod
- ✅ Centralized error handling
- ✅ Prisma ORM for database operations
- ✅ Clean, scalable, modular project structure

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Session**: Redis
- **Queue**: BullMQ
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Zod
- **File Upload**: Multer
- **Security**: Helmet, CORS, bcrypt

## Project Structure

```
MernTask/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   ├── env.ts            # Environment variables
│   │   ├── prisma.ts         # Prisma client
│   │   └── redis.ts          # Redis client
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── validate.middleware.ts
│   ├── queues/
│   │   ├── email.queue.ts
│   │   └── email.worker.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── user.routes.ts
│   ├── schemas/
│   │   └── auth.schema.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── email.service.ts
│   ├── types/
│   │   └── express.d.ts
│   ├── utils/
│   │   ├── app-error.ts
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── session.ts
│   ├── app.ts
│   └── server.ts
├── uploads/                   # Uploaded files
├── .env
├── .env.example
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Docker Services (PostgreSQL + Redis)

```bash
docker compose up -d
```

Or with docker-compose:

```bash
docker-compose up -d
```

### 3. Configure Environment Variables

The `.env` file is already created with default values. Update if needed:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SESSION_TTL=604800
COOKIE_SECURE=false
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=
```

### 4. Run Prisma Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Start the Development Server

```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 7. Start the Email Worker (Optional)

In a separate terminal:

```bash
npm run worker
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
  - Body: `{ name, email, password }`
  
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Headers: `x-device-id` (optional), `user-agent` (auto)
  
- `POST /api/auth/refresh` - Refresh access token
  - Cookie: `refreshToken` (httpOnly)
  
- `POST /api/auth/logout` - Logout user
  - Headers: `Authorization: Bearer <accessToken>`

### User

- `GET /api/users/profile` - Get user profile
  - Headers: `Authorization: Bearer <accessToken>`
  
- `POST /api/users/avatar` - Upload avatar
  - Headers: `Authorization: Bearer <accessToken>`
  - Body: `multipart/form-data` with `avatar` file

### Health

- `GET /health` - Health check

## Session Management

- **Single Device Policy**: Only one active session per user
- **New Login**: Invalidates previous session
- **Session Storage**: Redis with TTL (7 days default)
- **Device Tracking**: Device ID, user agent, IP stored in session

## Security Features

- Password hashing with bcrypt (12 rounds)
- HTTP-only cookies for refresh tokens
- JWT access tokens (15 min expiry)
- JWT refresh tokens (7 days expiry)
- Helmet for security headers
- CORS configured
- Input validation with Zod
- Centralized error handling
- File upload restrictions (images only, 5MB max)

## Testing with cURL

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' \
  -c cookies.txt
```

### Get Profile

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <your_access_token>"
```

### Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer <your_access_token>" \
  -b cookies.txt
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run worker` - Start email queue worker
- `npx prisma generate` - Generate Prisma client
- `npx prisma migrate dev` - Run database migrations
- `npx prisma studio` - Open Prisma Studio (database GUI)

## Notes

- SMTP configuration is optional. If not configured, emails will be skipped with a log message.
- The system uses Prisma v5 for stability.
- Redis and PostgreSQL are required and can be started via Docker Compose.

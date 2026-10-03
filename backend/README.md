# CampusConnect Backend API

Node.js + Express backend service for the CampusConnect campus event management system.

## Project Structure

```
backend/
├── src/
│   ├── config/             # Environment & database connection loaders
│   │   ├── database.js     # Mongoose connection & event lifecycle
│   │   └── index.js        # Environment configuration (PORT, DB, JWT)
│   ├── controllers/        # Request handlers & controller logic
│   │   ├── authController.js   # Real authentication (register, login, me)
│   │   └── healthController.js # Health check & DB status
│   ├── middleware/         # Central error-handling & request filters
│   │   ├── authMiddleware.js   # JWT authentication & role-based authorization
│   │   └── errorHandler.js     # 404 & Central error handling
│   ├── models/             # Mongoose database models & schemas
│   │   ├── User.js         # User schema (student, organizer, admin)
│   │   ├── Event.js        # Event schema with status & capacity
│   │   ├── Registration.js # Registration schema with unique ticket & compound index
│   │   ├── Notification.js # Notification schema with recipient & read status
│   │   └── index.js        # Export aggregator for models
│   ├── routes/             # Express API routing tables
│   │   ├── authRoutes.js   # /api/auth routes (register, login, me)
│   │   ├── healthRoutes.js # /api/health route
│   │   └── index.js        # Main API router aggregator
│   ├── scripts/            # Utility scripts
│   │   └── seed.js         # Optional database seeding script (real bcrypt hashes)
│   ├── services/           # Business logic & 3rd-party services (future phases)
│   ├── utils/              # Helper utilities
│   │   ├── jwt.js          # Token signing & verification
│   │   └── password.js     # Bcrypt password hashing & comparison
│   └── app.js              # Express app initialization & server listener
├── .env                    # Local environment variables (git-ignored)
├── .env.example            # Template for environment variables
├── .gitignore              # Git ignore rules for backend
├── package.json            # Node.js project manifest and scripts
└── README.md               # Backend documentation
```

## Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node.js v24)
- **npm**: v9+
- **MongoDB Atlas** account or MongoDB instance

### 2. Installation
Navigate to the `backend` directory and install dependencies:

```bash
cd backend
npm install
```

### 3. Environment Configuration
Copy the `.env.example` file to create your local `.env`:

```bash
cp .env.example .env
```

Configure your local `.env` with your actual MongoDB URI and JWT Secret:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/campusconnect?retryWrites=true&w=majority
JWT_SECRET=your_long_random_jwt_secret
JWT_EXPIRES_IN=7d
```

> **Security Note:** Never commit `.env` or hardcode credentials into the source code. `.env` is listed in `.gitignore`.

### 4. Running the Server

#### Development Mode (with automatic restart on file change via nodemon):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

### 5. API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Check service and database connection health |
| `POST` | `/api/auth/register` | Public | Register new student or organizer |
| `POST` | `/api/auth/login` | Public | Sign in with email and password, receives JWT |
| `GET` | `/api/auth/me` | Protected (`Bearer <token>`) | Get profile of authenticated user |

#### Sample Registration Request:
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Prathik Kumar",
  "email": "prathik@campus.edu",
  "password": "Password@123",
  "role": "student",
  "department": "Computer Applications (MCA)",
  "rollNumber": "MCA2024042",
  "phone": "+91 9876543210"
}
```

#### Sample Login Request:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "prathik@campus.edu",
  "password": "Password@123"
}
```

#### Sample Protected Profile Request:
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

### 6. Optional Database Seeding
To populate the database with initial demo data (students, organizers, events, registration, notification), run:

```bash
npm run seed
```

> **Note:** This script is **strictly optional** and must be triggered manually. It is never executed automatically.

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
│   │   ├── eventController.js  # Real Event CRUD, filtering, & ownership checks
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
│   │   ├── eventRoutes.js  # /api/events routes (CRUD, filtering, search)
│   │   ├── healthRoutes.js # /api/health route
│   │   └── index.js        # Main API router aggregator
│   ├── scripts/            # Utility scripts
│   │   ├── seed.js         # Optional database seeding script (real bcrypt hashes)
│   │   ├── testAuth.js     # Automated authentication verification suite
│   │   └── testEvents.js   # Automated event REST API verification suite
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

#### Health Check
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Check service and database connection health |

#### Authentication Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new student or organizer |
| `POST` | `/api/auth/login` | Public | Sign in with email and password, receives JWT |
| `GET` | `/api/auth/me` | Protected (`Bearer <token>`) | Get profile of authenticated user |

#### Event Management Endpoints (Phase 5D)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/events` | Public / Optional Auth | Query published events (supports `category`, `status`, `search`, `page`, `limit`, and `mine=true` for organizers) |
| `GET` | `/api/events/:id` | Public / Optional Auth | Retrieve single event by MongoDB ObjectId |
| `POST` | `/api/events` | Protected (`organizer`, `admin`) | Create a new campus event |
| `PUT` | `/api/events/:id` | Protected (`organizer`, `admin`) | Update an existing campus event (owner/admin only) |
| `DELETE` | `/api/events/:id` | Protected (`organizer`, `admin`) | Cancel an event safely (marks status as `cancelled`) |

#### Sample Event Creation Request (`POST /api/events`):
```http
POST /api/events
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "National AI Hackathon 2026",
  "description": "36-hour competitive AI hackathon for students across universities.",
  "category": "Technical",
  "bannerUrl": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
  "startDate": "2026-11-10T09:00:00.000Z",
  "endDate": "2026-11-11T21:00:00.000Z",
  "venue": "Campus Main Auditorium",
  "maxCapacity": 150,
  "status": "published"
}
```

#### Sample Query with Filters (`GET /api/events`):
```http
GET /api/events?category=Technical&search=hackathon&page=1&limit=10
```

### 6. Optional Database Seeding
To populate the database with initial demo data (students, organizers, events, registration, notification), run:

```bash
npm run seed
```

> **Note:** This script is **strictly optional** and must be triggered manually. It is never executed automatically.

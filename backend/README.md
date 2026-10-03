# CampusConnect Backend API

Node.js + Express backend service for the CampusConnect campus event management system.

## Project Structure

```
backend/
├── src/
│   ├── config/             # Environment & database connection loaders
│   │   ├── database.js     # Mongoose connection & event lifecycle
│   │   └── index.js        # Environment configuration
│   ├── controllers/        # Request handlers & controller logic
│   │   └── healthController.js # Health check & DB status
│   ├── middleware/         # Central error-handling & request filters
│   │   └── errorHandler.js # 404 & Central error handling
│   ├── models/             # Mongoose database models & schemas
│   │   ├── User.js         # User schema (student, organizer, admin)
│   │   ├── Event.js        # Event schema with status & capacity
│   │   ├── Registration.js # Registration schema with unique ticket & compound index
│   │   ├── Notification.js # Notification schema with recipient & read status
│   │   └── index.js        # Export aggregator for models
│   ├── routes/             # Express API routing tables
│   │   ├── healthRoutes.js # /api/health route
│   │   └── index.js        # Main API router aggregator
│   ├── scripts/            # Utility scripts
│   │   └── seed.js         # Optional database seeding script
│   ├── services/           # Business logic & 3rd-party services (future phases)
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

Configure your local `.env` with your actual MongoDB URI:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/campusconnect?retryWrites=true&w=majority
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

### 5. Health Check Endpoint
Once the server is running, verify the API and MongoDB connection status:

```bash
GET http://localhost:5000/api/health
```

Expected response when MongoDB is connected:
```json
{
  "success": true,
  "message": "CampusConnect API is running",
  "database": "connected",
  "timestamp": "2026-10-03T04:35:00.000Z",
  "environment": "development"
}
```

If MongoDB is disconnected:
```json
{
  "success": false,
  "message": "CampusConnect API is running, but database is not connected",
  "database": "disconnected",
  "timestamp": "2026-10-03T04:35:00.000Z",
  "environment": "development"
}
```

### 6. Optional Database Seeding
To populate the database with initial demo data (students, organizers, events, registration, notification), run:

```bash
npm run seed
```

> **Note:** This script is **strictly optional** and must be triggered manually. It is never executed automatically.

---

## Database Models & Indexes

| Model | Key Fields | Indexes |
|---|---|---|
| **User** | `name`, `email`, `passwordHash`, `role` (student/organizer/admin), `department`, `rollNumber`, `phone`, `avatarUrl`, `pushToken` | `email` (unique) |
| **Event** | `title`, `description`, `category`, `bannerUrl`, `startDate`, `endDate`, `venue`, `maxCapacity`, `registeredCount`, `organizerId`, `status`, `organizerDetails` | `organizerId`, `category`, `startDate`, `status`, compound `{ status, startDate }` |
| **Registration** | `eventId`, `studentId`, `registrationDate`, `status`, `ticketCode`, `attendedAt` | Compound unique `{ eventId, studentId }`, `ticketCode` (unique), `studentId` |
| **Notification** | `recipientId`, `eventId`, `title`, `message`, `isRead`, `type`, `createdAt` | `recipientId`, `createdAt`, compound `{ recipientId, isRead }` |

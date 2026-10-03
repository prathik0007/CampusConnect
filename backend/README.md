# CampusConnect Backend API

Node.js + Express backend service for the CampusConnect campus event management system.

## Project Structure

```
backend/
├── src/
│   ├── config/             # Environment & configuration loaders
│   ├── controllers/        # Request handlers & controller logic
│   ├── middleware/         # Central error-handling & request filters
│   ├── models/             # Database schemas (populated in Phase 5B)
│   ├── routes/             # Express API routing tables
│   ├── services/           # Business logic & 3rd-party services
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

Ensure the following variables are configured in `.env`:
```env
PORT=5000
NODE_ENV=development
```

### 4. Running the Server

#### Development Mode (with automatic restart on file change via nodemon):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

### 5. Health Check
Once the server is running, verify it by making a GET request to:

```bash
GET http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "CampusConnect API is running",
  "timestamp": "2026-10-03T04:26:00.000Z",
  "environment": "development"
}
```

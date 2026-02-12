# 🔧 TileRush — Backend API

REST API server for TileRush, built with **Express 5** and **MongoDB**. Handles authentication, card management, claiming logic, and real-time broadcast triggers.

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── modules/                 # Feature-based modules
│   │   ├── auth/                # Authentication logic
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.routes.ts
│   │   ├── card/                # Card & Game logic
│   │   │   ├── card.controller.ts
│   │   │   ├── card.service.ts
│   │   │   ├── card.repository.ts
│   │   │   └── card.routes.ts
│   │   └── user/                # User management
│   │       └── user.repository.ts
│   ├── shared/                  # Cross-cutting concerns
│   │   ├── config/              # database.ts
│   │   ├── middleware/          # auth.middleware.ts
│   │   ├── models/              # Mongoose schemas (Card, User, ClaimLog)
│   │   ├── services/            # Shared services (expiryChecker, realtimeBroadcast)
│   │   └── utils/               # response.util, jwt.util, health.routes
│   ├── scripts/
│   │   └── seedAllCards.ts      # Database seeder
│   └── server.ts                # App entry point
├── .env
├── package.json
└── tsconfig.json
```

### Architecture Layering (Functional)
The backend follows a strict **Controller → Service → Repository** pattern using exported functions (no classes):
- **Repositories**: Pure database access (Mongoose queries).
- **Services**: Business logic and coordination (points, cooldowns, broadcasts).
- **Controllers**: HTTP request/response handling.


---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development

# Claim System Configuration
MAX_CLAIMS=5                    # Max claims per window
CLAIM_WINDOW_MINUTES=3          # Rate limit window (minutes)
MAX_ACTIVE_CARDS=4              # Max cards a user can hold at once
BASE_COOLDOWN_SECONDS=10        # Cooldown after each claim
TRAP_EXTRA_COOLDOWN_SECONDS=30  # Additional cooldown for trap cards

# Internal Communication
INTERNAL_SECRET=your-internal-secret-key
REALTIME_SERVER_URL=http://localhost:3001
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Seed the database with 60 cards (30 Normal, 12 Rare, 18 Trap)
npx ts-node src/scripts/seedAllCards.ts

# Start development server (auto-restarts on changes)
npm run dev
```

The server will start on **http://localhost:5000**.

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/signup` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login and receive JWT | ❌ |

### Cards

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/cards` | Fetch all cards | ✅ |
| `POST` | `/api/cards/:id/claim` | Claim a card | ✅ |

### Health

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/health` | Server health check | ❌ |

---

## 🗄️ Data Models

### Card

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Card display name |
| `image` | String | Image URL |
| `type` | Enum | `normal`, `rare`, `trap` |
| `points` | Number | Points awarded (negative for traps) |
| `duration` | Number | How long the card stays claimed (**seconds**) |
| `ownerId` | ObjectId | Reference to the owning User (null if unclaimed) |
| `expiresAt` | Date | When the claim expires |

### User

| Field | Type | Description |
|-------|------|-------------|
| `username` | String | Unique display name |
| `email` | String | Unique email |
| `password` | String | Hashed password (bcrypt) |
| `totalPoints` | Number | Cumulative score |
| `cooldownUntil` | Date | When the user can claim again |

### ClaimLog

| Field | Type | Description |
|-------|------|-------------|
| `userId` | ObjectId | Who claimed |
| `cardId` | ObjectId | Which card |
| `claimedAt` | Date | Timestamp of the claim |

---

## 🔄 Real-Time Broadcast

When a card is claimed, the backend sends an internal HTTP POST to the **realtime-server**:

- `POST /internal/broadcast/card-update` — Broadcasts updated card data
- `POST /internal/broadcast/leaderboard-update` — Broadcasts leaderboard changes

These requests are authenticated via the `x-internal-secret` header.

---

## 📄 License

MIT

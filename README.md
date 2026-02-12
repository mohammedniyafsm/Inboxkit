# Card Rush

Real-time multiplayer grid capture application built as a full-stack system:

- `client`: React + Vite frontend
- `backend`: Express + MongoDB API with game rules
- `realtime-server`: WebSocket broadcast service

Users capture cells on a shared grid, gain or lose points based on cell type, and see state updates instantly across connected clients.

## Highlights

- Real-time shared state via WebSockets
- Atomic conflict handling for concurrent claims
- JWT-based authenticated gameplay
- Cooldowns, rate limits, and max-active-cell constraints
- Live leaderboard updates
- Expiry scheduler that releases captured cells automatically

## Architecture

```text
React Client  --REST-->  Backend API  --MongoDB-->  Database
      ^                         |
      |                         | internal HTTP (signed with INTERNAL_SECRET)
      +------ WebSocket <-------+
                 Realtime Server
```

## Repository Layout

```text
InboxKit/
  backend/          # REST API, game logic, MongoDB models, expiry worker
  client/           # React SPA (auth, arena UI, live updates)
  realtime-server/  # WebSocket server + internal broadcast endpoints
  README.md
```

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend API | Node.js, Express, TypeScript, Mongoose |
| Realtime | `ws` WebSocket server, Express internal endpoints |
| Database | MongoDB |
| Auth | JWT |
| Deployment-ready config | Vercel configs in each service |

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB database (local or Atlas)

## Quick Start (Local Development)

1. Install dependencies in each service.

```bash
cd backend && npm install
cd ../realtime-server && npm install
cd ../client && npm install
```

2. Configure environment variables (see next section).
3. Seed cards in the database.

```bash
cd backend
npx ts-node src/scripts/seedAllCards.ts
```

4. Run all services in separate terminals.

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd realtime-server
npm run dev

# Terminal 3
cd client
npm run dev
```

5. Open `http://localhost:5173`.

## Environment Variables

### `backend/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>
JWT_SECRET=replace-with-strong-secret
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

MAX_CLAIMS=3
CLAIM_WINDOW_MINUTES=2
MAX_ACTIVE_CARDS=2
BASE_COOLDOWN_SECONDS=60
TRAP_EXTRA_COOLDOWN_SECONDS=300

INTERNAL_SECRET=replace-with-shared-internal-secret
REALTIME_SERVER_URL=http://localhost:3001
```

### `realtime-server/.env`

```env
PORT=3001
JWT_SECRET=replace-with-strong-secret
INTERNAL_SECRET=replace-with-shared-internal-secret
```

### `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=ws://localhost:3001
```

### Required Secret Consistency

- `backend.JWT_SECRET` must match `realtime-server.JWT_SECRET`
- `backend.INTERNAL_SECRET` must match `realtime-server.INTERNAL_SECRET`

## API Reference

Base URL (local): `http://localhost:5000`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register user and issue JWT |
| POST | `/api/auth/login` | No | Login and issue JWT |
| GET | `/api/auth/me` | Yes | Get current user profile |
| GET | `/api/auth/leaderboard` | No | Get top users by score |
| GET | `/api/cards` | Yes | List cards/cells with owner state |
| GET | `/api/cards/:id` | Yes | Get one card/cell |
| POST | `/api/cards/:id/claim` | Yes | Attempt to capture a card/cell |
| GET | `/health` | No | Service health information |

Response shape:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

## Realtime Protocol

WebSocket URL (local): `ws://localhost:3001?token=<JWT>`

Server-to-client events:

- `cardUpdated`
- `cardExpired`
- `leaderboardUpdated`

Client keepalive:

- send `{ "type": "PING" }`
- receive `{ "type": "PONG" }`

Backend sends internal realtime triggers to:

- `POST /internal/broadcast/card-update`
- `POST /internal/broadcast/card-expired`
- `POST /internal/broadcast/leaderboard-update`

These endpoints require `x-internal-secret`.

## Concurrency and Conflict Handling

- Claim operation uses an atomic DB update (`findOneAndUpdate`) to avoid double-capture race conditions.
- Claims only succeed when a cell is unowned or already expired.
- If two users click at the same time, only one succeeds; the other receives a conflict-style failure.

## Gameplay Rules (Configurable)

- Max claims within a time window
- Max active captured cells per user
- Base cooldown after every claim
- Extra cooldown for trap cells
- Auto-expiry job clears expired ownership and broadcasts updates

## Deployment Notes

- Each service can be deployed independently (`client`, `backend`, `realtime-server`).
- Update `FRONTEND_URL`, `VITE_API_URL`, and `VITE_SOCKET_URL` for deployed domains.
- Use `wss://` for production websocket URLs.
- Keep `INTERNAL_SECRET` private; never expose internal broadcast routes publicly.

## Current Status and Known Gaps

- Core realtime multi-user flow is implemented and production-structured.
- Current seed script inserts 60 cells/cards. If your requirement is "hundreds", increase seed volume to 100+.

## License

MIT



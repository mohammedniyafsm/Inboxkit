# 🎨 TileRush — Client

Interactive React SPA for TileRush, built with **React 19**, **Vite 7**, **TypeScript**, and **Tailwind CSS 4**. Features a dark-themed, premium UI with real-time updates via WebSockets.

---

## 📁 Project Structure

```
client/
├── src/
│   ├── assets/                  # Static assets (images, fonts)
│   ├── components/
│   │   ├── ui/                  # Reusable UI primitives (Button, Tooltip, etc.)
│   │   ├── CardTile.tsx         # Individual card tile component
│   │   ├── Footer.tsx           # Site footer with branding
│   │   ├── Hero.tsx             # Landing page hero section
│   │   ├── SplashCursor.tsx     # Animated cursor effect
│   │   └── ...                  # Other shared components
│   ├── context/
│   │   └── AuthContext.tsx      # Global authentication state (JWT, user)
│   ├── hooks/
│   │   ├── useArenaSocket.ts    # WebSocket connection manager (singleton)
│   │   └── use-mobile.tsx       # Responsive breakpoint hook
│   ├── lib/
│   │   └── utils.ts             # Utility functions (cn, shuffleArray, triggerSideCannons)
│   ├── pages/
│   │   ├── Arena.tsx            # Main game board (card grid + leaderboard)
│   │   ├── Home.tsx             # Landing page
│   │   ├── Login.tsx            # Login page
│   │   └── Signup.tsx           # Registration page
│   ├── services/
│   │   ├── api.ts               # Axios instance with JWT interceptor
│   │   └── card.service.ts      # Card API calls (fetchCards, claimCard)
│   ├── types/
│   │   └── card.ts              # Card TypeScript interfaces
│   ├── App.tsx                  # Root component with routing
│   ├── main.tsx                 # App entry point
│   └── index.css                # Global styles & Tailwind config
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The client will start on **http://localhost:5173**.

### Environment

The client uses Vite environment variables. The API URL is configured via:

```
VITE_API_URL=http://localhost:5000/api
```

This can be set in a `.env` file or defaults to the value in `services/api.ts`.

---

## 🎮 Key Features

### Arena Page
- **Dynamic Card Grid** — 60 cards displayed in a responsive grid (4-10 columns)
- **Card Shuffling** — Cards shuffle on load, after claiming, and via manual "Reshuffle" button
- **Real-Time Updates** — WebSocket receives live card ownership and leaderboard changes
- **Card Preview Modal** — Click a card to see its full artwork and details
- **Cooldown Timer** — Visual countdown preventing rapid claims

### Visual Effects
- **🎉 Rare Cards** — Side Cannons confetti celebration using `canvas-confetti`
- **💀 Trap Cards** — Red glow background with "TRAPPED!" warning
- **🔒 Claimed Cards** — Red striped pattern with grayscale overlay and owner name

### Authentication
- **JWT-based** — Login/Signup with token stored in context
- **Protected Routes** — Arena requires authentication
- **Auto-redirect** — Unauthenticated users sent to login

### Leaderboard
- **Live Rankings** — Top 4 players shown in sidebar
- **Current User** — Always visible even if not in top 4

---

## 🧩 Key Components

| Component | Purpose |
|-----------|---------|
| `CardTile` | Renders a single card with state-dependent styling (unclaimed, active, locked) |
| `Arena` | Main game page — grid, modal, leaderboard, effects |
| `useArenaSocket` | Singleton WebSocket manager with auto-reconnect and heartbeat |
| `AuthContext` | Global auth state provider (JWT token, user info, login/logout) |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| Vite 7 | Build tool & dev server |
| TypeScript | Type safety |
| Tailwind CSS 4 | Utility-first styling |
| Framer Motion | Animations & layout transitions |
| Axios | HTTP client with interceptors |
| canvas-confetti | Confetti visual effects |
| Lucide React | Icon library |
| Radix UI | Accessible tooltip primitives |

---

## 📄 License

MIT

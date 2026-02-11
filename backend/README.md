# Card Arena Backend

A Node.js + TypeScript backend server for a real-time multiplayer card arena game with user authentication, role-based access control, and card management.

## 🎯 Features

- ✅ User authentication (JWT-based)
- ✅ Role-based access control (User & Admin)
- ✅ Card management system (CRUD operations)
- ✅ MongoDB database integration
- ✅ Clean modular architecture
- ✅ TypeScript for type safety
- ✅ Ready for WebSocket integration

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Language**: TypeScript
- **Dev Tools**: Nodemon, ts-node

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.ts   # Auth endpoints logic
│   │   └── card.controller.ts   # Card endpoints logic
│   ├── models/
│   │   ├── User.model.ts        # User schema
│   │   └── Card.model.ts        # Card schema
│   ├── routes/
│   │   ├── auth.routes.ts       # Auth routes
│   │   ├── card.routes.ts       # Card routes
│   │   └── health.routes.ts     # Health check
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification
│   │   └── role.middleware.ts   # Role-based access
│   ├── services/
│   │   ├── auth.service.ts      # Auth business logic
│   │   └── card.service.ts      # Card business logic
│   ├── utils/
│   │   ├── jwt.util.ts          # JWT helpers
│   │   └── response.util.ts     # API response helpers
│   ├── app.ts                   # Express app config
│   └── server.ts                # Server entry point
├── dist/                        # Compiled TypeScript
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
├── nodemon.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone or navigate to the project**:
   ```bash
   cd card-arena-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   
   Copy `.env.example` to `.env` and update with your values:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/card-arena
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

   For MongoDB Atlas, use a connection string like:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/card-arena?retryWrites=true&w=majority
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   Or build and run production:
   ```bash
   npm run build
   npm start
   ```

## 📡 API Endpoints

### Health Check

```http
GET /api/health
```
Returns server status and uptime.

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "totalPoints": 0
    }
  }
}
```

### Card Management

#### Get All Cards (Public)
```http
GET /api/cards
```

#### Get Card by ID (Public)
```http
GET /api/cards/:id
```

#### Create Card (Admin Only)
```http
POST /api/cards
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "name": "Fire Dragon",
  "image": "https://example.com/dragon.jpg",
  "points": 100,
  "type": "rare"
}
```

#### Delete Card (Admin Only)
```http
DELETE /api/cards/:id
Authorization: Bearer <admin-jwt-token>
```

## 🔐 Authorization

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

**Roles**:
- `user` - Default role for all registered users
- `admin` - Required for card creation and deletion

## 👨‍💼 Creating an Admin User

Since there's no admin registration endpoint (security best practice), create an admin manually in MongoDB:

### Using MongoDB Shell:
```javascript
use card-arena

db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  password: "admin123",
  role: "admin",
  totalPoints: 0,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Using MongoDB Compass:
1. Connect to your database
2. Select the `users` collection
3. Click "Add Data" → "Insert Document"
4. Paste:
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin",
  "totalPoints": 0,
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"}
}
```

## 🧪 Testing the API

You can test the API using:
- **Postman**: Import the endpoints and test manually
- **Thunder Client** (VS Code extension): Lightweight API testing
- **cURL**: Command-line testing

Example cURL commands:

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get all cards
curl http://localhost:5000/api/cards

# Create a card (replace <TOKEN> with admin JWT)
curl -X POST http://localhost:5000/api/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Fire Dragon","image":"https://example.com/dragon.jpg","points":100,"type":"rare"}'
```

## 🔮 Future Enhancements

This backend is designed to scale. Here's what can be added:

### Planned Features:
- 🔐 Password hashing (bcrypt)
- 🔄 Refresh token rotation
- 🌐 WebSocket server for real-time gameplay
- 🎮 Game room management
- 📊 Player stats and leaderboard
- 💳 Card trading system
- 🎯 Match history
- 🔔 Real-time notifications

### Architecture Considerations:

**Why separate WebSocket server?**
- Isolate real-time layer from HTTP API
- Independent scaling (scale WebSocket servers separately)
- Better resource management
- Can use Redis pub/sub for multi-server communication
- Easier to deploy and maintain

**Stateless Design:**
- No session storage in memory
- JWT-based authentication (stateless)
- All state in MongoDB/Redis
- Ready for horizontal scaling

## 📝 Development Notes

### Current State:
- ⚠️ **Passwords are stored as plain text** (as requested for prototype)
- ✅ **Stateless authentication** (ready for scaling)
- ✅ **Modular architecture** (easy to extend)
- ✅ **TypeScript** (type safety and better DX)

### Before Production:
1. Implement password hashing (bcrypt)
2. Add rate limiting
3. Implement refresh tokens
4. Add input sanitization
5. Setup logging (Winston/Morgan)
6. Add comprehensive error tracking
7. Implement request validation (Joi/Zod)
8. Setup monitoring and alerting

## 🐛 Troubleshooting

### MongoDB Connection Issues:
- Ensure MongoDB is running locally or Atlas IP whitelist is configured
- Check `MONGO_URI` in `.env` file
- Verify network connectivity

### JWT Errors:
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration (default: 7 days)
- Verify token format in Authorization header

### Build Errors:
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and `package-lock.json`, then reinstall
- Check TypeScript version compatibility

## 📄 License

ISC

## 👨‍💻 Author

Built as a scalable backend for a multiplayer card arena game.

---

**Ready to build something awesome! 🚀**

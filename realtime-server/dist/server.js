"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const ws_1 = require("ws");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const websocket_1 = require("./websocket");
const broadcast_routes_1 = __importDefault(require("./routes/broadcast.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/internal/broadcast', broadcast_routes_1.default);
const server = (0, http_1.createServer)(app);
const wss = new ws_1.WebSocketServer({ server });
(0, websocket_1.setupWebSocket)(wss);
server.listen(PORT, () => {
    console.log(`Real-time server running on port ${PORT}`);
});

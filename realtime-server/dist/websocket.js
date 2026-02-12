"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcast = exports.setupWebSocket = void 0;
const ws_1 = require("ws");
const auth_1 = require("./auth");
const url_1 = __importDefault(require("url"));
let wssInstance = null;
const userSockets = new Map();
const setupWebSocket = (wss) => {
    wssInstance = wss;
    wss.on('connection', (ws, req) => {
        const query = url_1.default.parse(req.url || '', true).query;
        const token = query.token;
        if (!token) {
            console.log('No token provided, closing connection');
            ws.close(4001, 'Unauthorized: No token provided');
            return;
        }
        const user = (0, auth_1.verifyToken)(token);
        if (!user) {
            console.log('Invalid token, closing connection');
            ws.close(4001, 'Unauthorized: Invalid token');
            return;
        }
        ws.user = user;
        ws.isAlive = true;
        // Diagnostic info: remote address and websocket key
        const remote = (req.socket && req.socket.remoteAddress) || 'unknown-remote';
        const wsKey = req.headers['sec-websocket-key'] || 'no-key';
        // Ensure a single active connection per user. If an existing socket
        // exists for this user, close or terminate it and replace with the new one.
        const existing = userSockets.get(user.userId);
        if (existing) {
            console.log(`Replacing existing connection for ${user.email} (${user.userId}). remote=${remote} key=${wsKey}`);
            try {
                existing.close(1000, 'Replaced by new connection');
            }
            catch (e) {
                try {
                    existing.terminate();
                }
                catch (_a) { }
            }
        }
        userSockets.set(user.userId, ws);
        console.log(`User connected: ${user.email} (${user.userId}) remote=${remote} key=${wsKey} url=${req.url}`);
        ws.on('pong', () => {
            ws.isAlive = true;
        });
        ws.on('message', (message) => {
            ws.isAlive = true;
            try {
                const parsed = JSON.parse(message);
                if (parsed.type === 'PING') {
                    ws.send(JSON.stringify({ type: 'PONG' }));
                }
            }
            catch (error) {
                console.error('Invalid message format:', error);
            }
        });
        ws.on('close', () => {
            console.log(`User disconnected: ${user.email}`);
            // Remove mapping if this socket is the current one for the user
            const cur = userSockets.get(user.userId);
            if (cur === ws) {
                userSockets.delete(user.userId);
            }
        });
    });
    const interval = setInterval(() => {
        wss.clients.forEach((client) => {
            const extWs = client;
            if (extWs.isAlive === false)
                return extWs.terminate();
            extWs.isAlive = false;
            extWs.ping();
        });
    }, 30000);
    wss.on('close', () => {
        clearInterval(interval);
    });
};
exports.setupWebSocket = setupWebSocket;
const broadcast = (type, data) => {
    if (!wssInstance) {
        console.error('WebSocket server not initialized');
        return;
    }
    const payload = JSON.stringify({ type, data });
    let count = 0;
    wssInstance.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(payload);
            count++;
        }
    });
    console.log(`Broadcasted '${type}' to ${count} clients`);
};
exports.broadcast = broadcast;

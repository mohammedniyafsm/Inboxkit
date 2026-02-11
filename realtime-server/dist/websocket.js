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
        console.log(`User connected: ${user.email} (${user.userId})`);
        ws.on('pong', () => {
            ws.isAlive = true;
        });
        ws.on('message', (message) => {
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
        });
    });
    // PING/PONG heartbeat to keep connections alive and detect broken ones
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

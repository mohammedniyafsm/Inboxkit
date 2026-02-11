import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { verifyToken } from './auth';
import { DecodedUser, BroadcastMessage } from './types';
import url from 'url';

interface ExtendedWebSocket extends WebSocket {
    user?: DecodedUser;
    isAlive: boolean;
}

let wssInstance: WebSocketServer | null = null;
const userSockets: Map<string, ExtendedWebSocket> = new Map();

export const setupWebSocket = (wss: WebSocketServer) => {
    wssInstance = wss;
    wss.on('connection', (ws: ExtendedWebSocket, req: IncomingMessage) => {
        const query = url.parse(req.url || '', true).query;
        const token = query.token as string;

        if (!token) {
            console.log('No token provided, closing connection');
            ws.close(4001, 'Unauthorized: No token provided');
            return;
        }

        const user = verifyToken(token);

        if (!user) {
            console.log('Invalid token, closing connection');
            ws.close(4001, 'Unauthorized: Invalid token');
            return;
        }

        ws.user = user;
        ws.isAlive = true;

        // Diagnostic info: remote address and websocket key
        const remote = (req.socket && (req.socket as any).remoteAddress) || 'unknown-remote';
        const wsKey = req.headers['sec-websocket-key'] || 'no-key';

        // Ensure a single active connection per user. If an existing socket
        // exists for this user, close or terminate it and replace with the new one.
        const existing = userSockets.get(user.userId);
        if (existing) {
            console.log(`Replacing existing connection for ${user.email} (${user.userId}). remote=${remote} key=${wsKey}`);
            try {
                existing.close(1000, 'Replaced by new connection');
            } catch (e) {
                try {
                    existing.terminate();
                } catch {}
            }
        }

        userSockets.set(user.userId, ws);

        console.log(`User connected: ${user.email} (${user.userId}) remote=${remote} key=${wsKey} url=${req.url}`);

        ws.on('pong', () => {
            ws.isAlive = true;
        });

        ws.on('message', (message: string) => {
            ws.isAlive = true;
            try {
                const parsed = JSON.parse(message);
                if (parsed.type === 'PING') {
                    ws.send(JSON.stringify({ type: 'PONG' }));
                }
            } catch (error) {
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
            const extWs = client as ExtendedWebSocket;
            if (extWs.isAlive === false) return extWs.terminate();

            extWs.isAlive = false;
            extWs.ping();
        });
    }, 30000);

    wss.on('close', () => {
        clearInterval(interval);
    });
};

export const broadcast = (type: string, data: any) => {
    if (!wssInstance) {
        console.error('WebSocket server not initialized');
        return;
    }

    const payload = JSON.stringify({ type, data });
    let count = 0;

    wssInstance.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
            count++;
        }
    });

    console.log(`Broadcasted '${type}' to ${count} clients`);
};

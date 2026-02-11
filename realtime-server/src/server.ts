import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import cors from 'cors';
import { setupWebSocket } from './websocket';
import broadcastRoutes from './routes/broadcast.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/internal/broadcast', broadcastRoutes);

const server = createServer(app);

const wss = new WebSocketServer({ server });
setupWebSocket(wss);

server.listen(PORT, () => {
    console.log(`Real-time server running on port ${PORT}`);
});

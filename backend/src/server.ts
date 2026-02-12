import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './shared/config/database';
import authRoutes from './modules/auth/auth.routes';
import cardRoutes from './modules/card/card.routes';
import healthRoutes from './shared/utils/health.routes';
import { startExpiryChecker } from './shared/services/expiryChecker';

const app = express();
const PORT = process.env.PORT || 5000;

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

const corsOptions: cors.CorsOptions = {
    origin: frontendUrl,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/health', healthRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startExpiryChecker();
});

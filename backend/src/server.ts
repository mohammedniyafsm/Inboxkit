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

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/health', healthRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startExpiryChecker();
});

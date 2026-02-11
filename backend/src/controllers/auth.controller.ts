import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { success, error } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User.model';

export const register = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            error(res, 'Username, email, and password are required', 400);
            return;
        }

        const result = await registerUser({ username, email, password });

        success(res, result, 'User registered successfully', 201);
    } catch (err: any) {
        if (
            err.message.includes('Email already registered') ||
            err.message.includes('Username already taken') ||
            err.name === 'ValidationError'
        ) {
            error(res, err.message, 400);
        } else {
            console.error('Registration error:', err);
            error(res, err.message || 'Failed to register user', 500);
        }
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            error(res, 'Email and password are required', 400);
            return;
        }

        const result = await loginUser({ email, password });

        success(res, result, 'Login successful', 200);
    } catch (err: any) {
        if (err.message.includes('Invalid')) {
            error(res, err.message, 401);
        } else {
            console.error('Login error:', err);
            error(res, 'Failed to login', 500);
        }
    }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            error(res, 'Authentication required', 401);
            return;
        }

        const user = await User.findById(userId).select(
            '_id username email role totalPoints cooldownUntil'
        );

        if (!user) {
            error(res, 'User not found', 404);
            return;
        }

        success(res, user, 'User retrieved successfully', 200);
    } catch (err: any) {
        console.error('Get me error:', err);
        error(res, 'Failed to retrieve user', 500);
    }
};

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const topUsers = await User.find({})
            .sort({ totalPoints: -1 })
            .select('_id username totalPoints');

        success(res, topUsers, 'Leaderboard retrieved successfully', 200);
    } catch (err: any) {
        console.error('Leaderboard error:', err);
        error(res, 'Failed to fetch leaderboard', 500);
    }
};

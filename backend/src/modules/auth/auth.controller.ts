import { Request, Response } from 'express';
import * as authService from './auth.service';
import { success, error } from '../../shared/utils/response.util';

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            error(res, 'Username, email, and password are required', 400);
            return;
        }

        const result = await authService.register({ username, email, password });
        success(res, result, 'User registered successfully', 201);
    } catch (err: any) {
        if (err.message.includes('already')) {
            error(res, err.message, 400);
        } else {
            console.error('Signup error:', err);
            error(res, 'Failed to register user', 500);
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

        const result = await authService.login({ email, password });
        success(res, result, 'Login successful');
    } catch (err: any) {
        if (err.message.includes('Invalid')) {
            error(res, err.message, 401);
        } else {
            console.error('Login error:', err);
            error(res, 'Failed to login', 500);
        }
    }
};

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const leaderboard = await authService.getLeaderboard();
        success(res, leaderboard, 'Leaderboard fetched successfully');
    } catch (err: any) {
        console.error('Leaderboard error:', err);
        error(res, 'Failed to fetch leaderboard', 500);
    }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;
        const result = await authService.getMe(userId);
        success(res, result, 'User profile fetched successfully');
    } catch (err: any) {
        console.error('Get profile error:', err);
        error(res, 'Failed to fetch user profile', 500);
    }
};

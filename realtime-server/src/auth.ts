import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { DecodedUser } from './types';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export const verifyToken = (token: string): DecodedUser | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;
        return decoded;
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
};

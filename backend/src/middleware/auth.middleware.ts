import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';
import { error } from '../utils/response.util';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            error(res, 'No token provided. Authorization denied.', 401);
            return;
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            error(res, 'Invalid token format. Authorization denied.', 401);
            return;
        }

        const decoded = verifyToken(token);

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (err) {
        error(res, 'Token is invalid or expired. Authorization denied.', 401);
    }
};

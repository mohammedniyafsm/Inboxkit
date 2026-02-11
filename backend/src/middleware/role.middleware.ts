import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { error } from '../utils/response.util';

export const roleMiddleware = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                error(res, 'Authentication required', 401);
                return;
            }

            if (!allowedRoles.includes(req.user.role)) {
                error(
                    res,
                    'Access denied. You do not have permission to perform this action.',
                    403
                );
                return;
            }

            next();
        } catch (err) {
            error(res, 'Authorization error', 500);
        }
    };
};

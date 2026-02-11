import jwt from 'jsonwebtoken';

interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

export const generateToken = (payload: TokenPayload): string => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(payload, secret, {
        expiresIn: '7d',
    });
};

export const verifyToken = (token: string): TokenPayload => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    try {
        const decoded = jwt.verify(token, secret) as TokenPayload;
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

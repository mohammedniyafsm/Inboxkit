import * as userRepo from '../user/user.repository';
import { generateToken } from '../../shared/utils/jwt.util';

interface RegisterInput {
    username: string;
    email: string;
    password: string;
}

interface LoginInput {
    email: string;
    password: string;
}

interface AuthResponse {
    token: string;
    user: {
        id: string;
        username: string;
        email: string;
        role: string;
        totalPoints: number;
    };
}

export const register = async (data: RegisterInput): Promise<AuthResponse> => {
    const { username, email, password } = data;

    const existingUserByEmail = await userRepo.findByEmail(email);
    if (existingUserByEmail) throw new Error('Email already registered');

    const existingUserByUsername = await userRepo.findByUsername(username);
    if (existingUserByUsername) throw new Error('Username already taken');

    const user = await userRepo.create({
        username,
        email,
        password,
        role: 'user',
        totalPoints: 0,
    });

    const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    });

    return {
        token,
        user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            totalPoints: user.totalPoints,
        },
    };
};

export const login = async (data: LoginInput): Promise<AuthResponse> => {
    const { email, password } = data;

    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error('Invalid email or password');

    if (user.password !== password) {
        throw new Error('Invalid email or password');
    }

    const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    });

    return {
        token,
        user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            totalPoints: user.totalPoints,
        },
    };
};

export const getLeaderboard = async () => {
    return userRepo.getLeaderboard();
};

export const getMe = async (userId: string) => {
    const user = await userRepo.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
};

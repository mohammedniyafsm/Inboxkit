import User, { IUser } from '../models/User.model';
import { generateToken } from '../utils/jwt.util';

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

export const registerUser = async (
    data: RegisterInput
): Promise<AuthResponse> => {
    const { username, email, password } = data;

    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existingUser) {
        if (existingUser.email === email) {
            throw new Error('Email already registered');
        }
        if (existingUser.username === username) {
            throw new Error('Username already taken');
        }
    }

    const user = await User.create({
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

export const loginUser = async (data: LoginInput): Promise<AuthResponse> => {
    const { email, password } = data;

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Invalid email or password');
    }

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

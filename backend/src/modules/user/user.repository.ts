import User, { IUser } from '../../shared/models/User.model';

export const findById = async (id: string): Promise<IUser | null> => {
    return User.findById(id);
};

export const findByEmail = async (email: string): Promise<IUser | null> => {
    return User.findOne({ email });
};

export const findByUsername = async (username: string): Promise<IUser | null> => {
    return User.findOne({ username });
};

export const create = async (data: any): Promise<IUser> => {
    return User.create(data);
};

export const update = async (id: string, updates: any): Promise<IUser | null> => {
    return User.findByIdAndUpdate(id, updates, { new: true });
};

export const getLeaderboard = async (limit: number = 10): Promise<IUser[]> => {
    return User.find({}, 'username totalPoints')
        .sort({ totalPoints: -1 })
        .limit(limit);
};

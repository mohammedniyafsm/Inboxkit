export interface DecodedUser {
    userId: string;
    email: string;
    role: string;
}

export interface BroadcastMessage {
    type: string;
    data: any;
}

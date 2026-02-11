import axios from "axios";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface MeResponse {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  totalPoints: number;
  cooldownUntil: string | null;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getMe = async (token: string): Promise<MeResponse> => {
  const res = await api.get<ApiResponse<MeResponse>>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.data;
};

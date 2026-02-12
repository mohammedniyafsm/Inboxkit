import axios from "axios";
import { getApiBaseUrl } from "@/lib/env";

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

const API_BASE_URL = getApiBaseUrl();

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

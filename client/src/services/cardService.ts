import axios from "axios";
import type { Card } from "@/types/card";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getCards = async (token: string): Promise<Card[]> => {
  const res = await api.get<ApiResponse<Card[]>>("/cards", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.data;
};

export const claimCard = async (id: string, token: string): Promise<Card> => {
  const res = await api.post<ApiResponse<Card>>(
    `/cards/${id}/claim`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data.data;
};

export const getAllCards = async (): Promise<Card[]> => {
  // Try to get token if needed, or hit a public endpoint
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await api.get<ApiResponse<Card[]>>("/cards", { headers });
  return res.data.data;
};

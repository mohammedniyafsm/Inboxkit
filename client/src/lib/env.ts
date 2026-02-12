const DEFAULT_API_URL = "http://localhost:5000/api";
const DEFAULT_SOCKET_URL = "ws://localhost:3001";

export const getApiBaseUrl = (): string => {
  const raw = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).trim();

  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/+$/, "");
  }

  return `https://${raw}`.replace(/\/+$/, "");
};

export const getSocketBaseUrl = (): string => {
  const raw = (import.meta.env.VITE_SOCKET_URL || DEFAULT_SOCKET_URL).trim();

  if (/^wss?:\/\//i.test(raw)) {
    return raw.replace(/\/+$/, "");
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/^http/i, "ws").replace(/\/+$/, "");
  }

  return `wss://${raw}`.replace(/\/+$/, "");
};

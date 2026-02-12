const DEFAULT_API_URL = "http://localhost:5000/api";

export const getApiBaseUrl = (): string => {
  const raw = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).trim();

  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/+$/, "");
  }

  return `https://${raw}`.replace(/\/+$/, "");
};

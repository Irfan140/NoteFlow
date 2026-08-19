import axios from "axios";
import { getStoredTokens, setStoredTokens, clearStoredTokens } from "../state/auth";
import { env } from "./env";

const api = axios.create({
  baseURL: env.EXPO_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const tokens = await getStoredTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const tokens = await getStoredTokens();
      if (tokens?.refreshToken) {
        try {
          const res = await axios.post(`${env.EXPO_PUBLIC_API_URL}/auth/refresh`, {
            refreshToken: tokens.refreshToken,
          });

          const { accessToken, refreshToken } = res.data;
          await setStoredTokens({ accessToken, refreshToken });

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          await clearStoredTokens();
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
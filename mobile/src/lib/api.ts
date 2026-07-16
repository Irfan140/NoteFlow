import axios from "axios";
import { useAuth } from "@clerk/clerk-expo";
import { env } from "../config/env";

export const useApi = () => {
  const { getToken } = useAuth();

  const api = axios.create({
    baseURL: env.EXPO_PUBLIC_API_URL,
  });

  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  return api;
};

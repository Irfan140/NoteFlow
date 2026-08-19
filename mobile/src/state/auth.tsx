import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import axios from "axios";
import { env } from "../libs/env";

const TOKENS_KEY = "auth_tokens";
const USER_KEY = "auth_user";

interface User {
  id: string;
  email: string;
  name: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  tokens: Tokens | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const getStoredTokens = async (): Promise<Tokens | null> => {
  const raw = await SecureStore.getItemAsync(TOKENS_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const setStoredTokens = async (tokens: Tokens) => {
  await SecureStore.setItemAsync(TOKENS_KEY, JSON.stringify(tokens));
};

export const clearStoredTokens = async () => {
  await SecureStore.deleteItemAsync(TOKENS_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await getStoredTokens();
      const storedUser = await SecureStore.getItemAsync(USER_KEY);
      if (stored) setTokens(stored);
      if (storedUser) setUser(JSON.parse(storedUser));
      setIsLoaded(true);
    })();
  }, []);

  const saveAuth = useCallback(async (newTokens: Tokens, newUser: User) => {
    setTokens(newTokens);
    setUser(newUser);
    await setStoredTokens(newTokens);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser));
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await axios.post(`${env.EXPO_PUBLIC_API_URL}/auth/login`, { email, password });
      await saveAuth(
        { accessToken: res.data.accessToken, refreshToken: res.data.refreshToken },
        res.data.user,
      );
    },
    [saveAuth],
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const res = await axios.post(`${env.EXPO_PUBLIC_API_URL}/auth/register`, {
        email,
        password,
        name,
      });
      await saveAuth(
        { accessToken: res.data.accessToken, refreshToken: res.data.refreshToken },
        res.data.user,
      );
    },
    [saveAuth],
  );

  const signOut = useCallback(async () => {
    const stored = await getStoredTokens();
    if (stored?.refreshToken) {
      try {
        await axios.post(
          `${env.EXPO_PUBLIC_API_URL}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${stored.accessToken}` } },
        );
      } catch {
        // Ignore — clear locally regardless
      }
    }
    setTokens(null);
    setUser(null);
    await clearStoredTokens();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isLoaded,
        isSignedIn: !!tokens,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
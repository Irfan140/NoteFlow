import type { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import { logger } from "../libs/logger";

export const register = async (req: Request, res: Response) => {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.registerUser(input);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.issues[0]?.message ?? "Invalid input" });
    }
    logger.error({ err: error }, "Registration failed");
    res.status(409).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.loginUser(input);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.issues[0]?.message ?? "Invalid input" });
    }
    logger.error({ err: error }, "Login failed");
    res.status(401).json({ error: error.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }
    const result = await authService.refreshTokens(refreshToken);
    res.status(200).json(result);
  } catch (error: any) {
    logger.error({ err: error }, "Token refresh failed");
    res.status(401).json({ error: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    await authService.logoutUser(userId);
    res.status(200).json({ message: "Logged out" });
  } catch (error: any) {
    logger.error({ err: error }, "Logout failed");
    res.status(500).json({ error: error.message });
  }
};

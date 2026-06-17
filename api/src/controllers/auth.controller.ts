import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { error } from "console";

export const register = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body?.name || !body?.email || !body?.password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    res.cookie("refreshToken", result.rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ token: result.token, user: result.user });
  } catch (err) {
    res
      .status(400)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body?.email || !body?.password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const { email, password } = body;
    const result = await authService.login(email, password);
    res.cookie("refreshToken", result.rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ token: result.token, user: result.user });
  } catch (err) {
    res
      .status(400)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const result = await authService.refreshToken(refreshToken);
    return res.status(200).json({ token: result.token });
  } catch (err) {
    return res
      .status(401)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const result = await authService.logout(refreshToken);
    res.clearCookie("refreshToken");
    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(401)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    if (!token) return res.status(400).json({ error: "Token is required" });
    const result = await authService.verifyEmail(token);
    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(401)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const email = body.email;
    if (!body || !email) throw new Error("Email is required");
    await authService.forgotPassword(email);
    res
      .status(200)
      .json({ message: "If that email exists, a reset link has been sent" });
  } catch (err) {
    return res
      .status(401)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const token = body.token;
    const newPassword = body.newPassword;
    if (!body || !token || !newPassword)
      throw new Error("Token and new password is required");
    const result = await authService.resetPassword(token, newPassword);
    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(401)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};

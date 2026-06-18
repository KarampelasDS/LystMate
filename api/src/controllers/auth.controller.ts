import { Request, Response } from "express";
import * as authService from "../services/auth.service";

const SAFE_ERRORS = new Set([
  "Invalid Credentials",
  "Invalid or expired token",
  "Authorization Error",
  "Email is required",
  "Token and new password is required",
  "Email not verified",
]);

const handleError = (err: unknown, res: Response) => {
  const message = err instanceof Error ? err.message : null;
  if (message && SAFE_ERRORS.has(message)) {
    return res.status(400).json({ error: message });
  }
  return res.status(500).json({ error: "Internal server error" });
};

export const register = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body?.name || !body?.email || !body?.password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }
    const { name, email, password } = req.body;
    if (name.length > 100) {
      return res
        .status(400)
        .json({ error: "Name must be 100 characters or less" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }
    if (password.length > 128) {
      return res
        .status(400)
        .json({ error: "Password must be 128 characters or less" });
    }
    const result = await authService.register(name, email, password);
    res.status(201).json({ message: "Registration successful. Please check your email to verify your account.", user: result.user });
  } catch (err) {
    handleError(err, res);
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
    handleError(err, res);
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "Authorization Error" });
    const result = await authService.refreshToken(refreshToken);
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ token: result.token });
  } catch (err) {
    return handleError(err, res);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "Authorization Error" });
    const result = await authService.logout(refreshToken);
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json(result);
  } catch (err) {
    return handleError(err, res);
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    if (!token) return res.status(400).json({ error: "Token is required" });
    const result = await authService.verifyEmail(token);
    return res.status(200).json(result);
  } catch (err) {
    return handleError(err, res);
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
    return handleError(err, res);
  }
};

export const logoutAll = async (req: Request, res: Response) => {
  try {
    const result = await authService.revokeAllSessions(req.userId!);
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json(result);
  } catch (err) {
    return handleError(err, res);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const token = body.token;
    const newPassword = body.newPassword;
    if (!body || !token || !newPassword)
      throw new Error("Token and new password is required");
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }
    if (newPassword.length > 128) {
      return res
        .status(400)
        .json({ error: "Password must be 128 characters or less" });
    }
    const result = await authService.resetPassword(token, newPassword);
    return res.status(200).json(result);
  } catch (err) {
    return handleError(err, res);
  }
};

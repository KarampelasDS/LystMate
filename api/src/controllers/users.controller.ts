import { Request, Response } from "express";
import * as userService from "../services/users.service";
import * as authService from "../services/auth.service";

const SAFE_ERRORS = new Set(["No data to update"]);

const handleError = (err: unknown, res: Response) => {
  const message = err instanceof Error ? err.message : null;
  if (message && SAFE_ERRORS.has(message)) {
    return res.status(400).json({ error: message });
  }
  return res.status(500).json({ error: "Internal server error" });
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "No data to update" });
    }
    if (name.length > 100) {
      return res.status(400).json({ error: "Name must be 100 characters or less" });
    }
    const result = await userService.updateUser(userId as string, name);
    res.status(200).json({ message: "User updated successfully", user: result });
  } catch (err) {
    handleError(err, res);
  }
};

export const requestEmailChange = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    await authService.requestEmailChange(userId as string, email);
    res.status(200).json({ message: "Verification email sent to your new address" });
  } catch (err) {
    handleError(err, res);
  }
};

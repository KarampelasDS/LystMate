import { Request, Response } from "express";
import * as userService from "../services/users.service";

const SAFE_ERRORS = new Set(["Email already in use", "No data to update"]);

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
    const { name, email } = req.body;
    if (name && name.length > 100) {
      return res.status(400).json({ error: "Name must be 100 characters or less" });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    const result = await userService.updateUser(userId as string, name, email);
    res
      .status(200)
      .json({ message: "User updated successfully", user: result });
  } catch (err) {
    handleError(err, res);
  }
};

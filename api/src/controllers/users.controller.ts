import { Request, Response } from "express";
import * as userService from "../services/users.service";

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { name, email } = req.body;
    const result = await userService.updateUser(userId as string, name, email);
    res
      .status(200)
      .json({ message: "User updated successfully", user: result });
  } catch (err) {
    res
      .status(400)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};

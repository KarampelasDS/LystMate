import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization Error" });
  }
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization Error" });
  }
  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "Server configuration error" });
  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Authorization Error" });
  }
};

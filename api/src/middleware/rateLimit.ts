import rateLimit from "express-rate-limit";
import { Request } from "express";

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, //1 Minute
  max: 100, // Limit each IP to 100 requests per `window` (here, per minute)
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 Minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const inviteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 invites per minute per user
  keyGenerator: (req: Request) => req.userId ?? req.ip ?? "unknown",
  message: { error: "Too many invites sent, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

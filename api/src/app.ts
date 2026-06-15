import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import listsRoutes from "./routes/lists";
import itemsRoutes from "./routes/items";
import invitesRoutes from "./routes/invites";
import usersRoutes from "./routes/users";
import { globalLimiter } from "./middleware/rateLimit";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);

app.use("/auth", authRoutes);
app.use("/lists", listsRoutes);
app.use("/lists/:listId/items", itemsRoutes);
app.use("/invites", invitesRoutes);
app.use("/users", usersRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: "Internal server error" });
});

export default app;

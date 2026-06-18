import { Router } from "express";
import * as usersController from "../controllers/users.controller";
import { authLimiter } from "../middleware/rateLimit";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.patch("/me", authLimiter, usersController.updateUser);
router.post("/me/email", authLimiter, usersController.requestEmailChange);

export default router;

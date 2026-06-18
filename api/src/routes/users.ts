import { Router } from "express";
import * as usersController from "../controllers/users.controller";
import { userLimiter } from "../middleware/rateLimit";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.patch("/me", userLimiter, usersController.updateUser);
router.post("/me/email", userLimiter, usersController.requestEmailChange);

export default router;

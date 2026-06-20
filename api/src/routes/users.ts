import { Router } from "express";
import * as usersController from "../controllers/users.controller";
import { userLimiter } from "../middleware/rateLimit";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/me", usersController.getMe);
router.patch("/me", userLimiter, usersController.updateUser);
router.post("/me/email", userLimiter, usersController.requestEmailChange);
router.post("/me/password", userLimiter, usersController.changePassword);
router.delete("/me", userLimiter, usersController.deleteAccount);

export default router;

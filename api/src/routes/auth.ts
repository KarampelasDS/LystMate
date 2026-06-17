import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/refresh", authLimiter, authController.refresh);
router.post("/logout", authLimiter, authController.logout);
router.get("/verify-email", authLimiter, authController.verifyEmail);
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password", authLimiter, authController.resetPassword);

export default router;

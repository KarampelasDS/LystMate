import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authLimiter } from "../middleware/rateLimit";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/refresh", authLimiter, authController.refresh);
router.post("/logout", authLimiter, authController.logout);
router.delete("/sessions", authenticate, authController.logoutAll);
router.get("/verify-email", authLimiter, authController.verifyEmail);
router.post("/resend-verification", authLimiter, authController.resendVerification);
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password", authLimiter, authController.resetPassword);

export default router;

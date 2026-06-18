import { Router } from "express";
import * as invitesController from "../controllers/invites.controller";
import { authenticate } from "../middleware/auth";
import { inviteLimiter } from "../middleware/rateLimit";

const router = Router();

router.use(authenticate);

router.post("/", inviteLimiter, invitesController.sendInvite);
router.patch("/:id", inviteLimiter, invitesController.respondToInvite);
router.delete("/:id", inviteLimiter, invitesController.cancelInvite);
router.get("/", invitesController.getInvites);

export default router;

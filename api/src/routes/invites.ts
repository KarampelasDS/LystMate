import { Router } from "express";
import * as invitesController from "../controllers/invites.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/", invitesController.sendInvite);
router.patch("/:id", invitesController.respondToInvite);
router.delete("/:id", invitesController.cancelInvite);
router.get("/", invitesController.getInvites);

export default router;

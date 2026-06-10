import { Router } from "express";
import * as listsController from "../controllers/lists.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/", listsController.createList);
router.get("/", listsController.getLists);
router.get("/:id", listsController.getList);
router.delete("/:id", listsController.deleteList);
router.patch("/:id/rename", listsController.renameList);
router.patch("/:id/visibility", listsController.changeListVisibility);
router.delete("/:id/leave", listsController.leaveList);
router.post("/:id/transfer", listsController.transferOwnership);
router.delete("/:id/members/:memberId", listsController.removeMember);
router.patch("/:id/members/:memberId", listsController.updateMember);

export default router;

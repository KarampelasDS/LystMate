import { Request, Response } from "express";
import * as invitesService from "../services/invites.service";

export const sendInvite = async (req: Request, res: Response) => {
  try {
    const { listId, inviteeEmail, role = "VIEWER" } = req.body;
    if (!listId || !inviteeEmail) {
      return res.status(400).json({
        error: "List ID and invitee email are required",
      });
    }
    const inviterId = req.userId as string;
    const result = await invitesService.sendInvite(
      listId,
      inviterId,
      inviteeEmail,
      role,
    );
    res.status(201).json(result);
  } catch (err) {
    res
      .status(400)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};

export const respondToInvite = async (req: Request, res: Response) => {
  try {
    const { response } = req.body;
    const inviteId = req.params.id as string;
    if (!inviteId || !response) {
      return res.status(400).json({
        error: "Invite ID and response are required",
      });
    }
    if (response !== "ACCEPTED" && response !== "REJECTED") {
      return res
        .status(400)
        .json({ error: "Response must be ACCEPTED or REJECTED" });
    }
    const userId = req.userId as string;
    const result = await invitesService.respondToInvite(
      inviteId,
      userId,
      response,
    );
    res.status(200).json(result);
  } catch (err) {
    res
      .status(400)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};

export const cancelInvite = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    await invitesService.cancelInvite(req.params.id as string, userId);
    res.status(204).send();
  } catch (err) {
    res
      .status(400)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};

export const getInvites = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const result = await invitesService.getInvites(userId, page, limit);
    res.status(200).json(result);
  } catch (err) {
    res
      .status(400)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};

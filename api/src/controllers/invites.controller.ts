import { Request, Response } from "express";
import * as invitesService from "../services/invites.service";

const handleError = (error: unknown, res: Response) => {
  if (error instanceof Error && error.message === "Forbidden") {
    return res.status(403).json({ error: "Forbidden" });
  }
  if (
    error instanceof Error &&
    (error.message === "Invite already sent" ||
      error.message === "Invite already responded to" ||
      error.message === "User is already a member of this list" ||
      error.message === "Invite could not be sent")
  ) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(500).json({ error: "Internal server error" });
};

export const sendInvite = async (req: Request, res: Response) => {
  try {
    const { listId, inviteeEmail, role = "VIEWER" } = req.body;
    if (!listId || !inviteeEmail) {
      return res.status(400).json({
        error: "List ID and invitee email are required",
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteeEmail) || inviteeEmail.length > 254) {
      return res.status(400).json({ error: "Invalid email" });
    }
    if (role !== "VIEWER" && role !== "MEMBER") {
      return res.status(400).json({ error: "Role must be VIEWER or MEMBER" });
    }
    const result = await invitesService.sendInvite(
      listId,
      req.userId!,
      inviteeEmail,
      role,
    );
    res.status(201).json(result);
  } catch (err) {
    handleError(err, res);
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
    const result = await invitesService.respondToInvite(
      inviteId,
      req.userId!,
      response,
    );
    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const cancelInvite = async (req: Request, res: Response) => {
  try {
    await invitesService.cancelInvite(req.params.id as string, req.userId!);
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
};

export const getInvites = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const result = await invitesService.getInvites(req.userId!, page, limit);
    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

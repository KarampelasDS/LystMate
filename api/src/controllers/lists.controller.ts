import { Request, Response } from "express";
import * as listsService from "../services/lists.service";

const SAFE_ERRORS = new Set([
  "You must transfer ownership before leaving",
  "Cannot remove yourself, use leave list",
  "You are already the owner",
  "Cannot change your own role",
]);

const handleError = (error: unknown, res: Response) => {
  if (error instanceof Error && error.message === "Forbidden") {
    return res.status(403).json({ error: "Forbidden" });
  }
  if (error instanceof Error && SAFE_ERRORS.has(error.message)) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(500).json({ error: "Internal server error" });
};

export const createList = async (req: Request, res: Response) => {
  try {
    const { name, visibility = "PRIVATE" } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (name.length > 100) {
      return res.status(400).json({ error: "Name must be 100 characters or less" });
    }
    if (visibility !== "PUBLIC" && visibility !== "PRIVATE") {
      return res
        .status(400)
        .json({ error: "Visibility must be PUBLIC or PRIVATE" });
    }
    const newList = await listsService.createList(
      req.userId!,
      name,
      visibility,
    );
    res.status(201).json(newList);
  } catch (error) {
    handleError(error, res);
  }
};

export const getLists = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const lists = await listsService.getLists(req.userId!, page, limit);
    res.json(lists);
  } catch (error) {
    handleError(error, res);
  }
};

export const getList = async (req: Request, res: Response) => {
  try {
    const list = await listsService.getList(
      req.params.id as string,
      req.userId!,
    );
    if (!list) return res.status(403).json({ error: "Forbidden" });
    res.json(list);
  } catch (error) {
    handleError(error, res);
  }
};

export const getMembers = async (req: Request, res: Response) => {
  try {
    const members = await listsService.getMembers(
      req.params.id as string,
      req.userId!,
    );
    res.json(members);
  } catch (error) {
    handleError(error, res);
  }
};

export const deleteList = async (req: Request, res: Response) => {
  try {
    await listsService.deleteList(req.params.id as string, req.userId!);
    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
};

export const renameList = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (name.length > 100) {
      return res.status(400).json({ error: "Name must be 100 characters or less" });
    }
    const updatedList = await listsService.renameList(
      req.params.id as string,
      name,
      req.userId!,
    );
    res.json(updatedList);
  } catch (error) {
    handleError(error, res);
  }
};

export const changeListVisibility = async (req: Request, res: Response) => {
  try {
    const { visibility } = req.body;
    if (!visibility) {
      return res.status(400).json({ error: "Visibility is required" });
    }
    if (visibility !== "PUBLIC" && visibility !== "PRIVATE") {
      return res
        .status(400)
        .json({ error: "Visibility must be PUBLIC or PRIVATE" });
    }
    const list = await listsService.changeListVisibility(
      req.params.id as string,
      visibility,
      req.userId!,
    );
    res.json(list);
  } catch (error) {
    handleError(error, res);
  }
};

export const leaveList = async (req: Request, res: Response) => {
  try {
    await listsService.leaveList(req.params.id as string, req.userId!);
    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    await listsService.removeMember(
      req.params.id as string,
      req.params.memberId as string,
      req.userId!,
    );
    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
};

export const transferOwnership = async (req: Request, res: Response) => {
  try {
    const { newOwnerId } = req.body;
    if (!newOwnerId) {
      return res.status(400).json({ error: "New owner ID is required" });
    }
    await listsService.transferOwnership(
      req.params.id as string,
      newOwnerId,
      req.userId!,
    );
    res.status(200).json({ success: true });
  } catch (error) {
    handleError(error, res);
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }
    if (role !== "MEMBER" && role !== "VIEWER") {
      return res.status(400).json({ error: "Role must be MEMBER or VIEWER" });
    }
    const member = await listsService.updateMember(
      req.params.id as string,
      req.params.memberId as string,
      role,
      req.userId!,
    );
    res.json(member);
  } catch (error) {
    handleError(error, res);
  }
};

import { Request, Response } from "express";
import * as itemsService from "../services/items.service";

const handleError = (error: unknown, res: Response) => {
  if (error instanceof Error && error.message === "Forbidden") {
    return res.status(403).json({ error: "Forbidden" });
  }
  return res.status(500).json({ error: "Internal server error" });
};

export const createItem = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params as Record<string, string>;
    const { name, url, quantity = 1 } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    if (name.length > 255) return res.status(400).json({ error: "Name must be 255 characters or less" });
    if (url) {
      try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
      } catch {
        return res.status(400).json({ error: "URL must be a valid http or https URL" });
      }
    }
    if (url && url.length > 2048) return res.status(400).json({ error: "URL must be 2048 characters or less" });
    if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ error: "Quantity must be a positive integer" });
    const item = await itemsService.createItem(
      listId,
      req.userId!,
      name,
      url,
      quantity,
    );
    res.status(201).json(item);
  } catch (error) {
    handleError(error, res);
  }
};

export const getItems = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params as Record<string, string>;
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const items = await itemsService.getItems(listId, req.userId!, page, limit);
    res.status(200).json(items);
  } catch (error) {
    handleError(error, res);
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const { listId, itemId } = req.params as Record<string, string>;
    const { name, url, quantity, checked } = req.body;
    if (!name && !url && !quantity && checked === undefined)
      return res.status(400).json({ error: "Nothing to update" });
    if (name && name.length > 255) return res.status(400).json({ error: "Name must be 255 characters or less" });
    if (url) {
      try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
      } catch {
        return res.status(400).json({ error: "URL must be a valid http or https URL" });
      }
    }
    if (url && url.length > 2048) return res.status(400).json({ error: "URL must be 2048 characters or less" });
    if (quantity !== undefined && (!Number.isInteger(quantity) || quantity < 1)) return res.status(400).json({ error: "Quantity must be a positive integer" });
    const item = await itemsService.updateItem(
      listId,
      itemId,
      req.userId!,
      name,
      url,
      quantity,
      checked,
    );
    res.status(200).json(item);
  } catch (error) {
    handleError(error, res);
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { listId, itemId } = req.params as Record<string, string>;
    await itemsService.deleteItem(listId, itemId, req.userId!);
    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
};

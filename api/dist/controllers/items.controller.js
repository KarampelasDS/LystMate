"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.updateItem = exports.getItems = exports.createItem = void 0;
const itemsService = __importStar(require("../services/items.service"));
const handleError = (error, res) => {
    if (error instanceof Error && error.message === "Forbidden") {
        return res.status(403).json({ error: "Forbidden" });
    }
    return res.status(500).json({ error: "Internal server error" });
};
const createItem = async (req, res) => {
    try {
        const { listId } = req.params;
        const { name, url, quantity = 1 } = req.body;
        if (!name)
            return res.status(400).json({ error: "Name is required" });
        const item = await itemsService.createItem(listId, req.userId, name, url, quantity);
        res.status(201).json(item);
    }
    catch (error) {
        handleError(error, res);
    }
};
exports.createItem = createItem;
const getItems = async (req, res) => {
    try {
        const { listId } = req.params;
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const items = await itemsService.getItems(listId, req.userId, page, limit);
        res.status(200).json(items);
    }
    catch (error) {
        handleError(error, res);
    }
};
exports.getItems = getItems;
const updateItem = async (req, res) => {
    try {
        const { listId, itemId } = req.params;
        const { name, url, quantity, checked } = req.body;
        if (!name && !url && !quantity && checked === undefined)
            return res.status(400).json({ error: "Nothing to update" });
        const item = await itemsService.updateItem(listId, itemId, req.userId, name, url, quantity, checked);
        res.status(200).json(item);
    }
    catch (error) {
        handleError(error, res);
    }
};
exports.updateItem = updateItem;
const deleteItem = async (req, res) => {
    try {
        const { listId, itemId } = req.params;
        await itemsService.deleteItem(listId, itemId, req.userId);
        res.status(204).send();
    }
    catch (error) {
        handleError(error, res);
    }
};
exports.deleteItem = deleteItem;
//# sourceMappingURL=items.controller.js.map
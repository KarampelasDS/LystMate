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
exports.updateMember = exports.transferOwnership = exports.removeMember = exports.leaveList = exports.changeListVisibility = exports.renameList = exports.deleteList = exports.getMembers = exports.getList = exports.getLists = exports.createList = void 0;
const listsService = __importStar(require("../services/lists.service"));
const SAFE_ERRORS = new Set([
    "You must transfer ownership before leaving",
    "Cannot remove yourself, use leave list",
    "You are already the owner",
    "Cannot change your own role",
]);
const handleError = (error, res) => {
    if (error instanceof Error && error.message === "Forbidden") {
        return res.status(403).json({ error: "Forbidden" });
    }
    if (error instanceof Error && SAFE_ERRORS.has(error.message)) {
        return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
};
const createList = async (req, res) => {
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
        const newList = await listsService.createList(req.userId, name, visibility);
        res.status(201).json(newList);
    }
    catch (error) {
        handleError(error, res);
    }
};
exports.createList = createList;
const getLists = async (req, res) => {
    try {
        const page = Math.min(Math.max(parseInt(req.query.page) || 1, 1), 1000);
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const lists = await listsService.getLists(req.userId, page, limit);
        res.json(lists);
    }
    catch (error) {
        handleError(error, res);
    }
};
exports.getLists = getLists;
const getList = async (req, res) => {
    try {
        const list = await listsService.getList(req.params.id, req.userId);
        if (!list)
            return res.status(404).json({ error: "Not found" });
        res.json(list);
    }
    catch (error) {
        handleError(error, res);
    }
};
exports.getList = getList;
const getMembers = async (req, res) => {
    try {
        const page = Math.min(Math.max(parseInt(req.query.page) || 1, 1), 1000);
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const members = await listsService.getMembers(req.params.id, req.userId, page, limit);
        res.json(members);
    }
    catch (error) {
        handleError(error, res);
    }
};
exports.getMembers = getMembers;
const deleteList = async (req, res) => {
    try {
        await listsService.deleteList(req.params.id, req.userId);
        res.status(204).send();
    }
    catch (error) {
        handleError(error, res);
    }
};
exports.deleteList = deleteList;
const renameList = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }
        if (name.length > 100) {
            return res.status(400).json({ error: "Name must be 100 characters or less" });
        }
        const updatedList = await listsService.renameList(req.params.id, name, req.userId);
        res.json(updatedList);
    }
    catch (error) {
        handleError(error, res);
    }
};
exports.renameList = renameList;
const changeListVisibility = async (req, res) => {
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
        const list = await listsService.changeListVisibility(req.params.id, visibility, req.userId);
        res.json(list);
    }
    catch (error) {
        handleError(error, res);
    }
};
exports.changeListVisibility = changeListVisibility;
const leaveList = async (req, res) => {
    try {
        await listsService.leaveList(req.params.id, req.userId);
        res.status(204).send();
    }
    catch (error) {
        handleError(error, res);
    }
};
exports.leaveList = leaveList;
const removeMember = async (req, res) => {
    try {
        await listsService.removeMember(req.params.id, req.params.memberId, req.userId);
        res.status(204).send();
    }
    catch (error) {
        handleError(error, res);
    }
};
exports.removeMember = removeMember;
const transferOwnership = async (req, res) => {
    try {
        const { newOwnerId } = req.body;
        if (!newOwnerId) {
            return res.status(400).json({ error: "New owner ID is required" });
        }
        await listsService.transferOwnership(req.params.id, newOwnerId, req.userId);
        res.status(200).json({ success: true });
    }
    catch (error) {
        handleError(error, res);
    }
};
exports.transferOwnership = transferOwnership;
const updateMember = async (req, res) => {
    try {
        const { role } = req.body;
        if (!role) {
            return res.status(400).json({ error: "Role is required" });
        }
        if (role !== "MEMBER" && role !== "VIEWER") {
            return res.status(400).json({ error: "Role must be MEMBER or VIEWER" });
        }
        const member = await listsService.updateMember(req.params.id, req.params.memberId, role, req.userId);
        res.json(member);
    }
    catch (error) {
        handleError(error, res);
    }
};
exports.updateMember = updateMember;
//# sourceMappingURL=lists.controller.js.map
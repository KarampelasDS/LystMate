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
exports.getInvites = exports.cancelInvite = exports.respondToInvite = exports.sendInvite = void 0;
const invitesService = __importStar(require("../services/invites.service"));
const handleError = (error, res) => {
    if (error instanceof Error && error.message === "Forbidden") {
        return res.status(403).json({ error: "Forbidden" });
    }
    if (error instanceof Error &&
        (error.message === "Invite already sent" ||
            error.message === "Invite already responded to" ||
            error.message === "User is already a member of this list")) {
        return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
};
const sendInvite = async (req, res) => {
    try {
        const { listId, inviteeEmail, role = "VIEWER" } = req.body;
        if (!listId || !inviteeEmail) {
            return res.status(400).json({
                error: "List ID and invitee email are required",
            });
        }
        if (role !== "VIEWER" && role !== "MEMBER") {
            return res.status(400).json({ error: "Role must be VIEWER or MEMBER" });
        }
        const result = await invitesService.sendInvite(listId, req.userId, inviteeEmail, role);
        res.status(201).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.sendInvite = sendInvite;
const respondToInvite = async (req, res) => {
    try {
        const { response } = req.body;
        const inviteId = req.params.id;
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
        const result = await invitesService.respondToInvite(inviteId, req.userId, response);
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.respondToInvite = respondToInvite;
const cancelInvite = async (req, res) => {
    try {
        await invitesService.cancelInvite(req.params.id, req.userId);
        res.status(204).send();
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.cancelInvite = cancelInvite;
const getInvites = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const result = await invitesService.getInvites(req.userId, page, limit);
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getInvites = getInvites;
//# sourceMappingURL=invites.controller.js.map
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
exports.requestEmailChange = exports.updateUser = exports.getMe = void 0;
const userService = __importStar(require("../services/users.service"));
const authService = __importStar(require("../services/auth.service"));
const SAFE_ERRORS = new Set(["No data to update"]);
const handleError = (err, res) => {
    const message = err instanceof Error ? err.message : null;
    if (message && SAFE_ERRORS.has(message)) {
        return res.status(400).json({ error: message });
    }
    return res.status(500).json({ error: "Internal server error" });
};
const getMe = async (req, res) => {
    try {
        const user = await userService.getMe(req.userId);
        res.json(user);
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getMe = getMe;
const updateUser = async (req, res) => {
    try {
        const userId = req.userId;
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "No data to update" });
        }
        if (name.length > 100) {
            return res.status(400).json({ error: "Name must be 100 characters or less" });
        }
        const result = await userService.updateUser(userId, name);
        res.status(200).json({ message: "User updated successfully", user: result });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updateUser = updateUser;
const requestEmailChange = async (req, res) => {
    try {
        const userId = req.userId;
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        await authService.requestEmailChange(userId, email);
        res.status(200).json({ message: "Verification email sent to your new address" });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.requestEmailChange = requestEmailChange;
//# sourceMappingURL=users.controller.js.map
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
exports.logout = exports.refresh = exports.login = exports.register = void 0;
const authService = __importStar(require("../services/auth.service"));
const register = async (req, res) => {
    try {
        const body = req.body;
        if (!body?.name || !body?.email || !body?.password) {
            return res
                .status(400)
                .json({ error: "Name, email and password are required" });
        }
        const { name, email, password } = req.body;
        const result = await authService.register(name, email, password);
        res.cookie("refreshToken", result.rawRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({ token: result.token, user: result.user });
    }
    catch (err) {
        res
            .status(400)
            .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const body = req.body;
        if (!body?.email || !body?.password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const { email, password } = body;
        const result = await authService.login(email, password);
        res.cookie("refreshToken", result.rawRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ token: result.token, user: result.user });
    }
    catch (err) {
        res
            .status(400)
            .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const result = await authService.refreshToken(refreshToken);
        return res.status(200).json({ token: result.token });
    }
    catch (err) {
        return res
            .status(401)
            .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const result = await authService.logout(refreshToken);
        res.clearCookie("refreshToken");
        return res.status(200).json(result);
    }
    catch (err) {
        return res
            .status(401)
            .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
};
exports.logout = logout;
//# sourceMappingURL=auth.controller.js.map
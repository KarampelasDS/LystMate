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
exports.resetPassword = exports.logoutAll = exports.forgotPassword = exports.resendVerification = exports.verifyEmail = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const authService = __importStar(require("../services/auth.service"));
const SAFE_ERRORS = new Set([
    "Invalid Credentials",
    "Invalid or expired token",
    "Email is required",
    "Token and new password is required",
    "Email not verified",
]);
const handleError = (err, res) => {
    const message = err instanceof Error ? err.message : null;
    if (message === "Authorization Error") {
        return res.status(401).json({ error: message });
    }
    if (message && SAFE_ERRORS.has(message)) {
        return res.status(400).json({ error: message });
    }
    return res.status(500).json({ error: "Internal server error" });
};
const register = async (req, res) => {
    try {
        const body = req.body;
        if (!body?.name || !body?.email || !body?.password) {
            return res
                .status(400)
                .json({ error: "Name, email and password are required" });
        }
        const { name, email, password } = req.body;
        if (name.length > 100) {
            return res
                .status(400)
                .json({ error: "Name must be 100 characters or less" });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        if (password.length < 8) {
            return res
                .status(400)
                .json({ error: "Password must be at least 8 characters" });
        }
        if (password.length > 128) {
            return res
                .status(400)
                .json({ error: "Password must be 128 characters or less" });
        }
        const result = await authService.register(name, email, password);
        res.status(201).json({ message: "Registration successful. Please check your email to verify your account.", user: result.user });
    }
    catch (err) {
        handleError(err, res);
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
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ token: result.token, user: result.user });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken)
            return res.status(401).json({ error: "Authorization Error" });
        const result = await authService.refreshToken(refreshToken);
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({ token: result.token });
    }
    catch (err) {
        return handleError(err, res);
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken)
            return res.status(401).json({ error: "Authorization Error" });
        const result = await authService.logout(refreshToken);
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        return res.status(200).json(result);
    }
    catch (err) {
        return handleError(err, res);
    }
};
exports.logout = logout;
const verifyEmail = async (req, res) => {
    try {
        const token = req.query.token;
        if (!token || token.length > 128)
            return res.status(400).json({ error: "Token is required" });
        const result = await authService.verifyEmail(token);
        return res.status(200).json(result);
    }
    catch (err) {
        return handleError(err, res);
    }
};
exports.verifyEmail = verifyEmail;
const resendVerification = async (req, res) => {
    try {
        const email = req.body?.email;
        if (!email)
            return res.status(400).json({ error: "Email is required" });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
            return res.status(400).json({ error: "Invalid email format" });
        await authService.resendVerification(email);
        return res.status(200).json({ message: "If that email exists and is unverified, a new link has been sent" });
    }
    catch (err) {
        return handleError(err, res);
    }
};
exports.resendVerification = resendVerification;
const forgotPassword = async (req, res) => {
    try {
        const body = req.body;
        const email = body.email;
        if (!body || !email)
            throw new Error("Email is required");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
            return res.status(400).json({ error: "Invalid email format" });
        await authService.forgotPassword(email);
        res
            .status(200)
            .json({ message: "If that email exists, a reset link has been sent" });
    }
    catch (err) {
        return handleError(err, res);
    }
};
exports.forgotPassword = forgotPassword;
const logoutAll = async (req, res) => {
    try {
        const result = await authService.revokeAllSessions(req.userId);
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        return res.status(200).json(result);
    }
    catch (err) {
        return handleError(err, res);
    }
};
exports.logoutAll = logoutAll;
const resetPassword = async (req, res) => {
    try {
        const body = req.body;
        const token = body.token;
        const newPassword = body.newPassword;
        if (!body || !token || !newPassword)
            throw new Error("Token and new password is required");
        if (token.length > 128)
            return res.status(400).json({ error: "Invalid or expired token" });
        if (newPassword.length < 8) {
            return res
                .status(400)
                .json({ error: "Password must be at least 8 characters" });
        }
        if (newPassword.length > 128) {
            return res
                .status(400)
                .json({ error: "Password must be 128 characters or less" });
        }
        const result = await authService.resetPassword(token, newPassword);
        return res.status(200).json(result);
    }
    catch (err) {
        return handleError(err, res);
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.controller.js.map
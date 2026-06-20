"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.resendVerification = exports.requestEmailChange = exports.verifyEmail = exports.revokeAllSessions = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const email_service_1 = require("./email.service");
const email_templates_1 = require("./email-templates");
const escapeHtml = (str) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters long");
}
const register = async (name, email, password) => {
    const hashed = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma_1.default.$transaction(async (tx) => {
        const existing = await tx.user.findUnique({ where: { email } });
        if (existing) {
            if (existing.emailVerified)
                throw new Error("Invalid Credentials");
            try {
                await tx.user.delete({ where: { id: existing.id } });
            }
            catch {
                // concurrent re-registration already deleted the record; proceed
            }
        }
        return tx.user.create({
            data: { name, email, password: hashed },
        });
    });
    const rawVerificationToken = crypto_1.default.randomBytes(32).toString("hex");
    const hashedVerificationToken = crypto_1.default
        .createHash("sha256")
        .update(rawVerificationToken)
        .digest("hex");
    await prisma_1.default.emailVerificationToken.create({
        data: {
            token: hashedVerificationToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
    });
    (0, email_service_1.sendEmail)(email, "Welcome to LystMate", (0, email_templates_1.welcomeEmail)(escapeHtml(name), rawVerificationToken))
        .catch((error) => console.error("Error sending welcome email:", error));
    return {
        user: { id: user.id, name: user.name, email: user.email },
    };
};
exports.register = register;
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
const login = async (email, password) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    const matches = await bcryptjs_1.default.compare(password, user?.password ?? DUMMY_HASH);
    if (!user || !matches)
        throw new Error("Invalid Credentials");
    if (!user.emailVerified)
        throw new Error("Email not verified");
    await prisma_1.default.refreshToken.deleteMany({
        where: { userId: user.id, expiresAt: { lt: new Date() } },
    });
    const activeSessions = await prisma_1.default.refreshToken.findMany({
        where: { userId: user.id, revoked: false },
        orderBy: { createdAt: "asc" },
    });
    if (activeSessions.length >= 10) {
        const toDelete = activeSessions.slice(0, activeSessions.length - 9);
        await prisma_1.default.refreshToken.deleteMany({
            where: { id: { in: toDelete.map((s) => s.id) } },
        });
    }
    const rawRefreshToken = crypto_1.default.randomBytes(32).toString("hex");
    const hashedRefreshToken = crypto_1.default
        .createHash("sha256")
        .update(rawRefreshToken)
        .digest("hex");
    await prisma_1.default.refreshToken.create({
        data: {
            token: hashedRefreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    });
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "15m" });
    return {
        token,
        rawRefreshToken,
        user: { id: user.id, name: user.name, email: user.email },
    };
};
exports.login = login;
const refreshToken = async (token) => {
    const hashed = crypto_1.default.createHash("sha256").update(token).digest("hex");
    const match = await prisma_1.default.refreshToken.findUnique({
        where: { token: hashed },
    });
    if (!match)
        throw new Error("Authorization Error");
    if (match.revoked) {
        await prisma_1.default.refreshToken.deleteMany({ where: { userId: match.userId } });
        throw new Error("Authorization Error");
    }
    if (match.expiresAt < new Date())
        throw new Error("Authorization Error");
    const revoked = await prisma_1.default.refreshToken.updateMany({
        where: { id: match.id, revoked: false },
        data: { revoked: true },
    });
    if (revoked.count === 0)
        throw new Error("Authorization Error");
    const newToken = jsonwebtoken_1.default.sign({ userId: match.userId }, JWT_SECRET, {
        expiresIn: "15m",
    });
    const rawRefreshToken = crypto_1.default.randomBytes(32).toString("hex");
    const hashedRefreshToken = crypto_1.default
        .createHash("sha256")
        .update(rawRefreshToken)
        .digest("hex");
    await prisma_1.default.refreshToken.create({
        data: {
            token: hashedRefreshToken,
            userId: match.userId,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    });
    return { token: newToken, refreshToken: rawRefreshToken };
};
exports.refreshToken = refreshToken;
const logout = async (token) => {
    const hashed = crypto_1.default.createHash("sha256").update(token).digest("hex");
    const match = await prisma_1.default.refreshToken.findUnique({
        where: { token: hashed },
    });
    if (!match)
        throw new Error("Authorization Error");
    if (match.revoked)
        throw new Error("Authorization Error");
    await prisma_1.default.refreshToken.update({
        where: {
            id: match.id,
        },
        data: {
            revoked: true,
        },
    });
    return { message: "Logged out successfully" };
};
exports.logout = logout;
const revokeAllSessions = async (userId) => {
    await prisma_1.default.refreshToken.deleteMany({ where: { userId } });
    return { message: "All sessions revoked" };
};
exports.revokeAllSessions = revokeAllSessions;
const verifyEmail = async (token) => {
    const hashed = crypto_1.default.createHash("sha256").update(token).digest("hex");
    const match = await prisma_1.default.emailVerificationToken.findUnique({
        where: { token: hashed },
    });
    if (!match)
        throw new Error("Invalid or expired token");
    if (match.expiresAt < new Date())
        throw new Error("Invalid or expired token");
    await prisma_1.default.user.update({
        where: { id: match.userId },
        data: {
            emailVerified: true,
            ...(match.pendingEmail ? { email: match.pendingEmail } : {}),
        },
    });
    await prisma_1.default.emailVerificationToken.delete({ where: { id: match.id } });
    if (match.pendingEmail) {
        await prisma_1.default.refreshToken.deleteMany({ where: { userId: match.userId } });
    }
    return { message: "Email verified successfully" };
};
exports.verifyEmail = verifyEmail;
const requestEmailChange = async (userId, newEmail) => {
    const existing = await prisma_1.default.user.findUnique({ where: { email: newEmail } });
    if (existing && existing.id !== userId)
        return;
    const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new Error("Authorization Error");
    await prisma_1.default.emailVerificationToken.deleteMany({ where: { userId, pendingEmail: { not: null } } });
    const rawToken = crypto_1.default.randomBytes(32).toString("hex");
    const hashedToken = crypto_1.default.createHash("sha256").update(rawToken).digest("hex");
    await prisma_1.default.emailVerificationToken.create({
        data: {
            token: hashedToken,
            userId,
            pendingEmail: newEmail,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
    });
    (0, email_service_1.sendEmail)(newEmail, "Verify your new email address", (0, email_templates_1.verifyEmailEmail)(rawToken))
        .catch((error) => console.error("Error sending email change verification:", error));
    (0, email_service_1.sendEmail)(user.email, "Security alert: email change requested", (0, email_templates_1.emailChangeAlertEmail)(escapeHtml(newEmail)))
        .catch((error) => console.error("Error sending security alert:", error));
};
exports.requestEmailChange = requestEmailChange;
const resendVerification = async (email) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user || user.emailVerified)
        return;
    await prisma_1.default.emailVerificationToken.deleteMany({ where: { userId: user.id } });
    const rawToken = crypto_1.default.randomBytes(32).toString("hex");
    const hashedToken = crypto_1.default.createHash("sha256").update(rawToken).digest("hex");
    await prisma_1.default.emailVerificationToken.create({
        data: {
            token: hashedToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
    });
    (0, email_service_1.sendEmail)(email, "Verify your email address", (0, email_templates_1.verifyEmailEmail)(rawToken))
        .catch((error) => console.error("Error sending verification email:", error));
};
exports.resendVerification = resendVerification;
const forgotPassword = async (email) => {
    const match = await prisma_1.default.user.findUnique({
        where: {
            email,
        },
    });
    if (!match)
        return;
    await prisma_1.default.passwordResetToken.deleteMany({ where: { userId: match.id } });
    const rawPasswordResetToken = crypto_1.default.randomBytes(32).toString("hex");
    const hashedPasswordResetToken = crypto_1.default
        .createHash("sha256")
        .update(rawPasswordResetToken)
        .digest("hex");
    await prisma_1.default.passwordResetToken.create({
        data: {
            token: hashedPasswordResetToken,
            userId: match.id,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
    });
    (0, email_service_1.sendEmail)(email, "Reset your LystMate password", (0, email_templates_1.resetPasswordEmail)(rawPasswordResetToken))
        .catch((error) => console.error("Error sending reset password email:", error));
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (token, newPassword) => {
    const hashedPasswordResetToken = crypto_1.default
        .createHash("sha256")
        .update(token)
        .digest("hex");
    const match = await prisma_1.default.passwordResetToken.findUnique({
        where: { token: hashedPasswordResetToken },
    });
    if (!match)
        throw new Error("Invalid or expired token");
    if (match.expiresAt < new Date())
        throw new Error("Invalid or expired token");
    const newPasswordHashed = await bcryptjs_1.default.hash(newPassword, 10);
    await prisma_1.default.user.update({
        where: {
            id: match.userId,
        },
        data: { password: newPasswordHashed },
    });
    await prisma_1.default.passwordResetToken.delete({
        where: {
            id: match.id,
        },
    });
    await prisma_1.default.refreshToken.deleteMany({ where: { userId: match.userId } });
    return { message: "Password reset successfully" };
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.service.js.map
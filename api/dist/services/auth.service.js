"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const register = async (name, email, password) => {
    const existing = await prisma_1.default.user.findUnique({ where: { email } });
    if (existing)
        throw new Error("Invalid Credentials");
    const hashed = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma_1.default.user.create({
        data: {
            name,
            email,
            password: hashed,
        },
    });
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
        rawRefreshToken,
        token,
        user: { id: user.id, name: user.name, email: user.email },
    };
};
exports.register = register;
const login = async (email, password) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw new Error("Invalid Credentials");
    const matches = await bcryptjs_1.default.compare(password, user.password);
    if (!matches)
        throw new Error("Invalid Credentials");
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
    if (match.revoked)
        throw new Error("Authorization Error");
    if (match.expiresAt < new Date())
        throw new Error("Authorization Error");
    await prisma_1.default.refreshToken.update({
        where: {
            id: match.id,
        },
        data: {
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    });
    const newToken = jsonwebtoken_1.default.sign({ userId: match.userId }, JWT_SECRET, {
        expiresIn: "15m",
    });
    return { token: newToken };
};
exports.refreshToken = refreshToken;
const logout = async (token) => {
    const hashed = crypto_1.default.createHash("sha256").update(token).digest("hex");
    const match = await prisma_1.default.refreshToken.findUnique({
        where: { token: hashed },
    });
    if (!match)
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
//# sourceMappingURL=auth.service.js.map
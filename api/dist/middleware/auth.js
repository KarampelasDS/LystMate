"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization Error" });
    }
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization Error" });
    }
    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET;
    if (!secret)
        return res.status(500).json({ error: "Server configuration error" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret, { algorithms: ["HS256"] });
        req.userId = decoded.userId;
        next();
    }
    catch (err) {
        return res.status(401).json({ error: "Authorization Error" });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const updateUser = async (userId, name, email) => {
    if (!name && !email)
        throw new Error("No data to update");
    if (email) {
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing && existing.id !== userId)
            throw new Error("Email already in use");
    }
    const user = await prisma_1.default.user.update({
        where: { id: userId },
        data: { name, email },
    });
    return { name: user.name, email: user.email };
};
exports.updateUser = updateUser;
//# sourceMappingURL=users.service.js.map
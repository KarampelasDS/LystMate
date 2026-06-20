"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getMe = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getMe = async (userId) => {
    const user = await prisma_1.default.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true } });
    if (!user)
        throw new Error("Not found");
    return user;
};
exports.getMe = getMe;
const updateUser = async (userId, name) => {
    if (!name)
        throw new Error("No data to update");
    const user = await prisma_1.default.user.update({
        where: { id: userId },
        data: { name },
    });
    return { name: user.name, email: user.email };
};
exports.updateUser = updateUser;
//# sourceMappingURL=users.service.js.map
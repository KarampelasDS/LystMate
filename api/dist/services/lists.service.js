"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveList = exports.transferOwnership = exports.updateMember = exports.removeMember = exports.changeListVisibility = exports.renameList = exports.deleteList = exports.getMembers = exports.getList = exports.getLists = exports.createList = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
//Create New List
const createList = async (userId, name, visibility = "PRIVATE") => {
    const result = await prisma_1.default.$transaction(async (tx) => {
        const txList = await tx.list.create({
            data: {
                name,
                visibility,
            },
        });
        await tx.listMember.create({
            data: {
                userId,
                listId: txList.id,
                role: "OWNER",
            },
        });
        return txList;
    });
    return result;
};
exports.createList = createList;
//Get User Lists
const getLists = async (userId, page, limit) => {
    const [lists, total] = await Promise.all([
        prisma_1.default.listMember.findMany({
            where: { userId },
            include: { list: true },
            orderBy: { list: { createdAt: "desc" } },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma_1.default.listMember.count({ where: { userId } }),
    ]);
    return {
        data: lists.map((lm) => lm.list),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};
exports.getLists = getLists;
//Get List Details
const getList = async (id, userId) => {
    const [list, membership] = await Promise.all([
        prisma_1.default.list.findUnique({ where: { id } }),
        prisma_1.default.listMember.findUnique({
            where: { userId_listId: { userId, listId: id } },
        }),
    ]);
    if (!list)
        return null;
    if (!membership && list.visibility !== "PUBLIC")
        throw new Error("Forbidden");
    if (!membership)
        return list;
    return list;
};
exports.getList = getList;
//Get List Members
const getMembers = async (listId, userId, page, limit) => {
    const member = await prisma_1.default.listMember.findUnique({
        where: { userId_listId: { userId, listId } },
    });
    if (!member)
        throw new Error("Forbidden");
    const [members, total] = await Promise.all([
        prisma_1.default.listMember.findMany({
            where: { listId },
            include: { user: { select: { id: true, name: true } } },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma_1.default.listMember.count({ where: { listId } }),
    ]);
    return { data: members, total, page, limit, totalPages: Math.ceil(total / limit) };
};
exports.getMembers = getMembers;
//Delete List
const deleteList = async (id, userId) => {
    const member = await prisma_1.default.listMember.findUnique({
        where: { userId_listId: { userId, listId: id } },
    });
    if (!member || member.role !== "OWNER")
        throw new Error("Forbidden");
    await prisma_1.default.list.delete({ where: { id } });
    return { success: true };
};
exports.deleteList = deleteList;
//Rename List
const renameList = async (id, name, userId) => {
    const member = await prisma_1.default.listMember.findUnique({
        where: { userId_listId: { userId, listId: id } },
    });
    if (!member || member.role !== "OWNER")
        throw new Error("Forbidden");
    const list = await prisma_1.default.list.update({
        where: { id },
        data: { name },
    });
    return list;
};
exports.renameList = renameList;
//Change List Visibility
const changeListVisibility = async (id, visibility, userId) => {
    const member = await prisma_1.default.listMember.findUnique({
        where: { userId_listId: { userId, listId: id } },
    });
    if (!member || member.role !== "OWNER")
        throw new Error("Forbidden");
    const list = await prisma_1.default.list.update({
        where: { id },
        data: { visibility },
    });
    return list;
};
exports.changeListVisibility = changeListVisibility;
//Remove Member
const removeMember = async (listId, targetUserId, requesterId) => {
    await prisma_1.default.$transaction(async (tx) => {
        const requester = await tx.listMember.findUnique({
            where: { userId_listId: { userId: requesterId, listId } },
        });
        if (!requester || requester.role !== "OWNER")
            throw new Error("Forbidden");
        if (targetUserId === requesterId)
            throw new Error("Cannot remove yourself, use leave list");
        const target = await tx.listMember.findUnique({
            where: { userId_listId: { userId: targetUserId, listId } },
        });
        if (!target)
            throw new Error("Forbidden");
        await tx.listMember.delete({
            where: { userId_listId: { userId: targetUserId, listId } },
        });
    });
    return { success: true };
};
exports.removeMember = removeMember;
//Update Member Role
const updateMember = async (listId, targetUserId, role, requesterId) => {
    const updated = await prisma_1.default.$transaction(async (tx) => {
        const requester = await tx.listMember.findUnique({
            where: { userId_listId: { userId: requesterId, listId } },
        });
        if (!requester || requester.role !== "OWNER")
            throw new Error("Forbidden");
        if (targetUserId === requesterId)
            throw new Error("Cannot change your own role");
        const target = await tx.listMember.findUnique({
            where: { userId_listId: { userId: targetUserId, listId } },
        });
        if (!target)
            throw new Error("Forbidden");
        return tx.listMember.update({
            where: { userId_listId: { userId: targetUserId, listId } },
            data: { role },
        });
    });
    return updated;
};
exports.updateMember = updateMember;
//Transfer Ownership
const transferOwnership = async (listId, newOwnerId, requesterId) => {
    await prisma_1.default.$transaction(async (tx) => {
        const requester = await tx.listMember.findUnique({
            where: { userId_listId: { userId: requesterId, listId } },
        });
        if (!requester || requester.role !== "OWNER")
            throw new Error("Forbidden");
        if (newOwnerId === requesterId)
            throw new Error("You are already the owner");
        const target = await tx.listMember.findUnique({
            where: { userId_listId: { userId: newOwnerId, listId } },
        });
        if (!target)
            throw new Error("Forbidden");
        await tx.listMember.update({
            where: { userId_listId: { userId: requesterId, listId } },
            data: { role: "MEMBER" },
        });
        await tx.listMember.update({
            where: { userId_listId: { userId: newOwnerId, listId } },
            data: { role: "OWNER" },
        });
    });
    return { success: true };
};
exports.transferOwnership = transferOwnership;
//Leave List
const leaveList = async (id, userId) => {
    return prisma_1.default.$transaction(async (tx) => {
        const member = await tx.listMember.findUnique({
            where: { userId_listId: { userId, listId: id } },
        });
        if (!member)
            throw new Error("Forbidden");
        if (member.role === "OWNER") {
            const otherMembers = await tx.listMember.findMany({
                where: { listId: id, userId: { not: userId } },
            });
            if (otherMembers.length > 0)
                throw new Error("You must transfer ownership before leaving");
            await tx.list.delete({ where: { id } });
            return { success: true };
        }
        await tx.listMember.delete({ where: { userId_listId: { userId, listId: id } } });
        return { success: true };
    });
};
exports.leaveList = leaveList;
//# sourceMappingURL=lists.service.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvites = exports.getSentInvites = exports.cancelInvite = exports.respondToInvite = exports.sendInvite = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const sendInvite = async (listId, inviterId, inviteeEmail, role = "VIEWER") => {
    const user = await prisma_1.default.listMember.findUnique({
        where: { userId_listId: { userId: inviterId, listId } },
    });
    if (!user || user.role !== "OWNER")
        throw new Error("Forbidden");
    const invitee = await prisma_1.default.user.findUnique({
        where: { email: inviteeEmail },
    });
    if (!invitee)
        throw new Error("Invite could not be sent");
    const [alreadyMember, existingInvite] = await Promise.all([
        prisma_1.default.listMember.findUnique({ where: { userId_listId: { userId: invitee.id, listId } } }),
        prisma_1.default.invite.findUnique({ where: { listId_inviteeId: { listId, inviteeId: invitee.id } } }),
    ]);
    if (alreadyMember || existingInvite)
        throw new Error("Invite could not be sent");
    const invite = await prisma_1.default.invite.create({
        data: {
            listId,
            inviterId,
            inviteeId: invitee.id,
            role,
        },
    });
    return invite;
};
exports.sendInvite = sendInvite;
const respondToInvite = async (inviteId, userId, response) => {
    const invite = await prisma_1.default.invite.findUnique({ where: { id: inviteId } });
    if (!invite || invite.inviteeId !== userId)
        throw new Error("Forbidden");
    if (invite.status !== "PENDING")
        throw new Error("Invite already responded to");
    return prisma_1.default.$transaction(async (tx) => {
        const updatedInvite = await tx.invite.update({
            data: { status: response },
            where: { id: inviteId, status: "PENDING" },
        });
        if (response === "ACCEPTED") {
            await tx.listMember.create({
                data: {
                    userId,
                    listId: invite.listId,
                    role: invite.role,
                },
            });
        }
        return updatedInvite;
    });
};
exports.respondToInvite = respondToInvite;
const cancelInvite = async (inviteId, userId) => {
    const invite = await prisma_1.default.invite.findUnique({ where: { id: inviteId } });
    if (!invite)
        throw new Error("Forbidden");
    const member = await prisma_1.default.listMember.findUnique({
        where: { userId_listId: { userId, listId: invite.listId } },
    });
    if (!member || member.role !== "OWNER")
        throw new Error("Forbidden");
    if (invite.status !== "PENDING")
        throw new Error("Invite already responded to");
    await prisma_1.default.invite.delete({ where: { id: inviteId } });
    return { success: true };
};
exports.cancelInvite = cancelInvite;
const getSentInvites = async (userId, page, limit) => {
    const [invites, total] = await Promise.all([
        prisma_1.default.invite.findMany({
            where: { inviterId: userId, status: "PENDING" },
            include: { list: true, invitee: { select: { id: true, name: true, email: true } } },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.default.invite.count({ where: { inviterId: userId, status: "PENDING" } }),
    ]);
    return { data: invites, total, page, limit, totalPages: Math.ceil(total / limit) };
};
exports.getSentInvites = getSentInvites;
const getInvites = async (userId, page, limit) => {
    const [invites, total] = await Promise.all([
        prisma_1.default.invite.findMany({
            where: { inviteeId: userId, status: "PENDING" },
            include: { list: true, inviter: { select: { id: true, name: true, email: true } } },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma_1.default.invite.count({ where: { inviteeId: userId, status: "PENDING" } }),
    ]);
    return {
        data: invites,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};
exports.getInvites = getInvites;
//# sourceMappingURL=invites.service.js.map
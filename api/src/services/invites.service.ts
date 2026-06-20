import prisma from "../utils/prisma";
import { sendEmail } from "./email.service";
import { listInviteEmail, listInviteNewUserEmail } from "./email-templates";

export const sendInvite = async (
  listId: string,
  inviterId: string,
  inviteeEmail: string,
  role: "VIEWER" | "MEMBER" = "VIEWER",
) => {
  const member = await prisma.listMember.findUnique({
    where: { userId_listId: { userId: inviterId, listId } },
  });
  if (!member || member.role !== "OWNER") throw new Error("Forbidden");

  const invitee = await prisma.user.findUnique({ where: { email: inviteeEmail } });

  if (invitee) {
    const [alreadyMember, existingInvite] = await Promise.all([
      prisma.listMember.findUnique({ where: { userId_listId: { userId: invitee.id, listId } } }),
      prisma.invite.findUnique({ where: { listId_inviteeEmail: { listId, inviteeEmail } } }),
    ]);
    if (alreadyMember || existingInvite) throw new Error("Invite could not be sent");
  } else {
    const existingInvite = await prisma.invite.findUnique({
      where: { listId_inviteeEmail: { listId, inviteeEmail } },
    });
    if (existingInvite) throw new Error("Invite could not be sent");
  }

  const [invite, inviter, list] = await Promise.all([
    prisma.invite.create({
      data: {
        listId,
        inviterId,
        inviteeId: invitee?.id ?? undefined,
        inviteeEmail,
        role,
      },
    }),
    prisma.user.findUnique({ where: { id: inviterId }, select: { name: true } }),
    prisma.list.findUnique({ where: { id: listId }, select: { name: true } }),
  ]);

  const inviterName = inviter?.name ?? "Someone";
  const listName = list?.name ?? "a list";

  if (invitee) {
    sendEmail(
      inviteeEmail,
      `${inviterName} invited you to a list on LystMate`,
      listInviteEmail(inviterName, listName),
    ).catch((err) => console.error("Failed to send invite email:", err));
  } else {
    sendEmail(
      inviteeEmail,
      `${inviterName} invited you to LystMate`,
      listInviteNewUserEmail(inviterName, listName),
    ).catch((err) => console.error("Failed to send invite email:", err));
  }

  return invite;
};

export const respondToInvite = async (
  inviteId: string,
  userId: string,
  response: "ACCEPTED" | "REJECTED",
) => {
  const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
  if (!invite || invite.inviteeId !== userId) throw new Error("Forbidden");
  if (invite.status !== "PENDING")
    throw new Error("Invite already responded to");

  return prisma.$transaction(async (tx) => {
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

export const cancelInvite = async (inviteId: string, userId: string) => {
  const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
  if (!invite) throw new Error("Forbidden");
  const member = await prisma.listMember.findUnique({
    where: { userId_listId: { userId, listId: invite.listId } },
  });
  if (!member || member.role !== "OWNER") throw new Error("Forbidden");
  if (invite.status !== "PENDING")
    throw new Error("Invite already responded to");
  await prisma.invite.delete({ where: { id: inviteId } });
  return { success: true };
};

export const getSentInvites = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const [invites, total] = await Promise.all([
    prisma.invite.findMany({
      where: { inviterId: userId, status: "PENDING" },
      include: { list: true, invitee: { select: { id: true, name: true, email: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.invite.count({ where: { inviterId: userId, status: "PENDING" } }),
  ]);
  return { data: invites, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getInvites = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const [invites, total] = await Promise.all([
    prisma.invite.findMany({
      where: { inviteeId: userId, status: "PENDING" },
      include: { list: true, inviter: { select: { id: true, name: true, email: true } } },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.invite.count({ where: { inviteeId: userId, status: "PENDING" } }),
  ]);
  return {
    data: invites,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

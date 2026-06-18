import prisma from "../utils/prisma";

//Create New List
export const createList = async (
  userId: string,
  name: string,
  visibility: "PUBLIC" | "PRIVATE" = "PRIVATE",
) => {
  const result = await prisma.$transaction(async (tx) => {
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

//Get User Lists
export const getLists = async (userId: string, page: number, limit: number) => {
  const [lists, total] = await Promise.all([
    prisma.listMember.findMany({
      where: { userId },
      include: { list: true },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listMember.count({ where: { userId } }),
  ]);
  return {
    data: lists.map((lm) => lm.list),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

//Get List Details
export const getList = async (id: string, userId: string) => {
  const list = await prisma.list.findUnique({
    where: { id },
    include: {
      items: true,
      members: true,
    },
  });
  if (!list) return null;
  const isMember = list.members.some((m) => m.userId === userId);
  if (!isMember && list.visibility !== "PUBLIC") throw new Error("Forbidden");
  return list;
};

//Get List Members
export const getMembers = async (listId: string, userId: string) => {
  const member = await prisma.listMember.findUnique({
    where: { userId_listId: { userId, listId } },
  });
  if (!member) throw new Error("Forbidden");
  const members = await prisma.listMember.findMany({
    where: { listId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return members;
};

//Delete List
export const deleteList = async (id: string, userId: string) => {
  const member = await prisma.listMember.findUnique({
    where: { userId_listId: { userId, listId: id } },
  });
  if (!member || member.role !== "OWNER") throw new Error("Forbidden");
  await prisma.list.delete({ where: { id } });
  return { success: true };
};

//Rename List
export const renameList = async (id: string, name: string, userId: string) => {
  const member = await prisma.listMember.findUnique({
    where: { userId_listId: { userId, listId: id } },
  });
  if (!member || member.role !== "OWNER") throw new Error("Forbidden");
  const list = await prisma.list.update({
    where: { id },
    data: { name },
  });
  return list;
};

//Change List Visibility
export const changeListVisibility = async (
  id: string,
  visibility: "PUBLIC" | "PRIVATE",
  userId: string,
) => {
  const member = await prisma.listMember.findUnique({
    where: { userId_listId: { userId, listId: id } },
  });
  if (!member || member.role !== "OWNER") throw new Error("Forbidden");
  const list = await prisma.list.update({
    where: { id },
    data: { visibility },
  });
  return list;
};

//Remove Member
export const removeMember = async (
  listId: string,
  targetUserId: string,
  requesterId: string,
) => {
  const requester = await prisma.listMember.findUnique({
    where: { userId_listId: { userId: requesterId, listId } },
  });
  if (!requester || requester.role !== "OWNER") throw new Error("Forbidden");
  if (targetUserId === requesterId)
    throw new Error("Cannot remove yourself, use leave list");
  const target = await prisma.listMember.findUnique({
    where: { userId_listId: { userId: targetUserId, listId } },
  });
  if (!target) throw new Error("Forbidden");
  await prisma.listMember.delete({
    where: { userId_listId: { userId: targetUserId, listId } },
  });
  return { success: true };
};

//Update Member Role
export const updateMember = async (
  listId: string,
  targetUserId: string,
  role: "MEMBER" | "VIEWER",
  requesterId: string,
) => {
  const requester = await prisma.listMember.findUnique({
    where: { userId_listId: { userId: requesterId, listId } },
  });
  if (!requester || requester.role !== "OWNER") throw new Error("Forbidden");
  if (targetUserId === requesterId)
    throw new Error("Cannot change your own role");
  const target = await prisma.listMember.findUnique({
    where: { userId_listId: { userId: targetUserId, listId } },
  });
  if (!target) throw new Error("Forbidden");
  const updated = await prisma.listMember.update({
    where: { userId_listId: { userId: targetUserId, listId } },
    data: { role },
  });
  return updated;
};

//Transfer Ownership
export const transferOwnership = async (
  listId: string,
  newOwnerId: string,
  requesterId: string,
) => {
  await prisma.$transaction(async (tx) => {
    const requester = await tx.listMember.findUnique({
      where: { userId_listId: { userId: requesterId, listId } },
    });
    if (!requester || requester.role !== "OWNER") throw new Error("Forbidden");
    if (newOwnerId === requesterId) throw new Error("You are already the owner");
    const target = await tx.listMember.findUnique({
      where: { userId_listId: { userId: newOwnerId, listId } },
    });
    if (!target) throw new Error("Forbidden");
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

//Leave List
export const leaveList = async (id: string, userId: string) => {
  const member = await prisma.listMember.findUnique({
    where: { userId_listId: { userId, listId: id } },
  });
  if (!member) throw new Error("Forbidden");
  if (member.role === "OWNER") {
    const otherMembers = await prisma.listMember.findMany({
      where: { listId: id, userId: { not: userId } },
    });
    if (otherMembers.length > 0) {
      throw new Error("You must transfer ownership before leaving");
    }
    await prisma.list.delete({ where: { id } });
    return { success: true };
  }
  await prisma.listMember.delete({
    where: { userId_listId: { userId, listId: id } },
  });
  return { success: true };
};

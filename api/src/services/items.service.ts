import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createItem = async (
  listId: string,
  userId: string,
  name: string,
  url?: string,
  quantity?: number,
) => {
  const member = await prisma.listMember.findUnique({
    where: { userId_listId: { userId, listId } },
  });
  if (!member || member.role === "VIEWER")
    throw new Error("Authorization Error");
  const item = await prisma.item.create({
    data: {
      listId,
      name,
      url,
      quantity,
    },
  });
  return item;
};

export const updateItem = async (
  listId: string,
  itemId: string,
  userId: string,
  name?: string,
  url?: string,
  quantity?: number,
  checked?: boolean,
) => {
  const member = await prisma.listMember.findUnique({
    where: { userId_listId: { userId, listId } },
  });
  if (!member || member.role === "VIEWER")
    throw new Error("Authorization Error");
  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });
  if (!item) throw new Error("Item not found");
  const updatedItem = await prisma.item.update({
    where: { id: itemId },
    data: { name, url, quantity, checked },
  });
  return updatedItem;
};

export const deleteItem = async (
  listId: string,
  itemId: string,
  userId: string,
) => {
  const member = await prisma.listMember.findUnique({
    where: { userId_listId: { userId, listId } },
  });
  if (!member || member.role === "VIEWER")
    throw new Error("Authorization Error");
  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });
  if (!item) throw new Error("Item not found");
  const deletedItem = await prisma.item.delete({
    where: { id: itemId },
  });
  return deletedItem;
};

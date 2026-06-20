import prisma from "../utils/prisma";

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true } });
  if (!user) throw new Error("Not found");
  return user;
};

export const updateUser = async (userId: string, name?: string) => {
  if (!name) throw new Error("No data to update");
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
  });
  return { name: user.name, email: user.email };
};

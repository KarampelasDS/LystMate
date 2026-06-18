import prisma from "../utils/prisma";

export const updateUser = async (userId: string, name?: string) => {
  if (!name) throw new Error("No data to update");
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
  });
  return { name: user.name, email: user.email };
};

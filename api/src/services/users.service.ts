import prisma from "../utils/prisma";

export const updateUser = async (
  userId: string,
  name?: string,
  email?: string,
) => {
  if (!name && !email) throw new Error("No data to update");
  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId)
      throw new Error("Email already in use");
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, email },
  });
  return { name: user.name, email: user.email };
};

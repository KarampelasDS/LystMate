import prisma from "../utils/prisma";
import bcrypt from "bcryptjs";

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

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Not found");
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new Error("Current password is incorrect");
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
};

export const deleteAccount = async (userId: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Not found");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Incorrect password");
  await prisma.user.delete({ where: { id: userId } });
};

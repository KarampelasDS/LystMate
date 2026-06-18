import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../utils/prisma";
import { sendEmail } from "./email.service";

const escapeHtml = (str: string) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set and at least 32 characters long");
}

export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Invalid Credentials");
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
    },
  });
  const rawVerificationToken = crypto.randomBytes(32).toString("hex");
  const hashedVerificationToken = crypto
    .createHash("sha256")
    .update(rawVerificationToken)
    .digest("hex");
  await prisma.emailVerificationToken.create({
    data: {
      token: hashedVerificationToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  sendEmail(
    email,
    "Welcome to Our App",
    `<p>Hi ${escapeHtml(name)}, welcome to our app!</p>
    <p>Please verify your email by clicking the link below:</p>
    <a href="${process.env.FRONTEND_URL}/verify-email?token=${rawVerificationToken}">Verify Email</a>
    `,
  ).catch((error) => {
    console.error("Error sending welcome email:", error);
  });
  return {
    user: { id: user.id, name: user.name, email: user.email },
  };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid Credentials");
  const matches = await bcrypt.compare(password, user.password);
  if (!matches) throw new Error("Invalid Credentials");
  if (!user.emailVerified) throw new Error("Email not verified");
  await prisma.refreshToken.deleteMany({
    where: { userId: user.id, expiresAt: { lt: new Date() } },
  });
  const activeSessions = await prisma.refreshToken.findMany({
    where: { userId: user.id, revoked: false },
    orderBy: { createdAt: "asc" },
  });
  if (activeSessions.length >= 10) {
    const toDelete = activeSessions.slice(0, activeSessions.length - 9);
    await prisma.refreshToken.deleteMany({
      where: { id: { in: toDelete.map((s) => s.id) } },
    });
  }
  const rawRefreshToken = crypto.randomBytes(32).toString("hex");
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(rawRefreshToken)
    .digest("hex");
  await prisma.refreshToken.create({
    data: {
      token: hashedRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "15m" });
  return {
    token,
    rawRefreshToken,
    user: { id: user.id, name: user.name, email: user.email },
  };
};

export const refreshToken = async (token: string) => {
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const match = await prisma.refreshToken.findUnique({
    where: { token: hashed },
  });
  if (!match) throw new Error("Authorization Error");
  if (match.revoked) {
    await prisma.refreshToken.deleteMany({ where: { userId: match.userId } });
    throw new Error("Authorization Error");
  }
  if (match.expiresAt < new Date()) throw new Error("Authorization Error");
  await prisma.refreshToken.update({
    where: {
      id: match.id,
    },
    data: {
      revoked: true,
    },
  });
  const newToken = jwt.sign({ userId: match.userId }, JWT_SECRET, {
    expiresIn: "15m",
  });
  const rawRefreshToken = crypto.randomBytes(32).toString("hex");
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(rawRefreshToken)
    .digest("hex");
  await prisma.refreshToken.create({
    data: {
      token: hashedRefreshToken,
      userId: match.userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  return { token: newToken, refreshToken: rawRefreshToken };
};

export const logout = async (token: string) => {
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const match = await prisma.refreshToken.findUnique({
    where: { token: hashed },
  });
  if (!match) throw new Error("Authorization Error");
  if (match.revoked) throw new Error("Authorization Error");
  await prisma.refreshToken.update({
    where: {
      id: match.id,
    },
    data: {
      revoked: true,
    },
  });
  return { message: "Logged out successfully" };
};

export const revokeAllSessions = async (userId: string) => {
  await prisma.refreshToken.deleteMany({ where: { userId } });
  return { message: "All sessions revoked" };
};

export const verifyEmail = async (token: string) => {
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const match = await prisma.emailVerificationToken.findUnique({
    where: { token: hashed },
  });
  if (!match) throw new Error("Invalid or expired token");
  if (match.expiresAt < new Date()) throw new Error("Invalid or expired token");
  await prisma.user.update({
    where: { id: match.userId },
    data: {
      emailVerified: true,
      ...(match.pendingEmail ? { email: match.pendingEmail } : {}),
    },
  });
  await prisma.emailVerificationToken.delete({
    where: { id: match.id },
  });
  return { message: "Email verified successfully" };
};

export const requestEmailChange = async (userId: string, newEmail: string) => {
  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existing && existing.id !== userId) throw new Error("Email already in use");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Authorization Error");
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  await prisma.emailVerificationToken.create({
    data: {
      token: hashedToken,
      userId,
      pendingEmail: newEmail,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  sendEmail(
    newEmail,
    "Verify your new email address",
    `<p>Click the link below to verify your new email address:</p>
    <a href="${process.env.FRONTEND_URL}/verify-email?token=${rawToken}">Verify Email</a>`,
  ).catch((error) => console.error("Error sending email change verification:", error));
  sendEmail(
    user.email,
    "Security alert: email change requested",
    `<p>A request was made to change the email address on your account to ${escapeHtml(newEmail)}.</p>
    <p>If this was not you, please contact support immediately.</p>`,
  ).catch((error) => console.error("Error sending security alert:", error));
};

export const forgotPassword = async (email: string) => {
  const match = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!match) return;
  await prisma.passwordResetToken.deleteMany({ where: { userId: match.id } });
  const rawPasswordResetToken = crypto.randomBytes(32).toString("hex");
  const hashedPasswordResetToken = crypto
    .createHash("sha256")
    .update(rawPasswordResetToken)
    .digest("hex");
  await prisma.passwordResetToken.create({
    data: {
      token: hashedPasswordResetToken,
      userId: match.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  sendEmail(
    email,
    "Reset Password",
    `<p>Reset your password using the link below:</p>
    <a href="${process.env.FRONTEND_URL}/reset-password?token=${rawPasswordResetToken}">Reset Password</a>
    `,
  ).catch((error) => {
    console.error("Error sending welcome email:", error);
  });
};

export const resetPassword = async (token: string, newPassword: string) => {
  const hashedPasswordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const match = await prisma.passwordResetToken.findUnique({
    where: { token: hashedPasswordResetToken },
  });
  if (!match) throw new Error("Invalid or expired token");
  if (match.expiresAt < new Date()) throw new Error("Invalid or expired token");
  const newPasswordHashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: {
      id: match.userId,
    },
    data: { password: newPasswordHashed },
  });
  await prisma.passwordResetToken.delete({
    where: {
      id: match.id,
    },
  });
  await prisma.refreshToken.deleteMany({ where: { userId: match.userId } });
  return { message: "Password reset successfully" };
};

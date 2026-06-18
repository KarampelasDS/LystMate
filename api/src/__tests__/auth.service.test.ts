import { register, login, refreshToken, logout } from "../services/auth.service";
import prisma from "../utils/prisma";
import bcrypt from "bcryptjs";

jest.mock("../services/email.service", () => ({
  sendEmail: jest.fn().mockResolvedValue({}),
}));

jest.mock("../utils/prisma", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  emailVerificationToken: {
    create: jest.fn(),
  },
}));

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockCreate = prisma.user.create as jest.Mock;
const mockRefreshTokenFindUnique = prisma.refreshToken.findUnique as jest.Mock;
const mockRefreshTokenFindMany = prisma.refreshToken.findMany as jest.Mock;
const mockRefreshTokenUpdate = prisma.refreshToken.update as jest.Mock;
const mockRefreshTokenDeleteMany = prisma.refreshToken.deleteMany as jest.Mock;

describe("auth.service", () => {
  // ─── register ──────────────────────────────────────────────────────────────

  describe("register", () => {
    it("creates a user and returns user data without tokens", async () => {
      mockFindUnique.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        id: "user-1",
        name: "Alice",
        email: "alice@example.com",
        password: "hashed",
      });

      const result = await register("Alice", "alice@example.com", "password123");

      expect(result.user.email).toBe("alice@example.com");
      expect(result.user).not.toHaveProperty("password");
      expect(result).not.toHaveProperty("token");
      expect(result).not.toHaveProperty("rawRefreshToken");
    });

    it("throws when email is already taken by a verified account", async () => {
      mockFindUnique.mockResolvedValue({
        id: "user-1",
        email: "alice@example.com",
        emailVerified: true,
      });

      await expect(
        register("Alice", "alice@example.com", "password123"),
      ).rejects.toThrow("Invalid Credentials");
    });
  });

  // ─── login ────────────────────────────────────────────────────────────────

  describe("login", () => {
    it("returns a token when credentials are correct", async () => {
      const hashed = await bcrypt.hash("password123", 10);
      mockFindUnique.mockResolvedValue({
        id: "user-1",
        name: "Alice",
        email: "alice@example.com",
        password: hashed,
        emailVerified: true,
      });
      mockRefreshTokenFindMany.mockResolvedValue([]);

      const result = await login("alice@example.com", "password123");

      expect(result.token).toBeDefined();
      expect(result.rawRefreshToken).toBeDefined();
      expect(result.user.email).toBe("alice@example.com");
      expect(result.user).not.toHaveProperty("password");
    });

    it("throws when user does not exist", async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(login("nobody@example.com", "password123")).rejects.toThrow(
        "Invalid Credentials",
      );
    });

    it("throws when password is wrong", async () => {
      const hashed = await bcrypt.hash("correctpassword", 10);
      mockFindUnique.mockResolvedValue({
        id: "user-1",
        email: "alice@example.com",
        password: hashed,
        emailVerified: true,
      });

      await expect(login("alice@example.com", "wrongpassword")).rejects.toThrow(
        "Invalid Credentials",
      );
    });

    it("throws when email is not verified", async () => {
      const hashed = await bcrypt.hash("password123", 10);
      mockFindUnique.mockResolvedValue({
        id: "user-1",
        email: "alice@example.com",
        password: hashed,
        emailVerified: false,
      });

      await expect(login("alice@example.com", "password123")).rejects.toThrow(
        "Email not verified",
      );
    });
  });

  // ─── refreshToken ─────────────────────────────────────────────────────────

  describe("refreshToken", () => {
    it("returns a new access token and revokes the old one", async () => {
      mockRefreshTokenFindUnique.mockResolvedValue({
        id: "rt-1",
        userId: "user-1",
        revoked: false,
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      });
      mockRefreshTokenUpdate.mockResolvedValue({});

      const result = await refreshToken("raw-token");

      expect(result.token).toBeDefined();
      expect(mockRefreshTokenUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "rt-1" },
          data: { revoked: true },
        }),
      );
    });

    it("throws when token does not exist", async () => {
      mockRefreshTokenFindUnique.mockResolvedValue(null);

      await expect(refreshToken("bad-token")).rejects.toThrow("Authorization Error");
    });

    it("throws and revokes all sessions when token is already revoked", async () => {
      mockRefreshTokenFindUnique.mockResolvedValue({
        id: "rt-1",
        userId: "user-1",
        revoked: true,
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      });
      mockRefreshTokenDeleteMany.mockResolvedValue({});

      await expect(refreshToken("raw-token")).rejects.toThrow("Authorization Error");
      expect(mockRefreshTokenDeleteMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: "user-1" } }),
      );
    });

    it("throws when token is expired", async () => {
      mockRefreshTokenFindUnique.mockResolvedValue({
        id: "rt-1",
        userId: "user-1",
        revoked: false,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(refreshToken("raw-token")).rejects.toThrow("Authorization Error");
    });
  });

  // ─── logout ───────────────────────────────────────────────────────────────

  describe("logout", () => {
    it("revokes the refresh token and returns success message", async () => {
      mockRefreshTokenFindUnique.mockResolvedValue({
        id: "rt-1",
        userId: "user-1",
        revoked: false,
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      });
      mockRefreshTokenUpdate.mockResolvedValue({});

      const result = await logout("raw-token");

      expect(result.message).toBe("Logged out successfully");
      expect(mockRefreshTokenUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "rt-1" },
          data: { revoked: true },
        }),
      );
    });

    it("throws when token does not exist", async () => {
      mockRefreshTokenFindUnique.mockResolvedValue(null);

      await expect(logout("bad-token")).rejects.toThrow("Authorization Error");
    });
  });
});

import { register, login } from "../services/auth.service";
import prisma from "../utils/prisma";
import bcrypt from "bcryptjs";

// Tell Jest to mock the entire prisma module so no real DB calls are made
jest.mock("../utils/prisma", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

// Cast so TypeScript knows these are jest mock functions
const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockCreate = prisma.user.create as jest.Mock;

describe("auth.service", () => {
  // ─── register ────────────────────────────────────────────────────────────

  describe("register", () => {
    it("creates a user and returns a token when email is not taken", async () => {
      mockFindUnique.mockResolvedValue(null); // no existing user
      mockCreate.mockResolvedValue({
        id: "user-1",
        name: "Alice",
        email: "alice@example.com",
        password: "hashed",
      });

      const result = await register("Alice", "alice@example.com", "password123");

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe("alice@example.com");
      // password must never be returned
      expect(result.user).not.toHaveProperty("password");
    });

    it("throws when email is already taken", async () => {
      mockFindUnique.mockResolvedValue({ id: "user-1", email: "alice@example.com" });

      await expect(
        register("Alice", "alice@example.com", "password123")
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
      });

      const result = await login("alice@example.com", "password123");

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe("alice@example.com");
      expect(result.user).not.toHaveProperty("password");
    });

    it("throws when user does not exist", async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(login("nobody@example.com", "password123")).rejects.toThrow(
        "Invalid Credentials"
      );
    });

    it("throws when password is wrong", async () => {
      const hashed = await bcrypt.hash("correctpassword", 10);
      mockFindUnique.mockResolvedValue({
        id: "user-1",
        email: "alice@example.com",
        password: hashed,
      });

      await expect(login("alice@example.com", "wrongpassword")).rejects.toThrow(
        "Invalid Credentials"
      );
    });
  });
});

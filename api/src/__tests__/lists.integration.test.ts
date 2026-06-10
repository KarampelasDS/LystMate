import request from "supertest";
import app from "../app";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";

// Mock Prisma so no real DB is touched
jest.mock("../utils/prisma", () => ({
  list: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  listMember: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
}));

// Helper: make a valid JWT for a fake user
const makeToken = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || "dev_secret");

const TOKEN = makeToken("user-1");
const AUTH = { Authorization: `Bearer ${TOKEN}` };

const mockListMember = prisma.listMember.findUnique as jest.Mock;
const mockListFindUnique = prisma.list.findUnique as jest.Mock;
const mockTransaction = prisma.$transaction as jest.Mock;
const mockListUpdate = prisma.list.update as jest.Mock;
const mockListDelete = prisma.list.delete as jest.Mock;

describe("Lists API", () => {
  // ─── POST /lists ──────────────────────────────────────────────────────────

  describe("POST /lists", () => {
    it("returns 400 when name is missing", async () => {
      const res = await request(app).post("/lists").set(AUTH).send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Name is required");
    });

    it("returns 400 when visibility is invalid", async () => {
      const res = await request(app)
        .post("/lists")
        .set(AUTH)
        .send({ name: "My List", visibility: "BANANA" });
      expect(res.status).toBe(400);
    });

    it("creates a list and returns 201", async () => {
      mockTransaction.mockResolvedValue({ id: "list-1", name: "My List", visibility: "PRIVATE" });

      const res = await request(app)
        .post("/lists")
        .set(AUTH)
        .send({ name: "My List" });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("My List");
    });

    it("returns 401 when no token is provided", async () => {
      const res = await request(app).post("/lists").send({ name: "My List" });
      expect(res.status).toBe(401);
    });
  });

  // ─── GET /lists/:id ───────────────────────────────────────────────────────

  describe("GET /lists/:id", () => {
    it("returns 403 when user is not a member and list is private", async () => {
      mockListFindUnique.mockResolvedValueOnce({ visibility: "PRIVATE" }); // isPublic check
      mockListMember.mockResolvedValue(null); // not a member

      const res = await request(app).get("/lists/list-1").set(AUTH);
      expect(res.status).toBe(403);
    });

    it("returns the list when user is a member", async () => {
      mockListFindUnique.mockResolvedValueOnce({ visibility: "PRIVATE" }); // isPublic check
      mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "OWNER" });
      mockListFindUnique.mockResolvedValueOnce({ id: "list-1", name: "My List", items: [] });

      const res = await request(app).get("/lists/list-1").set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("My List");
    });
  });

  // ─── DELETE /lists/:id ────────────────────────────────────────────────────

  describe("DELETE /lists/:id", () => {
    it("returns 403 when user is not the owner", async () => {
      mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "MEMBER" });

      const res = await request(app).delete("/lists/list-1").set(AUTH);
      expect(res.status).toBe(403);
    });

    it("returns 204 when owner deletes the list", async () => {
      mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "OWNER" });
      mockListDelete.mockResolvedValue({});

      const res = await request(app).delete("/lists/list-1").set(AUTH);
      expect(res.status).toBe(204);
    });
  });

  // ─── PATCH /lists/:id/rename ──────────────────────────────────────────────

  describe("PATCH /lists/:id/rename", () => {
    it("returns 400 when name is missing", async () => {
      const res = await request(app).patch("/lists/list-1/rename").set(AUTH).send({});
      expect(res.status).toBe(400);
    });

    it("returns 403 when user is not the owner", async () => {
      mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "MEMBER" });

      const res = await request(app)
        .patch("/lists/list-1/rename")
        .set(AUTH)
        .send({ name: "New Name" });
      expect(res.status).toBe(403);
    });

    it("renames the list when user is the owner", async () => {
      mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "OWNER" });
      mockListUpdate.mockResolvedValue({ id: "list-1", name: "New Name" });

      const res = await request(app)
        .patch("/lists/list-1/rename")
        .set(AUTH)
        .send({ name: "New Name" });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("New Name");
    });
  });
});

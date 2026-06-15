"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    $transaction: jest.fn(),
}));
const makeToken = (userId) => jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || "dev_secret");
const TOKEN = makeToken("user-1");
const AUTH = { Authorization: `Bearer ${TOKEN}` };
const mockListMember = prisma_1.default.listMember.findUnique;
const mockListMemberFindMany = prisma_1.default.listMember.findMany;
const mockListMemberCount = prisma_1.default.listMember.count;
const mockListMemberUpdate = prisma_1.default.listMember.update;
const mockListMemberDelete = prisma_1.default.listMember.delete;
const mockListFindUnique = prisma_1.default.list.findUnique;
const mockTransaction = prisma_1.default.$transaction;
const mockListUpdate = prisma_1.default.list.update;
const mockListDelete = prisma_1.default.list.delete;
describe("Lists API", () => {
    // ─── POST /lists ──────────────────────────────────────────────────────────
    describe("POST /lists", () => {
        it("returns 400 when name is missing", async () => {
            const res = await (0, supertest_1.default)(app_1.default).post("/lists").set(AUTH).send({});
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Name is required");
        });
        it("returns 400 when visibility is invalid", async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post("/lists")
                .set(AUTH)
                .send({ name: "My List", visibility: "BANANA" });
            expect(res.status).toBe(400);
        });
        it("creates a list and returns 201", async () => {
            mockTransaction.mockResolvedValue({ id: "list-1", name: "My List", visibility: "PRIVATE" });
            const res = await (0, supertest_1.default)(app_1.default).post("/lists").set(AUTH).send({ name: "My List" });
            expect(res.status).toBe(201);
            expect(res.body.name).toBe("My List");
        });
        it("returns 401 when no token is provided", async () => {
            const res = await (0, supertest_1.default)(app_1.default).post("/lists").send({ name: "My List" });
            expect(res.status).toBe(401);
        });
    });
    // ─── GET /lists ───────────────────────────────────────────────────────────
    describe("GET /lists", () => {
        it("returns paginated shape with defaults", async () => {
            mockListMemberFindMany.mockResolvedValue([
                { list: { id: "list-1", name: "List 1" } },
                { list: { id: "list-2", name: "List 2" } },
            ]);
            mockListMemberCount.mockResolvedValue(2);
            const res = await (0, supertest_1.default)(app_1.default).get("/lists").set(AUTH);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.total).toBe(2);
            expect(res.body.page).toBe(1);
            expect(res.body.limit).toBe(20);
            expect(res.body.totalPages).toBe(1);
        });
        it("respects page and limit query params", async () => {
            mockListMemberFindMany.mockResolvedValue([
                { list: { id: "list-3", name: "List 3" } },
            ]);
            mockListMemberCount.mockResolvedValue(55);
            const res = await (0, supertest_1.default)(app_1.default).get("/lists?page=2&limit=20").set(AUTH);
            expect(res.status).toBe(200);
            expect(res.body.page).toBe(2);
            expect(res.body.limit).toBe(20);
            expect(res.body.total).toBe(55);
            expect(res.body.totalPages).toBe(3);
        });
        it("caps limit at 100", async () => {
            mockListMemberFindMany.mockResolvedValue([]);
            mockListMemberCount.mockResolvedValue(0);
            const res = await (0, supertest_1.default)(app_1.default).get("/lists?limit=999").set(AUTH);
            expect(res.status).toBe(200);
            expect(res.body.limit).toBe(100);
        });
        it("clamps page to 1 when page is negative", async () => {
            mockListMemberFindMany.mockResolvedValue([]);
            mockListMemberCount.mockResolvedValue(0);
            const res = await (0, supertest_1.default)(app_1.default).get("/lists?page=-5").set(AUTH);
            expect(res.status).toBe(200);
            expect(res.body.page).toBe(1);
        });
    });
    // ─── GET /lists/:id ───────────────────────────────────────────────────────
    describe("GET /lists/:id", () => {
        it("returns 403 when user is not a member and list is private", async () => {
            mockListFindUnique.mockResolvedValueOnce({
                id: "list-1",
                name: "My List",
                visibility: "PRIVATE",
                items: [],
                members: [], // user-1 is not in here
            });
            const res = await (0, supertest_1.default)(app_1.default).get("/lists/list-1").set(AUTH);
            expect(res.status).toBe(403);
        });
        it("returns the list when user is a member", async () => {
            mockListFindUnique.mockResolvedValueOnce({
                id: "list-1",
                name: "My List",
                visibility: "PRIVATE",
                items: [],
                members: [{ userId: "user-1", role: "OWNER" }],
            });
            const res = await (0, supertest_1.default)(app_1.default).get("/lists/list-1").set(AUTH);
            expect(res.status).toBe(200);
            expect(res.body.name).toBe("My List");
        });
        it("returns 403 when list does not exist", async () => {
            mockListFindUnique.mockResolvedValueOnce(null);
            const res = await (0, supertest_1.default)(app_1.default).get("/lists/nonexistent").set(AUTH);
            expect(res.status).toBe(403);
        });
        it("allows access to a public list for non-members", async () => {
            mockListFindUnique.mockResolvedValueOnce({
                id: "list-1",
                name: "Public List",
                visibility: "PUBLIC",
                items: [],
                members: [], // user-1 is not a member
            });
            const res = await (0, supertest_1.default)(app_1.default).get("/lists/list-1").set(AUTH);
            expect(res.status).toBe(200);
        });
    });
    // ─── DELETE /lists/:id ────────────────────────────────────────────────────
    describe("DELETE /lists/:id", () => {
        it("returns 403 when user is not the owner", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "MEMBER" });
            const res = await (0, supertest_1.default)(app_1.default).delete("/lists/list-1").set(AUTH);
            expect(res.status).toBe(403);
        });
        it("returns 204 when owner deletes the list", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "OWNER" });
            mockListDelete.mockResolvedValue({});
            const res = await (0, supertest_1.default)(app_1.default).delete("/lists/list-1").set(AUTH);
            expect(res.status).toBe(204);
        });
    });
    // ─── PATCH /lists/:id/rename ──────────────────────────────────────────────
    describe("PATCH /lists/:id/rename", () => {
        it("returns 400 when name is missing", async () => {
            const res = await (0, supertest_1.default)(app_1.default).patch("/lists/list-1/rename").set(AUTH).send({});
            expect(res.status).toBe(400);
        });
        it("returns 403 when user is not the owner", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "MEMBER" });
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/lists/list-1/rename")
                .set(AUTH)
                .send({ name: "New Name" });
            expect(res.status).toBe(403);
        });
        it("renames the list when user is the owner", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "OWNER" });
            mockListUpdate.mockResolvedValue({ id: "list-1", name: "New Name" });
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/lists/list-1/rename")
                .set(AUTH)
                .send({ name: "New Name" });
            expect(res.status).toBe(200);
            expect(res.body.name).toBe("New Name");
        });
    });
    // ─── PATCH /lists/:id/visibility ─────────────────────────────────────────
    describe("PATCH /lists/:id/visibility", () => {
        it("returns 400 when visibility is missing", async () => {
            const res = await (0, supertest_1.default)(app_1.default).patch("/lists/list-1/visibility").set(AUTH).send({});
            expect(res.status).toBe(400);
        });
        it("returns 400 when visibility is invalid", async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/lists/list-1/visibility")
                .set(AUTH)
                .send({ visibility: "BANANA" });
            expect(res.status).toBe(400);
        });
        it("returns 403 when user is not the owner", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "MEMBER" });
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/lists/list-1/visibility")
                .set(AUTH)
                .send({ visibility: "PUBLIC" });
            expect(res.status).toBe(403);
        });
        it("updates visibility when user is the owner", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "OWNER" });
            mockListUpdate.mockResolvedValue({ id: "list-1", visibility: "PUBLIC" });
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/lists/list-1/visibility")
                .set(AUTH)
                .send({ visibility: "PUBLIC" });
            expect(res.status).toBe(200);
        });
    });
    // ─── DELETE /lists/:id/leave ──────────────────────────────────────────────
    describe("DELETE /lists/:id/leave", () => {
        it("returns 403 when user is not a member", async () => {
            mockListMember.mockResolvedValue(null);
            const res = await (0, supertest_1.default)(app_1.default).delete("/lists/list-1/leave").set(AUTH);
            expect(res.status).toBe(403);
        });
        it("returns 400 when owner tries to leave with other members", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "OWNER" });
            mockListMemberFindMany.mockResolvedValue([
                { userId: "user-2", listId: "list-1", role: "MEMBER" },
            ]);
            const res = await (0, supertest_1.default)(app_1.default).delete("/lists/list-1/leave").set(AUTH);
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("You must transfer ownership before leaving");
        });
        it("returns 204 when non-owner leaves", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "MEMBER" });
            mockListMemberDelete.mockResolvedValue({});
            const res = await (0, supertest_1.default)(app_1.default).delete("/lists/list-1/leave").set(AUTH);
            expect(res.status).toBe(204);
        });
    });
    // ─── PATCH /lists/:id/transfer ────────────────────────────────────────────
    describe("PATCH /lists/:id/transfer", () => {
        it("returns 400 when newOwnerId is missing", async () => {
            const res = await (0, supertest_1.default)(app_1.default).patch("/lists/list-1/transfer").set(AUTH).send({});
            expect(res.status).toBe(400);
        });
        it("returns 403 when user is not the owner", async () => {
            mockListMember.mockResolvedValueOnce({ userId: "user-1", listId: "list-1", role: "MEMBER" });
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/lists/list-1/transfer")
                .set(AUTH)
                .send({ newOwnerId: "user-2" });
            expect(res.status).toBe(403);
        });
        it("transfers ownership when user is the owner", async () => {
            mockListMember.mockResolvedValueOnce({ userId: "user-1", listId: "list-1", role: "OWNER" });
            mockListMember.mockResolvedValueOnce({ userId: "user-2", listId: "list-1", role: "MEMBER" });
            mockTransaction.mockResolvedValue({});
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/lists/list-1/transfer")
                .set(AUTH)
                .send({ newOwnerId: "user-2" });
            expect(res.status).toBe(200);
        });
    });
    // ─── DELETE /lists/:id/members/:memberId ─────────────────────────────────
    describe("DELETE /lists/:id/members/:memberId", () => {
        it("returns 403 when user is not the owner", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "MEMBER" });
            const res = await (0, supertest_1.default)(app_1.default).delete("/lists/list-1/members/user-2").set(AUTH);
            expect(res.status).toBe(403);
        });
        it("returns 204 when owner removes a member", async () => {
            mockListMember
                .mockResolvedValueOnce({ userId: "user-1", listId: "list-1", role: "OWNER" })
                .mockResolvedValueOnce({ userId: "user-2", listId: "list-1", role: "MEMBER" });
            mockListMemberDelete.mockResolvedValue({});
            const res = await (0, supertest_1.default)(app_1.default).delete("/lists/list-1/members/user-2").set(AUTH);
            expect(res.status).toBe(204);
        });
    });
    // ─── PATCH /lists/:id/members/:memberId ──────────────────────────────────
    describe("PATCH /lists/:id/members/:memberId", () => {
        it("returns 400 when role is missing", async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/lists/list-1/members/user-2")
                .set(AUTH)
                .send({});
            expect(res.status).toBe(400);
        });
        it("returns 400 when role is invalid", async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/lists/list-1/members/user-2")
                .set(AUTH)
                .send({ role: "OWNER" });
            expect(res.status).toBe(400);
        });
        it("returns 403 when user is not the owner", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "MEMBER" });
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/lists/list-1/members/user-2")
                .set(AUTH)
                .send({ role: "VIEWER" });
            expect(res.status).toBe(403);
        });
        it("updates member role when user is the owner", async () => {
            mockListMember
                .mockResolvedValueOnce({ userId: "user-1", listId: "list-1", role: "OWNER" })
                .mockResolvedValueOnce({ userId: "user-2", listId: "list-1", role: "MEMBER" });
            mockListMemberUpdate.mockResolvedValue({ userId: "user-2", role: "VIEWER" });
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/lists/list-1/members/user-2")
                .set(AUTH)
                .send({ role: "VIEWER" });
            expect(res.status).toBe(200);
        });
    });
});
//# sourceMappingURL=lists.integration.test.js.map
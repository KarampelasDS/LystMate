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
    invite: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
    listMember: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
}));
const makeToken = (userId) => jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || "dev_secret");
const TOKEN = makeToken("user-1");
const AUTH = { Authorization: `Bearer ${TOKEN}` };
const mockInviteFindUnique = prisma_1.default.invite.findUnique;
const mockInviteCreate = prisma_1.default.invite.create;
const mockInviteFindMany = prisma_1.default.invite.findMany;
const mockInviteCount = prisma_1.default.invite.count;
const mockInviteDelete = prisma_1.default.invite.delete;
const mockListMember = prisma_1.default.listMember.findUnique;
const mockUserFindUnique = prisma_1.default.user.findUnique;
const mockTransaction = prisma_1.default.$transaction;
describe("Invites API", () => {
    // ─── POST /invites ────────────────────────────────────────────────────────
    describe("POST /invites", () => {
        it("returns 400 when listId or inviteeEmail is missing", async () => {
            const res = await (0, supertest_1.default)(app_1.default).post("/invites").set(AUTH).send({});
            expect(res.status).toBe(400);
        });
        it("returns 400 when role is invalid", async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post("/invites")
                .set(AUTH)
                .send({ listId: "list-1", inviteeEmail: "bob@example.com", role: "OWNER" });
            expect(res.status).toBe(400);
        });
        it("returns 403 when user is not the owner", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "MEMBER" });
            const res = await (0, supertest_1.default)(app_1.default)
                .post("/invites")
                .set(AUTH)
                .send({ listId: "list-1", inviteeEmail: "bob@example.com" });
            expect(res.status).toBe(403);
        });
        it("returns 201 when invite is sent successfully", async () => {
            mockListMember.mockResolvedValueOnce({ userId: "user-1", listId: "list-1", role: "OWNER" });
            mockUserFindUnique.mockResolvedValue({ id: "user-2", email: "bob@example.com" });
            mockListMember.mockResolvedValueOnce(null); // not already a member
            mockInviteFindUnique.mockResolvedValue(null); // no existing invite
            mockInviteCreate.mockResolvedValue({ id: "invite-1", listId: "list-1", inviteeId: "user-2" });
            const res = await (0, supertest_1.default)(app_1.default)
                .post("/invites")
                .set(AUTH)
                .send({ listId: "list-1", inviteeEmail: "bob@example.com" });
            expect(res.status).toBe(201);
        });
        it("returns 400 when invite already sent", async () => {
            mockListMember.mockResolvedValueOnce({ userId: "user-1", listId: "list-1", role: "OWNER" });
            mockUserFindUnique.mockResolvedValue({ id: "user-2", email: "bob@example.com" });
            mockListMember.mockResolvedValueOnce(null);
            mockInviteFindUnique.mockResolvedValue({ id: "invite-1" }); // existing invite
            const res = await (0, supertest_1.default)(app_1.default)
                .post("/invites")
                .set(AUTH)
                .send({ listId: "list-1", inviteeEmail: "bob@example.com" });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Invite already sent");
        });
    });
    // ─── PATCH /invites/:id ───────────────────────────────────────────────────
    describe("PATCH /invites/:id", () => {
        it("returns 400 when response is missing", async () => {
            const res = await (0, supertest_1.default)(app_1.default).patch("/invites/invite-1").set(AUTH).send({});
            expect(res.status).toBe(400);
        });
        it("returns 400 when response is invalid", async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/invites/invite-1")
                .set(AUTH)
                .send({ response: "MAYBE" });
            expect(res.status).toBe(400);
        });
        it("returns 403 when invite does not belong to user", async () => {
            mockInviteFindUnique.mockResolvedValue({
                id: "invite-1",
                inviteeId: "user-99", // different user
                status: "PENDING",
            });
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/invites/invite-1")
                .set(AUTH)
                .send({ response: "ACCEPTED" });
            expect(res.status).toBe(403);
        });
        it("returns 200 when invite is accepted", async () => {
            mockInviteFindUnique.mockResolvedValue({
                id: "invite-1",
                inviteeId: "user-1",
                status: "PENDING",
                listId: "list-1",
                role: "MEMBER",
            });
            mockTransaction.mockResolvedValue({ id: "invite-1", status: "ACCEPTED" });
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/invites/invite-1")
                .set(AUTH)
                .send({ response: "ACCEPTED" });
            expect(res.status).toBe(200);
        });
    });
    // ─── DELETE /invites/:id ──────────────────────────────────────────────────
    describe("DELETE /invites/:id", () => {
        it("returns 403 when invite does not exist", async () => {
            mockInviteFindUnique.mockResolvedValue(null);
            const res = await (0, supertest_1.default)(app_1.default).delete("/invites/invite-1").set(AUTH);
            expect(res.status).toBe(403);
        });
        it("returns 403 when user is not the list owner", async () => {
            mockInviteFindUnique.mockResolvedValue({ id: "invite-1", listId: "list-1", status: "PENDING" });
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "MEMBER" });
            const res = await (0, supertest_1.default)(app_1.default).delete("/invites/invite-1").set(AUTH);
            expect(res.status).toBe(403);
        });
        it("returns 204 when owner cancels invite", async () => {
            mockInviteFindUnique.mockResolvedValue({ id: "invite-1", listId: "list-1", status: "PENDING" });
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "OWNER" });
            mockInviteDelete.mockResolvedValue({});
            const res = await (0, supertest_1.default)(app_1.default).delete("/invites/invite-1").set(AUTH);
            expect(res.status).toBe(204);
        });
    });
    // ─── GET /invites ─────────────────────────────────────────────────────────
    describe("GET /invites", () => {
        it("returns paginated invites", async () => {
            mockInviteFindMany.mockResolvedValue([
                { id: "invite-1", listId: "list-1", list: { name: "My List" } },
            ]);
            mockInviteCount.mockResolvedValue(1);
            const res = await (0, supertest_1.default)(app_1.default).get("/invites").set(AUTH);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.total).toBe(1);
            expect(res.body.page).toBe(1);
            expect(res.body.totalPages).toBe(1);
        });
        it("returns 401 when no token provided", async () => {
            const res = await (0, supertest_1.default)(app_1.default).get("/invites");
            expect(res.status).toBe(401);
        });
    });
});
//# sourceMappingURL=invites.integration.test.js.map
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
    item: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
    list: {
        findUnique: jest.fn(),
    },
    listMember: {
        findUnique: jest.fn(),
    },
}));
const makeToken = (userId) => jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || "dev_secret");
const TOKEN = makeToken("user-1");
const AUTH = { Authorization: `Bearer ${TOKEN}` };
const mockItemFindUnique = prisma_1.default.item.findUnique;
const mockItemFindMany = prisma_1.default.item.findMany;
const mockItemCreate = prisma_1.default.item.create;
const mockItemUpdate = prisma_1.default.item.update;
const mockItemDelete = prisma_1.default.item.delete;
const mockItemCount = prisma_1.default.item.count;
const mockListFindUnique = prisma_1.default.list.findUnique;
const mockListMember = prisma_1.default.listMember.findUnique;
describe("Items API", () => {
    // ─── POST /lists/:listId/items ────────────────────────────────────────────
    describe("POST /lists/:listId/items", () => {
        it("returns 400 when name is missing", async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post("/lists/list-1/items")
                .set(AUTH)
                .send({});
            expect(res.status).toBe(400);
        });
        it("returns 403 when user is a VIEWER", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "VIEWER" });
            const res = await (0, supertest_1.default)(app_1.default)
                .post("/lists/list-1/items")
                .set(AUTH)
                .send({ name: "Milk" });
            expect(res.status).toBe(403);
        });
        it("returns 201 when item is created", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "MEMBER" });
            mockItemCreate.mockResolvedValue({ id: "item-1", name: "Milk", listId: "list-1" });
            const res = await (0, supertest_1.default)(app_1.default)
                .post("/lists/list-1/items")
                .set(AUTH)
                .send({ name: "Milk" });
            expect(res.status).toBe(201);
            expect(res.body.name).toBe("Milk");
        });
        it("returns 401 when no token provided", async () => {
            const res = await (0, supertest_1.default)(app_1.default).post("/lists/list-1/items").send({ name: "Milk" });
            expect(res.status).toBe(401);
        });
    });
    // ─── GET /lists/:listId/items ─────────────────────────────────────────────
    describe("GET /lists/:listId/items", () => {
        it("returns 403 when user is not a member and list is private", async () => {
            mockListFindUnique.mockResolvedValue({ visibility: "PRIVATE" });
            mockListMember.mockResolvedValue(null);
            const res = await (0, supertest_1.default)(app_1.default).get("/lists/list-1/items").set(AUTH);
            expect(res.status).toBe(403);
        });
        it("returns paginated items for a member", async () => {
            mockListFindUnique.mockResolvedValue({ visibility: "PRIVATE" });
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "MEMBER" });
            mockItemFindMany.mockResolvedValue([
                { id: "item-1", name: "Milk", checked: false },
                { id: "item-2", name: "Eggs", checked: false },
            ]);
            mockItemCount.mockResolvedValue(2);
            const res = await (0, supertest_1.default)(app_1.default).get("/lists/list-1/items").set(AUTH);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.total).toBe(2);
            expect(res.body.page).toBe(1);
            expect(res.body.totalPages).toBe(1);
        });
        it("allows public list access for non-members", async () => {
            mockListFindUnique.mockResolvedValue({ visibility: "PUBLIC" });
            mockListMember.mockResolvedValue(null);
            mockItemFindMany.mockResolvedValue([]);
            mockItemCount.mockResolvedValue(0);
            const res = await (0, supertest_1.default)(app_1.default).get("/lists/list-1/items").set(AUTH);
            expect(res.status).toBe(200);
        });
        it("caps limit at 100", async () => {
            mockListFindUnique.mockResolvedValue({ visibility: "PRIVATE" });
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "MEMBER" });
            mockItemFindMany.mockResolvedValue([]);
            mockItemCount.mockResolvedValue(0);
            const res = await (0, supertest_1.default)(app_1.default).get("/lists/list-1/items?limit=999").set(AUTH);
            expect(res.status).toBe(200);
            expect(res.body.limit).toBe(100);
        });
    });
    // ─── PATCH /lists/:listId/items/:itemId ───────────────────────────────────
    describe("PATCH /lists/:listId/items/:itemId", () => {
        it("returns 400 when nothing to update", async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/lists/list-1/items/item-1")
                .set(AUTH)
                .send({});
            expect(res.status).toBe(400);
        });
        it("returns 403 when user is a VIEWER", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "VIEWER" });
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/lists/list-1/items/item-1")
                .set(AUTH)
                .send({ checked: true });
            expect(res.status).toBe(403);
        });
        it("returns 403 when item does not belong to the list", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "MEMBER" });
            mockItemFindUnique.mockResolvedValue(null); // item not found in this list
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/lists/list-1/items/item-999")
                .set(AUTH)
                .send({ checked: true });
            expect(res.status).toBe(403);
        });
        it("updates item when user is a member", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "MEMBER" });
            mockItemFindUnique.mockResolvedValue({ id: "item-1", listId: "list-1", name: "Milk" });
            mockItemUpdate.mockResolvedValue({ id: "item-1", name: "Milk", checked: true });
            const res = await (0, supertest_1.default)(app_1.default)
                .patch("/lists/list-1/items/item-1")
                .set(AUTH)
                .send({ checked: true });
            expect(res.status).toBe(200);
            expect(res.body.checked).toBe(true);
        });
    });
    // ─── DELETE /lists/:listId/items/:itemId ──────────────────────────────────
    describe("DELETE /lists/:listId/items/:itemId", () => {
        it("returns 403 when user is a VIEWER", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "VIEWER" });
            const res = await (0, supertest_1.default)(app_1.default)
                .delete("/lists/list-1/items/item-1")
                .set(AUTH);
            expect(res.status).toBe(403);
        });
        it("returns 403 when item does not belong to the list", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "MEMBER" });
            mockItemFindUnique.mockResolvedValue(null);
            const res = await (0, supertest_1.default)(app_1.default)
                .delete("/lists/list-1/items/item-999")
                .set(AUTH);
            expect(res.status).toBe(403);
        });
        it("returns 204 when item is deleted", async () => {
            mockListMember.mockResolvedValue({ userId: "user-1", listId: "list-1", role: "MEMBER" });
            mockItemFindUnique.mockResolvedValue({ id: "item-1", listId: "list-1" });
            mockItemDelete.mockResolvedValue({});
            const res = await (0, supertest_1.default)(app_1.default)
                .delete("/lists/list-1/items/item-1")
                .set(AUTH);
            expect(res.status).toBe(204);
        });
    });
});
//# sourceMappingURL=items.integration.test.js.map
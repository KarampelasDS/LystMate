"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.updateItem = exports.getItems = exports.createItem = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createItem = async (listId, userId, name, url, quantity) => {
    const member = await prisma_1.default.listMember.findUnique({
        where: { userId_listId: { userId, listId } },
    });
    if (!member || member.role === "VIEWER")
        throw new Error("Forbidden");
    const item = await prisma_1.default.item.create({
        data: {
            listId,
            name,
            url,
            quantity,
        },
    });
    return item;
};
exports.createItem = createItem;
const getItems = async (listId, userId, page, limit) => {
    const list = await prisma_1.default.list.findUnique({
        where: { id: listId },
        select: { visibility: true },
    });
    const member = await prisma_1.default.listMember.findUnique({
        where: { userId_listId: { userId, listId } },
    });
    if (!member && list?.visibility !== "PUBLIC")
        throw new Error("Forbidden");
    const [items, total] = await Promise.all([
        prisma_1.default.item.findMany({
            where: { listId },
            orderBy: [{ checked: "asc" }, { createdAt: "asc" }],
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma_1.default.item.count({ where: { listId } }),
    ]);
    return {
        data: items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};
exports.getItems = getItems;
const updateItem = async (listId, itemId, userId, name, url, quantity, checked) => {
    const member = await prisma_1.default.listMember.findUnique({
        where: { userId_listId: { userId, listId } },
    });
    if (!member || member.role === "VIEWER")
        throw new Error("Forbidden");
    const item = await prisma_1.default.item.findUnique({
        where: { id: itemId, listId },
    });
    if (!item)
        throw new Error("Forbidden");
    const updatedItem = await prisma_1.default.item.update({
        where: { id: itemId },
        data: { name, url, quantity, checked },
    });
    return updatedItem;
};
exports.updateItem = updateItem;
const deleteItem = async (listId, itemId, userId) => {
    const member = await prisma_1.default.listMember.findUnique({
        where: { userId_listId: { userId, listId } },
    });
    if (!member || member.role === "VIEWER")
        throw new Error("Forbidden");
    const item = await prisma_1.default.item.findUnique({
        where: { id: itemId, listId },
    });
    if (!item)
        throw new Error("Forbidden");
    const deletedItem = await prisma_1.default.item.delete({
        where: { id: itemId },
    });
    return deletedItem;
};
exports.deleteItem = deleteItem;
//# sourceMappingURL=items.service.js.map